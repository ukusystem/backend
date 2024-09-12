import { RowDataPacket, ResultSetHeader } from "mysql2";
import { executeQuery, executeBatchForNode, userExist } from "./dbManager";
import { CameraMotionManager } from "../../camera";
import { CameraForFront } from "./frontend/camaraForFront";
import { ResultCode } from "./resultCode";
import { AtomicNumber } from "./atomicNumber";
import { DataStruct } from "./dataStruct";
import { ParseType, States, Result } from "./enums";
import { IntTuple } from "./intTuple";
import { IntConsumer } from "./types";
import { Camera } from "./camera";
import { Encryption } from "./encryption";
import { Message } from "./message";
import { Bundle } from "./bundle";
import { Logger } from "./logger";
import { Mortal } from "./mortal";
import util from "util";
import { appConfig } from "../../../configs";
import * as cp from "child_process";
import * as queries from "./queries";
import * as useful from "./useful";
import * as net from "net";
import * as codes from "./codes";
import * as db2 from "./db2";
import * as sm from "../../../controllers/socket";
import { Main } from "./main";
import { dns_v1beta2 } from "googleapis";

/**
 * Base attachment for the sockets
 */
export class BaseAttach extends Mortal {
  static readonly PROCESS_TIMEOUT = 60 * 1000;
  static readonly UNREACHABLE_INTERVAL_MS = 60 * 1000;
  static readonly DEFAULT_ADDRESS = "0.0.0.0";
  private static readonly BASE_NODE_NAME = "nodo";

  /**
   * Inner socket used for communication with the controllers and managers.
   */
  _currentSocket: net.Socket | null = null;

  /**
   * This queue holds the messages that are pending to be sent. The messages
   * should be send in the same order that they were added and they should be
   * removed only after they are sent to ensure that no one is lost. This queue is
   * NEVER going to be emptied manually UNLESS
   * the socket is going to be completely discarded, for example, when the back
   * end is ending its execution or the other end of the channel is not recognized
   * as valid, as in a failed log in. When opening a new channel for a controller,
   * the object attached should preserve the previous messages.
   */
  private sendBuffer: Message[] = [];
  /**
   * This table holds the messages that were sent successfully and that are
   * waiting for a response. This table should NEVER be emptied with
   * ``clear()``.
   */
  private readonly pendingMessages = new Map<number, Message>();
  /**
   * Data that has been received and pending to process
   */
  private readonly receivedData: Buffer[] = [];

  /**
   * True when the socket should close after the next message is send. When true,
   * no messages will be read.
   */
  _closeOnNextSend = false;

  /**
   * True when this attachment can be looked for from the list of keys'
   * attachments. useful when canceling a key, so its attachment can not be
   * 'found' when searching by ID.
   */
  _selectable = true;
  /**
   * Logger to use by this object.
   */
  readonly _logger: Logger;
  /**
   * Name to use before any message logged from this object. This is usually based
   * on some name, like the controller's name.
   */
  _tag = "]unknown[";
  _buffer = "";

  private previousMessageSent = true;

  constructor(logger: Logger) {
    super();
    this._logger = logger;
  }

  /**
   * Create a custom message. The caller must ensure that the structure of the message is correct.
   * @param message New message.
   * @param logOnSend Whether to log the message when it is sent.
   */
  _addMirrorMessage(message: string, logOnSend: boolean) {
    this._addOne(new Message(0).reset(message).setLogOnSend(logOnSend));
  }

  addData(buffer: Buffer) {
    this.receivedData.push(buffer);
  }

  /**
   * Add a message to the list of messages that expect a response.
   * @param message The message waiting for a response.
   * @returns True if the message was added, false otherwise.
   */
  private addPendingMessage(message: Message): boolean {
    if (message.responseExpected || message.forceAddToPending) {
      this.pendingMessages.set(message.messageID, message);
      return true;
    }
    return false;
  }

  /**
   * Send one message from the buffer of messages. Blocks until the message is
   * sent, an error occurs or, if the channel is non-blocking, until the output
   * buffer is full. Send only if the channel is connected because the call to
   * select triggers all keys periodically and a message could be sent when the
   * socket is disconnected. Can cancel the key if {@linkcode closeOnNextSend} is true
   * or {@linkcode programmedToBeDisposed} is true and the {@linkcode sendBuffer} is
   * empty.
   *
   * @param selector
   */
  sendOne(selector: Selector) {
    // Try send
    if (this.previousMessageSent && this.sendBuffer.length > 0 && Selector.isChannelConnected(this._currentSocket)) {
      try {
        const first = this.sendBuffer[0];
        if (first) {
          const bb = Buffer.from(first.message);
          this.previousMessageSent = false;
          this._currentSocket?.write(bb, () => {
            this.previousMessageSent = true;
          });
          if (first.logOnSend) {
            this._log(`Sent '${useful.trimString(first.message)}'`);
          }
          this.addPendingMessage(first);
          this.sendBuffer.shift();
        }
      } catch (e: any) {
        this._log("IO Exception sending bytes. Message was not removed.");
        this._log(e.toString());
      }
      if (this._closeOnNextSend) {
        selector.cancelChannel(this);
        this._log("Channel was programmed to close on next send. Closed.");
      }
    }
  }

  /**
   * Like {@linkcode simpleReconnect} but this method logs a
   * message.
   *simpleReconnect
   * @see {@linkcode simpleReconnect}
   */
  reconnect(selector: Selector) {
    // Abort when the socket is already destroyed (null). This can happen when a
    // manager has disconnected abruptly, for example, by pulling the wires.
    if (!this._currentSocket) {
      return;
    }
    if (BaseAttach.simpleReconnect(selector, this)) {
      this._log("Manager can now be accepted.");
    }
    this.printKeyCount(selector);
  }

  /**
   * Reconnect the channel if its attachment is a {@linkcode NodeAttach}. The same connection data in the
   * attachment is used. By design, channels with {@linkcode ManagerAttach}
   * attachments are never reconnected by the backend. This will reconnect the
   * channel when the controller has properly closed its side sending an end of
   * stream. For now, this only happens on a reset by command and may happen after
   * changing connection data.
   * The socket is always closed as soon as possible and the new connection can be delayed {@linkcode UNREACHABLE_INTERVAL_MS} ms.
   *
   * @param selector Selector to register the channel to.
   * @param key      Key holding the attachment.
   * @param unreachable Whether to delay the connection for {@linkcode UNREACHABLE_INTERVAL_MS} ms.
   * @returns True if the attachment was a {@linkcode ManagerAttach}, false otherwise.
   */
  static simpleReconnect(selector: Selector, key: BaseAttach, unreachable: boolean = false): boolean {
    if (selector.cancelChannel(key)) {
      return true;
    } else {
      const nodeAttach = <NodeAttach>key;
      if (key instanceof NodeAttach) {
        // Delay connection if was unreachable
        setTimeout(
          () => {
            nodeAttach.tryConnectNode(selector, true);
          },
          unreachable ? this.UNREACHABLE_INTERVAL_MS : 1
        );
      }
    }
    return false;
  }

  /**
   * 
   * @param nodeID 
   * @param month 
   * @param year 
   * @param current 
   * @returns 
   * @deprecated
   */
  static async _checkTablesStatic(nodeID: number, month: number, year: number, current: boolean): Promise<boolean> {
    const nodeDB = BaseAttach.getNodeDBName(nodeID);
    if (current) {
      // Verify that a temperature table of the current year exists.
      if (!(await BaseAttach.createTables(nodeDB, year))) {
        return false;
      }
    }
    // Next year's table
    if (month >= 11) {
      if (!(await BaseAttach.createTables(nodeDB, year + 1))) {
        return false;
      }
    }
    return true;
  }

  /**
   * 
   * @param name 
   * @param year 
   * @returns 
   * @deprecated
   */
  private static async createTables(name: string, year: number): Promise<boolean> {
    let result =
      !!(await executeQuery<ResultSetHeader>(util.format(queries.createTemperatureTable, name, year, year, name))) &&
      !!(await executeQuery<ResultSetHeader>(util.format(queries.createEnergyTable, name, year, year, name))) &&
      !!(await executeQuery<ResultSetHeader>(util.format(queries.createInputRegistreTable, name, year, year))) &&
      !!(await executeQuery<ResultSetHeader>(util.format(queries.createOutputRegistreTable, name, year, year)));
    return result;
  }

  /**
   * Attach one piece of data previously received to a buffer and parses the complete messages, saving the incomplete
   * ones to a field.
   *
   * @param selector Selector containing the channels in use. Maybe be used to
   *                 perform actions based on the commands received.
   * @param code     Object to store a code to fire actions after this method
   *                 return.
   * @param bundle    Data to process after the methos ends.
   */
  async readOne(selector: Selector, code: ResultCode, bundle: Bundle) {
    // Socket will close after a message
    if (this._closeOnNextSend) return;
    const piece = this.receivedData.shift();
    if (!piece) {
      return;
    }
    const received = piece.toString("utf8");
    if (received.length === 0) {
      this._log("Empty message received.");
    } else if (received.length > 0) {
      // It is still alive
      this.setAlive();
      // Use data
      this._buffer += received;
      // this._log(`Buffer to process: '${this._buffer}'`)
      const commands = this._buffer.split(codes.SEP_EOL);
      // consolethis._log\(commands)
      for (let i = 0; i < commands.length - 1; i++) {
        if (commands[i].length > 0) {
          // System.out.println(commands[i])
          const partsArray = commands[i].split(codes.SEP_CMD);
          // Get command or value and id. These are the minimum components of a message.
          const cmdRes = this._parseMessage(partsArray, queries.cmdAndIDParse);
          if (cmdRes) {
            const cmdOrValue = cmdRes[0].getInt();
            const id = cmdRes[1].getInt();
            if (this.parseResponse(partsArray, cmdOrValue, id, commands[i])) {
              //this._log('Message was a response.')
            } else if (await this._processMessage(selector, partsArray, cmdOrValue, id, commands[i], code, bundle)) {
              //this._log('Message was not a response, but was processed by a subclass.')
            } else {
              this._log(`Unknown command '${commands[i]}'. Command = 0x${cmdOrValue.toString(16)} ID = ${id}`);
              this.#addUnknownCmd(id);
            }
          } else {
            this._log(`Error parsing command and id, one or both are missing. Received '${commands[i]}'`);
          }
        } else {
          this._log("Command received is empty.");
        }
      }
      this._buffer = commands[commands.length - 1];
      // this._log(`Buffer left: '${this._buffer}'`)
    }
  }

  /**
   * Parse the message and perform actions based on its values.
   *
   * @param selector   Selector containing the channels in use. Used to get
   *                   channel used with controllers.
   * @param parts      List of strings to parse.
   * @param cmdOrValue The command or value that is the header of the message
   *                   being parsed.
   * @param id         The id of the message being parsed.
   * @param command    The full command received.
   * @param code       Object to save a code to fire an action after this method
   *                   returns.
   * @param bundle Data to process after the method ends.
   * @returns True if the header was a known command or value, false otherwise.
   *         Even when the sub-command or value is unknown, this returns true as
   *         long as the header is known.
   */
  async _processMessage(selector: Selector, parts: string[], cmdOrValue: number, id: number, command: string, code: ResultCode, bundle: Bundle): Promise<boolean> {
    return false;
  }

  /**
   * Parse the message if and only if it is a response.
   *
   * @param parts      The parts of the message.
   * @param cmdOrValue The whole text received as command.
   * @param id         ID of the message received.
   * @param command    The complete command received.
   */
  private parseResponse(parts: string[], cmdOrValue: number, id: number, command: string): boolean {
    if (cmdOrValue === codes.CMD_RESPONSE) {
      //this._log('Received response '%s'', command)
      const responseData = new DataStruct();
      const responseRes = this.getNextOrSendError(parts, queries.tupleInt, responseData, id, false);
      if (responseRes) {
        // this._log(`Response to ${id} 0x${responseData.getInt().toString(16)}`)
        this.removePendingMessageByID(id, responseData.getInt());
      } else {
        this._log("Could not process response.");
      }
      return true;
    }
    return false;
  }

  /**
   * Look for and remove a pending message by ID. Execute the action attached to
   * the message, if any.
   *
   * @param id        ID of the message to remove.
   * @param code      Code of the response. It's normal use is an operation end
   *                  code. Can be used to pass any value, though.
   * @param logFinish Whether to log the finish message. Normally, the code is
   *                  logged as a response code.
   * @param execute Whether to execute the action.
   * @returns True if the message was found and removed.
   */
  removePendingMessageByID(id: number, code: number, logFinish: boolean = true, execute: boolean = true): boolean {
    if (this.pendingMessages.has(id)) {
      const finished = this.pendingMessages.get(id);
      if (finished && this.pendingMessages.delete(id)) {
        if (logFinish && finished.logOnResponse) {
          this._log(`Message ${id} ended with code 0x${code.toString(16)}.`);
        }
        if (finished.action && execute) {
          finished.action(code);
        }
        return true;
      } else {
        this._log(`Message ${id} doesn't exist in pending list.`);
      }
    }
    return false;
  }

  /**
   * Update an item to an existing row of a table in a database.
   *
   * @param name        Name of the type of element to save. Used for logging.
   * @param items       List of data to save to each column. The id of the row to
   *                    save the item to, must be the FIRST element in the list.
   *                    This id will be displaced to the last position to match
   *                    the list of parameters in the query. If this parameter is
   *                    empty, this method does nothing.
   * @param updateQuery Query with the UPDATE clause. The id parameter of the row
   *                    must be the last parameter, usually in a WHERE clause. The
   *                    name of the database in the query can contain one format
   *                    specifier and it will be formatted based on ``nodeID``.
   * @param id          ID of the message being processed.
   * @param nodeID      ID of the node (database) in which write the item. This is
   *                    used to build the database name. If negative, the query
   *                    will not be formatted.
   * @returns True if the operation was successful, false otherwise or if
   *         ``items`` is empty.
   */
  async _updateItem(name: string, items: DataStruct[] | null, updateQuery: string, id: number, nodeID: number = -1): Promise<boolean> {
    if (!items) return false;
    // Copy the array of items displaced one item to the left and the first one
    // copied in the last position.
    const params: Object[] = [];
    for (let i = 0; i < items.length - 1; i++) {
      params.push(items[i + 1].selected);
    }
    params.push(items[0].selected);
    return await this._saveItemGeneral(name, params, updateQuery, id, nodeID);
  }

  /**
   * Insert a row into a table in a database.
   *
   * @param name        Name of the type of element to save. Used for logging.
   * @param items       List of data to save to each column. The order of the
   *                    items must be the same as the requested by the query.
   * @param insertQuery Query with the INSERT clause. The name of the database in
   *                    the query can contain one format specifier and it will be
   *                    formatted based on ``nodeID``.
   * @param id          ID of the message being processed.
   * @param nodeID      ID of the node (database) in which write the item. This is
   *                    used to build the database name. If negative, the query
   *                    will not be formatted.
   * @returns True if the operation was successful, false otherwise or if
   *         ``items`` is empty.
   */
  async _insertItem(name: string, items: DataStruct[] | null, insertQuery: string, id: number, nodeID: number = -1): Promise<boolean> {
    if (!items) return false;
    // Extract the selected field in each item.
    const params: any[] = [];
    for (let i = 0; i < items.length; i++) {
      params[i] = items[i].selected;
    }
    return await this._saveItemGeneral(name, params, insertQuery, id, nodeID);
  }

  /**
   * Base method to save an item in a table in a database. Basically, execute a
   * statement, usually an UPDATE or INSERT, with a list of parameters.
   *
   * @param name       Name of the type of element to save. Used for logging.
   * @param parameters Objects used as parameters for the prepared statement.
   *                   These objects must be of the types required by the
   *                   statement, but casted to an Object. The order of the
   *                   parameters must also be the same as the required by the
   *                   query.
   * @param query      Query to format (formatting the query is optional) and execute.
   * @param id         ID of the message being processed.
   * @param nodeID     ID of the node in which write the item. This is used to
   *                   build the database name. If negative, the query will not be
   *                   formatted.
   * @returns True if the operation was successful, false otherwise.
   */
  async _saveItemGeneral(name: string, parameters: any[], query: string, id: number, nodeID: number): Promise<boolean> {
    this._log(`Received: ${name}`);
    if (await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(query, nodeID), parameters)) {
      this._addResponse(id, codes.AIO_OK);
      return true;
    } else {
      this._log(`Error saving item: ${name}`);
      this._addResponse(id, codes.ERR_EXECUTING_QUERY);
    }
    return false;
  }

  /**
   * Add a list of items from an array to the sending buffer. Each cell
   * will be casted to a {@linkcode String} and used to build a {@linkcode Message}.
   *
   * @param value      Command value to use in each message.
   * @param valueEnd   Command value to use in the end message.
   * @param rows       Rows of data to send. If ``null``, this method does nothing.
   * @param endID      Message ID to use in the end message.
   * @param logOnSend  True to log the send of each message.
   * @param nextID     The value of ``AUTO_INCREMENT`` for the table
   *                   containing the rows.
   * @param sendNextID True to send the ``AUTO_INCREMENT``. If ``nextID``
   *                   is empty, this method does nothing.
   */
  _addListNoEmpty(value: number, valueEnd: number, rows: RowDataPacket[] | null, endID: number, logOnSend: boolean, nextID: RowDataPacket[] | null = null, sendNextID: boolean = false) {
    if (!rows || (!nextID && sendNextID)) {
      // consolethis._log(nextID?'Next':'Next null')
      // consolethis._log(rows ? 'Rows' : 'Rows null')
      this._log("Error getting rows or AUTO_INCREMENT");
      return;
    }

    let count = 0;
    // Add individual items
    // consolethis._log( Object.values(rows[10]) )
    for (let packet of rows) {
      let body = [];
      const values = Object.values(packet);
      for (let j = 0; j < values.length; j++) {
        const cell = values[j].toString();
        body.push(cell === null ? "NULL" : cell);
      }
      this._addOne(new Message(value, 0, body).setLogOnSend(logOnSend));
      count++;
    }
    // this._log(`Added ${count} items with value 0x${value.toString(16)}`);
    // Add end of items
    let autoIncrement = 0;
    // At this point it is not certain that nextID is present
    if (nextID && nextID.length === 1) {
      autoIncrement = nextID[0].AUTO_INCREMENT;
    }
    this._addEnd(valueEnd, endID, autoIncrement);
    // this._log(`Added end with value 0x${valueEnd.toString(16)}`);
  }

  /**
   * Add a message with an end message to the sending queue.
   *
   * @param endValue Header for the end message.
   * @param id       ID of the message. Usually the ID of the message that
   *                 requested a list of items (``CMD_GET_CONFIG``).
   * @param nextID   Value of ``AUTO_INCREMENT`` for this list (the list comes from a
   *                 table). Can be 0 or negative to ignore this value and send
   *                 only the end value.
   */
  _addEnd(endValue: number, id: number, nextID: number) {
    this._addOne(new Message(endValue, id, nextID > 0 ? [nextID.toString()] : []));
  }

  /**
   * Format a query with the database name of one node. The query must have only
   * one field to format.
   *
   * @param query  Query to format.
   * @param nodeID ID of the node. If zero or negative, the same query is returned.
   * @returns The formatted query.
   */
  static formatQueryWithNode(query: string, nodeID: number): string {
    return nodeID > 0 ? util.format(query, BaseAttach.getNodeDBName(nodeID)) : query;
  }

  /**
   * Add a {@linkcode codes.CMD_CTRL_CONFIRM} message. This is used when the controller
   * confirmed that it applied the changes.
   *
   * @param id ID of the message being responded.
   */
  _addControllerConfirmation(id: number) {
    this._addOne(new Message(codes.CMD_CTRL_CONFIRM, id));
  }

  /**
   * Add a {@linkcode codes.ERR_UNKNOWN_CMD} message with the current server
   * timestamp.
   *
   * @param id ID of the message that this method is responding to.
   */
  #addUnknownCmd(id: number) {
    this._addResponse(id, codes.ERR_UNKNOWN_CMD);
  }

  /**
   * Add a {@linkcode codes.ERR_UNKNOWN_VALUE} message with the current server
   * timestamp.
   *
   * @param id ID of the message that this method is responding to.
   */
  _addUnknownValue(id: number) {
    this._addResponse(id, codes.ERR_UNKNOWN_VALUE);
  }

  /**
   * Clear all remaining messages, signal to close the channel after the next send
   * and add a {@link codes.ERR_ANOTHER_CONNECTED}. The channel is supposed to be
   * connected, so it should send the message added like any other and close the
   * channel afterwards.
   *
   * @param id ID of the message that this one is responding to.
   */
  _addAnotherConnected(id: number) {
    this.sendBuffer = [];
    this._closeOnNextSend = true;
    this._addResponse(id, codes.ERR_ANOTHER_CONNECTED);
  }

  /**
   * Add a {@link codes.CMD_HELLO_FROM_SRVR} message with the current server
   * timestamp.
   *
   * @param id ID of the message that this method is responding to.
   */
  addHello(id: number, userID: number) {
    this._addOne(new Message(codes.CMD_HELLO_FROM_SRVR, id, [useful.timeInt().toString(), userID.toString()]));
  }

  /**
   * Try to convert each part of a list of strings into a type in a list of types.
   * Send a message if the operation fails.
   *
   * @param parts        List of string to convert to a type.
   * @param typeErrors   List of objects containing the type to convert to and the
   *                     error to send when the operation fails. One object for
   *                     each part that is required to convert. This list controls
   *                     how many items in `parts` will be parsed. If this list is
   *                     longer than `parts`, an error is guaranteed.
   * @param id           ID of the error message to send.
   * @param sendResponse true to send the error message if the operation fails,
   *                     false to ignore the error.
   * @returns A list of {@linkcode DataStruct} containing the parsed data. Each {@linkcode DataStruct}
   *         will have the parsed data in the corresponding field according to the
   *         type that was requested to parse to.
   */
  _parseMessage(parts: string[], typeErrors: IntTuple[], id: number = 0, sendResponse: boolean = true): DataStruct[] | null {
    const data: DataStruct[] = [];
    for (let i = 0; i < typeErrors.length; i++) {
      data.push(new DataStruct());
      const res = this.getNextOrSendError(parts, typeErrors[i], data[i], id, sendResponse);
      if (!res) {
        return null;
      }
    }
    return data;
  }

  _notifyCard(serie: number, admin: number, authorized: number, date: string, co_id: number, ea_id: number, type: number, ctrl_id: number) {
    this._log("Notifying web about card.");
    const newEntry = new sm.RegistroAccesoSocketBad({
      // ra_id: 1, // No va
      serie: serie,
      administrador: admin,
      autorizacion: authorized ? 1 : 0,
      fecha: date,
      co_id: co_id, // Can be 0 or positive
      ea_id: ea_id,
      tipo: type,
      sn_id: 1,
      // contrata: DEF_TXT, // No va
      ctrl_id: ctrl_id,
    });
    sm.RegistroAccesoMap.add(newEntry);
  }

  _notifyEnergy(
    meID: number,
    nodeID: number,
    active: number | null = null,
    // serie: string | null = null,
    desc: string | null = null,
    voltaje: number | null = null,
    amperaje: number | null = null,
    fdp: number | null = null,
    frecuencia: number | null = null,
    potenciaw: number | null = null,
    potenciakwh: number | null = null
  ) {
    const newEnergy = new sm.MedEnergiaBadVO({
      me_id: meID,
      descripcion: desc,
      voltaje: voltaje,
      amperaje: amperaje,
      fdp: fdp,
      frecuencia: frecuencia,
      potenciaw: potenciaw,
      potenciakwh: potenciakwh,
      activo: active,
      ctrl_id: nodeID,
    });
    if (active === 0) {
      sm.ModuloEnergiaManager.delete(newEnergy);
    } else {
      sm.ModuloEnergiaManager.add_update(newEnergy);
    }
  }

  _notifyTemp(stID: number, nodeID: number, active: number | null = null, current: number | null = null, serie: string | null = null, desc: string | null = null) {
    const newTemp = new sm.SenTemperaturaBadVO({
      activo: active,
      actual: current,
      ctrl_id: nodeID,
      serie: serie,
      st_id: stID,
      ubicacion: desc,
    });
    // this._log('Notifying web about tempertaure.')
    if (active === 0) {
      sm.SensorTemperaturaManager.delete(newTemp);
    } else {
      sm.SensorTemperaturaManager.add_update(newTemp);
    }
  }

  /**
   * Send a notification to the web app that one pin has changed some of its states.
   * The web app should be able to handle the ``null`` values.
   * @param resgister Whether to send it to the 'alerts' section as well.
   * @param pin The pin that changed.
   * @param ee_id Detector connected to the pin.
   * @param desc Description of thep pin.
   * @param state State of the pin (active or inactive).
   * @param active Enable state of the pin.
   * @param date Date of the event.
   */
  _notifyInput(
    resgister: boolean,
    pin: number,
    nodeID: number,
    ee_id: number | null = null,
    desc: string | null = null,
    state: number | null = null,
    active: number | null = null,
    date: string | null = null
  ) {
    // this._log(`Notifying web about input.`);
    const newInput = new sm.PinesEntradaSocketBad({
      pe_id: pin,
      pin: pin,
      ee_id: ee_id,
      descripcion: desc,
      estado: state,
      activo: active,
      ctrl_id: nodeID,
    });
    // To disable the pin
    if (active === 0) {
      sm.PinEntradaManager.delete(newInput);
    }
    // To enable or update data
    else {
      sm.PinEntradaManager.add_update(newInput);
    }
    // To show in the 'alerts' section
    if (resgister && state && date) {
      sm.RegistroEntradaMap.add(new sm.RegistroEntradaSocketBad({ pin: pin, estado: state, fecha: date, ctrl_id: nodeID }));
    }
  }

  _notifyOutput(
    pin: number,
    auto: boolean,
    nodeID: number,
    es_id: number | null = null,
    desc: string | null = null,
    state: number | null = null,
    active: number | null = null,
    order: number | null = null
  ) {
    // this._log(`Notifying web about output.`);
    const newOutput = new sm.PinSalidaSocketBad({
      ps_id: pin,
      pin: pin,
      es_id: es_id,
      descripcion: desc,
      estado: state,
      activo: active,
      automatico: auto,
      ctrl_id: nodeID,
      orden: order,
    });
    // To disable the pin
    if (active === 0) {
      sm.PinSalidaManager.delete(newOutput);
    }
    // To enable or update data
    else {
      sm.PinSalidaManager.add_update(newOutput);
    }

    // Curently there is not a real time resgister for the outputs
    // sm.RegistroSalidasMap
  }

  /**
   * Try to convert the first item in <code>parts</code> to the type specified in
   * ``type``. Remove the converted item from the list if the conversion
   * was successful.
   *
   * @param parts        List of strings to get the string to parse.
   * @param typeError    Tuple containing the type to convert the item to and the
   *                     error value to send to the socket when the list is empty,
   *                     the conversion failed or the type requested is unknown.
   * @param id           ID of the message to send when an error occurs.
   * @param sendResponse true to send a message when an error occurs.
   * @param data         Object to store the data converted. The field used to
   *                     store the data depends of the type requested.
   * @returns true if the conversion was successful, false otherwise.
   */
  private getNextOrSendError(parts: string[], typeError: IntTuple, data: DataStruct, id: number, sendResponse: boolean): boolean {
    let success = true;
    if (parts.length > 0) {
      const currentPart = parts[0];
      switch (typeError.item1) {
        case ParseType.TYPE_LONG:
        case ParseType.TYPE_INT:
        case ParseType.TYPE_BIG:
          const Numberresult = parseInt(currentPart, 10);
          if (isNaN(Numberresult)) {
            success = false;
          } else {
            data.setNumber(Numberresult);
          }
          break;
        case ParseType.TYPE_FLOAT:
          const Floatresult = parseFloat(currentPart);
          if (isNaN(Floatresult)) {
            success = false;
          } else {
            data.setNumber(Floatresult);
          }
          break;
        case ParseType.TYPE_STR:
          data.setString(currentPart);
          break;
        default:
          this._log(`Data type requested is unknown (${typeError.item1})`);
          success = false;
      }
      if (success) {
        parts.splice(0, 1);
      } else {
        this._log(`Error converting '${currentPart}' to type ${typeError.item1}`);
      }
    } else {
      success = false;
      this._log(`Error 0x${typeError.item2.toString(16)} getting next part of type ${typeError.item1}. List is empty`);
    }
    if (!success) {
      if (sendResponse) {
        this._addResponse(id, typeError.item2);
      }
    }
    return success;
  }

  /**
   * Add one message to the output queue if this instance is not programmed to be
   * disposed. All messages should be added through this method to control which
   * ones and when it is possible to add.
   *
   * @param message Message object to queue
   * @returns The ID of the message just added.
   */
  _addOne(message: Message): number {
    this.sendBuffer.push(message);
    // this._log(message.toString())
    return message.messageID;
  }

  /**
   * Add a message with header {@linkcode codes.CMD_RESPONSE} and a code.
   *
   * @param id        ID of the message that this method is responding to.
   * @param okOrError Response code.
   */
  _addResponse(id: number, okOrError: number) {
    this._addOne(new Message(codes.CMD_RESPONSE, id, [okOrError.toString()]));
  }

  /**
   * Build a database name.
   *
   * @param id ID of the node.
   * @returns The database name of the node.
   */
  static getNodeDBName(id: number): string {
    return `${BaseAttach.BASE_NODE_NAME}${id}`;
  }

  /**
   * Log a message appending the {@linkcode BaseAttach._tag} field at the beginning.
   *
   * @param message Text to log
   */
  _log(message: string) {
    this._logger.log(this.getTaggedMessage(message));
  }

  private getTaggedMessage(message: string): string {
    return this._tag + " " + message;
  }

  _logFeelThroughHex(value: number) {
    this._log(`Value fell through ${value.toString(16)}`);
  }

  printKeyCount(selector: Selector) {
    this._log(`Attachs: Node ${selector.nodeAttachments.length} Manager ${selector.managerConnections.length}`);
  }
}

/**
 * Attachment for channels related to controllers
 */
export class NodeAttach extends BaseAttach {
  /**
   * The controller sends temperature readings in a periodo of 3 seconds.
   * Saving the readings each minute gives
   * 60*24*365 = 525,600 rows per year per sensor (x16 = 8,409,600)
   * Saving each 5 minutes gives 105,120 rows per year per sensor (x16 = 1,681,920)
   */
  private static readonly TEMP_SAVE_INTERVAL_S = 5 * 60;
  private lastTempStamp = 0;

  private static readonly POWER_SAVE_INTERVAL_S = 5 * 60;
  private lastPowerStamp = 0;

  private unreached = false;

  readonly controllerID;
  private node = "";
  private port;
  private ip;
  private user;
  private password;

  /**
   * @deprecated
   */
  private inputAI = 0;
  /**
   * @deprecated
   */
  private outputAI = 0;
  /**
   * @deprecated
   */
  private tempAI = 0;
  /**
   * @deprecated
   */
  private energyAI = 0;

  /**
   * Used to get the connection state of the socket for the manager. This is true
   * when the socket is logged in to the controller (i.e. a
   * {@linkcode codes.CMD_HELLO_FROM_CTRL} has been received). Is set to false when
   * the socket is programmed to closed.
   */
  loggedToController = false;

  constructor(nodeID: number, nodeName: string, nodeIP: string, nodePort: number, nodeUser: string, nodePassword: string, currentLogger: Logger) {
    super(currentLogger);
    this.controllerID = nodeID;
    this.setName(nodeName);
    this.ip = nodeIP;
    this.port = nodePort;
    this.user = nodeUser;
    this.password = nodePassword;
  }

  get getIP(): string {
    return this.ip;
  }

  get getPort(): number {
    return this.port;
  }

  setIncrements(input:number, output:number, temp:number, energy:number){
    if(this.inputAI===0 && this.outputAI===0 && this.tempAI=== 0 && this.energyAI===0){
      this.inputAI = input
      this.outputAI = output
      this.tempAI = temp
      this.energyAI = energy
    }
    this._log(`${this.inputAI} ${this.outputAI} ${this.tempAI} ${this.energyAI}`);
  }

  static getInstanceFromPacket(data: db2.Controlador2, logger: Logger): NodeAttach {
    return new NodeAttach(data.ctrl_id, data.nodo, data.ip, data.puerto, data.usuario, data.contraseña, logger);
  }

  /**
   *
   * @param date Original timetamp in seconds.
   * @returns A valid value accepted by the database.
   */
  fixDateNumber(date: number): number {
    if (date < 10) {
      this._log("Date was less than 10 seconds");
      return (date = 10);
    }
    return date;
  }

  async _processMessage(selector: Selector, parts: string[], cmdOrValue: number, id: number, command: string, code: ResultCode, bundle: Bundle): Promise<boolean> {
    switch (cmdOrValue) {
      case codes.CMD_KEEP_ALIVE:
        // It doesn't matter if setAlive() is called in this block, since any message
        // received from the channel is a signal that it is alive.
        //this._log("Keep alive signal received %d.", lastTimeAlive)
        break;
      case codes.CMD_POWER:
        // this._log(`Received power measure '${command}'`);
        const onePower = this._parseMessage(parts, queries.powerParse);
        if (!onePower) {
          break;
        }
        const power = onePower;
        // me_id, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, fecha
        const medidorID = power[1].getInt();
        const voltaje = power[2].getInt();
        const amperaje = power[3].getInt();
        const fdp = power[4].getInt();
        const frecuencia = power[5].getInt();
        const potenciaw = power[6].getInt();
        const potenciakwh = power[7].getInt();
        const fecha = useful.formatTimestamp(power[0].getInt());
        // const powerYear = useful.getYearFromTimestamp(power[0].getInt());

        // Save all the readings periodically
        const powerStamp = this.fixDateNumber(power[0].getInt());
        if (powerStamp >= this.lastPowerStamp + NodeAttach.POWER_SAVE_INTERVAL_S) {
          const powerQuery = util.format(queries.insertPower, BaseAttach.getNodeDBName(this.controllerID))
          if (await executeQuery<ResultSetHeader>(powerQuery, [medidorID, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, fecha])) {
            this._log(`Inserted power`);
          } else {
            this._log(`Error saving power`);
          }
          
          this.lastPowerStamp = powerStamp;
        }

        // Notify web about the energy
        this._notifyEnergy(medidorID, this.controllerID, null, null, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh);

        break;
      case codes.CMD_TEMP:
        // this._log(`Received temp: '${command}'`)
        let oneTempOptional = this._parseMessage(parts, queries.longParse);
        // Print temperatures. Not practical since a lot of controllers will send data.
        if (!oneTempOptional) {
          this._log("Wrong temperature format. No date.");
          break;
        }
        let oneTemp = oneTempOptional;
        // The commented lines are used to print the values of the temperatures. That is
        // an extra process that is not necessary.
        // StringBuffer sb = new StringBuffer()
        // sb.append(useful.formatTimestamp(oneTemp[0].getBig()))
        // sb.append(":")
        // Get time of the measure
        const tempStamp = this.fixDateNumber(oneTemp[0].getInt());
        const currDate = useful.formatTimestamp(tempStamp);
        // const tempYear = useful.getYearFromTimestamp(tempStamp);
        // Get individual measures
        const paramsForRegister: any[] = [];
        // const paramsForCurrent: any[] = [];
        // Parse every sensor reading from the message
        while (parts.length !== 0) {
          oneTempOptional = this._parseMessage(parts, queries.tempParse, 0, false);
          if (!oneTempOptional) continue;
          oneTemp = oneTempOptional;
          const sensorID = oneTemp[0].getInt();
          const sensorRead = oneTemp[1].getInt();

          paramsForRegister.push([ sensorID, sensorRead, currDate]);

          // Send the data to the web app
          this._notifyTemp(sensorID, this.controllerID, null, sensorRead, null, null);
        }

        // Save all the readings periodically
        if (tempStamp >= this.lastTempStamp + NodeAttach.TEMP_SAVE_INTERVAL_S) {
          await executeBatchForNode(queries.insertTemperature, this.controllerID, paramsForRegister);
          this.lastTempStamp = tempStamp;
        }

        // this._log("Received temperatures " + sb.toString())
        // this._log("Temperature time %d = %s", big.longValue(),
        // useful.formatTimestamp(big))
        break;
      case codes.VALUE_ALL_ENABLES:
        this._log(`Received all enables '${command}'`);
        const enablesData = this._parseMessage(parts, queries.enablesParse, id);
        if (!enablesData) {
          break;
        }

        const paramsForInputs: any[] = [];
        const paramsForOutputs: any[] = [];
        const paramsForTemps: any[] = [];
        const paramsForEnergy: any[] = [];

        const paramsForInputStates: any[] = [];
        const paramsForOutputStates: any[] = [];

        const inputCount = enablesData[0];
        const outputCount = enablesData[2];

        // Inputs are: 16 temperature sensors, 9 card readers, 39 normal inputs

        // For inputs
        this.fillParams(inputCount, enablesData[1], paramsForInputs);
        await executeBatchForNode(queries.updateInputEnable, this.controllerID, paramsForInputs);

        // For outputs
        this.fillParams(outputCount, enablesData[3], paramsForOutputs);
        await executeBatchForNode(queries.updateOutputEnable, this.controllerID, paramsForOutputs);

        // For temperature sensors
        this.fillParams(enablesData[4], enablesData[5], paramsForTemps);
        await executeBatchForNode(queries.updateTemperatureSensorEnable, this.controllerID, paramsForTemps);

        // For energy readers
        this.fillParams(enablesData[6], enablesData[7], paramsForEnergy);
        await executeBatchForNode(queries.updateEnergyEnable, this.controllerID, paramsForEnergy);

        // For input states
        this.fillParams(inputCount, enablesData[8], paramsForInputStates);
        await executeBatchForNode(queries.updateInputState, this.controllerID, paramsForInputStates);

        // For output states
        this.fillParams(outputCount, enablesData[9], paramsForOutputStates);
        await executeBatchForNode(queries.updateOutputState, this.controllerID, paramsForOutputStates);

        // Notify to the web app. This MUST BE DONE AFTER the arrays were filled using fillParams()

        for (let i = 0; i < inputCount.getInt(); i++) {
          this._notifyInput(false, paramsForInputs[i][1], this.controllerID, null, null, paramsForInputStates[i][0], paramsForInputs[i][0], null);
        }
        for (let i = 0; i < outputCount.getInt(); i++) {
          this._notifyOutput(paramsForOutputs[i][1], true, this.controllerID, null, null, paramsForOutputStates[i][0], paramsForOutputs[i][0], null);
        }
        for (let temp of paramsForTemps) {
          this._notifyTemp(temp[1], this.controllerID, temp[0], null, null, null);
        }
        for (let energy of paramsForEnergy) {
          this._notifyEnergy(energy[1], this.controllerID, energy[0], null, null, null, null, null, null, null);
        }
        break;
      case codes.VALUE_ENERGY_ENABLE_ONE:
        this._log(`Received energy enable changed '${command}'`);
        const energyRes = await this.updatePeriferalEnable(parts, queries.updateEnergyEnable);
        if (energyRes) {
          this._notifyEnergy(energyRes.pinID, this.controllerID, energyRes.enable, null, null, null, null, null, null, null);
        }
        break;
      case codes.VALUE_INPUT_ENABLE_ONE:
        this._log(`Received input enable changed '${command}'`);
        const inputRes = await this.updatePeriferalEnable(parts, queries.updateInputEnable);
        if (inputRes) {
          this._notifyInput(false, inputRes.pinID, this.controllerID, null, null, null, inputRes.enable);
        }

        break;
      case codes.VALUE_OUTPUT_ENABLE_ONE:
        this._log(`Received output enable changed '${command}'`);
        const outputRes = await this.updatePeriferalEnable(parts, queries.updateOutputEnable);
        if (outputRes) {
          this._notifyOutput(outputRes.pinID, true, this.controllerID, null, null, null, outputRes.enable);
        }
        break;
      case codes.VALUE_TEMP_ENABLE_ONE:
        this._log(`Received temperature enable changed '${command}'`);
        const tempRes = await this.updatePeriferalEnable(parts, queries.updateTemperatureSensorEnable);
        if (tempRes) {
          this._notifyTemp(tempRes.pinID, this.controllerID, tempRes.enable, null, null, null);
        }
        break;
      case codes.VALUE_CAN_ACCEPT_TICKET:
        const availableData = this._parseMessage(parts, queries.valueParse, id);
        if (!availableData) {
          break;
        }
        this.removePendingMessageByID(id, availableData[0].getInt(), false);
        break;
      case codes.VALUE_INPUT_CTRL:
      case codes.VALUE_OUTPUT_CTRL:
      case codes.VALUE_TEMP_SENSOR_CTRL:
      case codes.VALUE_CARD_READER_CTRL:
      case codes.VALUE_ENERGY_CTRL:
      case codes.VALUE_ENERGY_INSTALL:
        this.mirrorMessage(command, false);
        break;
      case codes.VALUE_STRUCT_INPUT:
      case codes.VALUE_CTRL_STATE:
      case codes.VALUE_SD:
      case codes.VALUE_SECURITY:
      case codes.VALUE_VOLTAGE:
      case codes.VALUE_STATES:
      case codes.VALUE_NET:
      case codes.VALUE_INPUT_CTRL_END:
      case codes.VALUE_OUTPUT_CTRL_END:
      case codes.VALUE_TEMP_SENSOR_CTRL_END:
      case codes.VALUE_CARD_READER_CTRL_END:
      case codes.VALUE_ENERGY_CTRL_END:
        this.mirrorMessage(command, true);
        // Register some of the messages
        if (cmdOrValue === codes.VALUE_SECURITY || cmdOrValue === codes.VALUE_SD) {
          const data = this._parseMessage(parts, queries.valueDateParse, id);
          if (!data) {
            this._log(`Error getting security or sd event. Received '${command}'`);
            break;
          }
          const value = data[0].getInt();
          const date = this.fixDateNumber(data[1].getInt());
          switch (cmdOrValue) {
            case codes.VALUE_SECURITY:
              const security = value == codes.VALUE_ARM;
              this._saveItemGeneral("security", [security, this.controllerID], queries.securityUpdate, id, -1);
              await executeQuery(BaseAttach.formatQueryWithNode(queries.insertSecurity, this.controllerID), [security, useful.formatTimestamp(date)]);
              break;
            case codes.VALUE_SD:
              this._log("Received sd event.");
              let state = States.ERROR;
              switch (value) {
                case codes.VALUE_MOUNT:
                  state = States.MOUNTED;
                  break;
                case codes.VALUE_EJECT:
                  state = States.UNMOUNTED;
                  break;
                case codes.VALUE_UNPLUGGED:
                  state = States.EJECTED;
                  break;
                default:
                  break;
              }
              this.insertSilent("sd event", [useful.formatTimestamp(date), state], queries.insertSD, this.controllerID, true);
              break;
          }
        }
        break;
      case codes.CMD_INPUT_CHANGED:
      case codes.CMD_OUTPUT_CHANGED:
        this._log(`Received pin changed '${command}'`);
        const pinDataOptional = this._parseMessage(parts, queries.pinParse, id);
        if (!pinDataOptional) break;
        const pinData = pinDataOptional;
        const pin = pinData[0].getInt();
        const state = pinData[1].getInt() == codes.VALUE_TO_ACTIVE ? 1 : 0;
        const pinDate = pinData[2].getInt();
        
        // const ioYear = useful.getYearFromTimestamp(pinDate);
        switch (cmdOrValue) {
          case codes.CMD_INPUT_CHANGED:
            await this.insertInputOutput(this.controllerID, pinData, true);
            // Send to the other backend
            this._notifyInput(true, pin, this.controllerID, null, null, state, null, useful.formatTimestamp(pinDate));
            // sm.PinEntradaManager.add_update(
            //   new sm.PinesEntradaSocketBad({ pe_id: pin, pin: pin, ee_id: DEF_ID, descripcion: DEF_TXT, estado: state, activo: DEF_ACTIVE, ctrl_id: this.controllerID })
            // );
            // sm.RegistroEntradaMap.add(
            //   new sm.RegistroEntradaSocket({ rentd_id: 1, pin: pin, estado: state ? 1 : 0, fecha: useful.formatTimestamp(pinDate), ee_id: DEF_ID, ctrl_id: this.controllerID })
            // );
            break;
          case codes.CMD_OUTPUT_CHANGED:
            await this.insertInputOutput(this.controllerID, pinData, false);
            // This is not necessary here since real time output states are not shown in the web app
            // this._notifyOutput()

            break;
        }
        // Log event
        this._log(
          `(${useful.formatTimestamp(this.fixDateNumber(pinData[2].getInt()))}) ${cmdOrValue === codes.CMD_INPUT_CHANGED ? "Input" : "Output"} ${pin} changed to ${state ? "active" : "inactive"}.`
        );
        break;
      case codes.CMD_CARD_READ:
        this._log(`Received card read '${command}'`);
        const cardData = this._parseMessage(parts, queries.cardReadParse, id);
        if (!cardData) break;
        const cardID = cardData[0].getInt();
        const serial = cardData[1].getInt();
        const autorizado = cardData[2].getInt() == codes.VALUE_AUTHORIZED;
        const isAdmin = cardData[3].getInt();
        const isEntrance = cardData[4].getInt();
        const date = useful.formatTimestamp(cardData[5].getInt());
        // serie, administrador, autorizacion, fecha, co_id, ea_id, tipo, sn_id
        // The subnode id is still being designed, so a trivial value us used. This
        // value must exist in the table 'nodo'.'subnodo'
        const params = [serial, isAdmin, autorizado, date, 0, 0, isEntrance, 1];
        this._log(`(${date}) Card read. ID = ${cardID} Number = ${serial} result = ${autorizado} admin = ${isAdmin} reader type = ${isEntrance > 0 ? "Entrance" : "Exit"}`);
        const cardInfo = await executeQuery<db2.CardInfo[]>(queries.getCardInfo, [cardID]);
        let co_id = 0;
        let ea_id = 0;
        if (!cardInfo || cardInfo?.length !== 1) {
          this._log("Error getting card info from database.");
        } else {
          if (cardInfo.length === 1) {
            co_id = params[4] = isAdmin?0: cardInfo[0].co_id;
            ea_id = params[5] = cardInfo[0].ea_id;
            if (!isAdmin) {
              // Since there is a company registered for that number
              const tickets = await executeQuery<db2.GeneralNumber[]>(BaseAttach.formatQueryWithNode(queries.selectUnattendedTicket, this.controllerID), [co_id, date, date]);
              if (tickets) {
                for (const ticket of tickets) {
                  const updateRes = await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.updateAttendance, this.controllerID), [ticket.entero]);
                  if (updateRes) {
                    this._log(`Ticket ID = ${ticket.entero} set to attended.`);
                  }
                }
              }
            }
          } else {
            this._log(`No rows returned for card ID = ${cardID}.`);
          }
        }
        this.insertSilent("card", params, queries.insertCard, this.controllerID, true);
        this._notifyCard(serial, isAdmin, autorizado ? 1 : 0, date, co_id, ea_id, isEntrance, this.controllerID);
        break;
      case codes.CMD_ERR:
        this._log(`Received internal error '${command}'`);
        const errorData = this._parseMessage(parts, queries.valueParse);
        if (!errorData) break;
        const internalErrorCode = errorData[0].getInt();
        switch (internalErrorCode) {
          case codes.ERR_READ_TEMP:
            const addressData = this._parseMessage(parts, queries.bigParse);
            if (!addressData) break;
            this._log(`Error reading temperature sensor. Address 0x${addressData[0].getInt().toString(16)}.`);
            break;
          case codes.ERR_MEASURE_TEMP:
            this._log("Error measuring all temperature sensors.");
            break;
          default:
            this._log(`Type of internal error is unknown. Value 0x${internalErrorCode.toString(16)}`);
        }
        break;
      case codes.CMD_HELLO_FROM_CTRL:
        this._log("Received hello from controller.");
        this.loggedToController = true;
        // Send all cards. Inactive cards will be send with an order to erase it in the
        // controller.
        this._log("Sending cards");
        const cards = await executeQuery<db2.CardForController[]>(queries.cardSelectForController);
        if (cards) {
          for (const card of cards) {
            this.addCommandForControllerBody(
              codes.CMD_CONFIG_SET,
              -1,
              card.activo
                ? [codes.VALUE_CARD_SYNC.toString(), card.a_id.toString(), card.co_id.toString(), card.serie.toString(), card.administrador.toString()]
                : [codes.VALUE_CARD_EMPTY_SYNC.toString(), card.a_id.toString()],
              false,
              false
            );
          }
        }
        this.removePendingMessageByID(id, codes.AIO_OK);
        this.insertNet(true)
        this._log("Logged in to controller");
        break;
      case codes.VALUE_ORDER_RESULT:
        this._log(`Received order result ${command}`);
        const orderData = this._parseMessage(parts, queries.orderParse, id, false);
        if (!orderData) {
          break;
        }
        let newOrder: 1 | 0 | -1 | null = null;
        const originalOrder = orderData[1].getInt();
        switch (originalOrder) {
          case codes.VALUE_TO_ACTIVE:
            newOrder = 1;
            break;
          case codes.VALUE_TO_INACTIVE:
            newOrder = -1;
            break;
          case codes.VALUE_TO_AUTO:
            newOrder = 0;
            break;
          default:
            this._log(`Wrong order result received from controller ${originalOrder}`);
            break;
        }
        this._notifyOutput(orderData[0].getInt(), false, this.controllerID, null, null, null, null, newOrder);
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   * Insert an input or output event in their respective tables.
   * @param name Name of the event.
   * @param nodeID ID of the controller that generated the event.
   * @param pinData Event data.
   * @param insertQuery Query to insert the event.
   */
  private async insertInputOutput(nodeID: number, pinData: DataStruct[], isInput: boolean) {
    if (!pinData) return;
    const dbName = BaseAttach.getNodeDBName(nodeID);
    const name = isInput ? "input changed" : "output changed";
    // Format the query since this kind has three format specifiers
    const fullQuery = util.format(isInput ? queries.insertInputChanged : queries.insertOutputChanged, dbName, dbName);
    const isAlarm = pinData[3].getInt();
    if (
      await executeQuery<ResultSetHeader>(fullQuery, [
        pinData[0].getInt(),
        pinData[1].getInt() == codes.VALUE_TO_ACTIVE ? 1 : 0,
        useful.formatTimestamp(this.fixDateNumber(pinData[2].getInt())),
        pinData[0].getInt(),
        isAlarm
      ])
    ) {
      this._log(`Inserted: ${name}`);
    } else {
      this._log(`Error saving silent: ${name}`);
    }
  }

  private mirrorMessage(command: string, logOnSend: boolean) {
    if (ManagerAttach.connectedManager) {
      ManagerAttach.connectedManager._addMirrorMessage(command, logOnSend);
    } else {
      this._log(`Manager not connected. Can't mirror '${command}'.`);
    }
  }

  private async updatePeriferalEnable(parts: string[], updateQuery: string) {
    const inputStateData = this._parseMessage(parts, queries.pinStateParse, this.controllerID);
    if (!inputStateData) {
      return null;
    }
    const pinID = inputStateData[0].getInt();
    const pinEnable = inputStateData[1].getInt();
    await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(updateQuery, this.controllerID), [pinEnable, pinID]);
    return { pinID: pinID, enable: pinEnable };
  }

  private fillParams(itemCount: DataStruct, value: DataStruct, paramList: any[]) {
    const count = itemCount.getInt();
    const enables = BigInt(value.getInt());
    // console.log(`Count ${count} Bits '${enables.toString(2)}'`)
    let mask = 1n << BigInt(count - 1);
    // Insert first
    paramList.push([(enables & mask) > 0n, 1]);
    // Insert the rest
    for (let i = 2; i <= count; i++) {
      mask = mask >> 1n;
      paramList.push([(enables & mask) > 0n, i]);
    }
  }

  /**
   * Insert a row into a table in a database. This method is meant to be used with
   * INSERT statements.
   *
   * @param name
   * @param parameters
   * @param id
   * @param nodeID
   */
  private async insertSilent(name: string, parameters: any[], query: string, nodeID: number, logSuccess: boolean) {
    if (!parameters) return;
    const fullQuery = BaseAttach.formatQueryWithNode(query, nodeID);
    if (await executeQuery<ResultSetHeader>(fullQuery, parameters)) {
      if (logSuccess) {
        this._log(`Inserted: ${name}`);
      }
    } else {
      this._log(`Error saving item silent: ${name}`);
    }
  }

  /**
   * Set the name of the attachment, which is usually the name of the controller
   * in the database. Also update the tag.
   *
   * @param name New name of the attachment.
   */
  setName(name: string) {
    this.node = name;
    this._tag = `(${this.node})`;
  }

  toString(): string {
    return this._tag;
  }

  async insertNet(state: boolean) {
    await executeQuery(queries.insertNet, [this.controllerID, useful.getCurrentDate(), state]);
    await executeQuery(queries.insertCtrlState, [state, this.controllerID]);
    this._log(`Inserting: Net state ${state ? "conectado" : "desconectado"}`);
  }

  /**
   * Add a message for the controller that this object represents.
   *
   * @param header        Header of the message.
   * @param id            ID of the message.
   * @param elementBefore Element to add at the beginning of the body.
   * @param bodyParts     Iterator from which to get the body parts.
   * @param onResponse    Action to perform when a response to this message is
   *                      received.
   * @param forcePending  Whether to add this message to the pending messages, not
   *                      matter what the value of the ID is.
   */
  addCommandForController(header: number, id: number, elementBefore: string | null, bodyParts: string[], onResponse: IntConsumer = null, forcePending: boolean = false) {
    const bodyArray: string[] = [];
    if (elementBefore) {
      bodyArray.unshift(elementBefore);
    }
    while (bodyParts.length > 0) {
      bodyArray.push(bodyParts.shift() ?? "");
    }
    this._addOne(new Message(header, id, bodyArray, onResponse, forcePending));
  }

  /**
   * Similar to {@linkcode addCommandForController}.
   *
   * @param header
   * @param id
   * @param body
   * @param logOnSend Whether to log this message when sending it.
   * @param logOnResponse
   * @param action
   * @returns
   * @see {@linkcode addCommandForController}
   */
  addCommandForControllerBody(header: number, id: number, body: string[], logOnSend: boolean = true, logOnResponse: boolean = true, action: IntConsumer | null = null): number {
    const msg = new Message(header, id, body).setLogOnSend(logOnSend).setLogOnResponse(logOnResponse).attachAction(action);
    return this._addOne(msg);
  }

  /**
   * Add a {@linkcode codes.CMD_LOGIN} message with the current user and password in
   * this object. This message expects a response.
   */
  addLogin() {
    const pwd = Encryption.decrypt(this.password, true);
    if (pwd) {
      this._addOne(new Message(codes.CMD_LOGIN, -1, [this.user, pwd]).setLogOnSend(false));
      this._log(`Added login`);
    }
  }

  /**
   * Create a socket for one controller and set its connection events.
   * @param selector Container of all the attachments.
   * @param log Whether to log when the socket is connected.
   * @param push Whether to add the new attachment to the list.
   */
  tryConnectNode(selector: Selector, log: boolean, push: boolean = true) {
    const controllerSocket = net.createConnection(this.port, this.ip, () => {
      if (log) {
        this._log("Socket connect callback");
      }
      this.unreached = false;
      this.addLogin();
      this.addHello(0, 0);
    });

    controllerSocket.on("data", (data: Buffer) => {
      // this._log(`Received '${data}' from controller`)
      this.addData(data);
      // const code = [0]
      // const bundle = new Bundle()
      // this.readOne(selector, data.toString('utf8'), code, bundle)
    });

    // This event is called right after the 'connect' one, so it makes no difference if it is ignored
    // controllerSocket.on("ready", () => {
    //   this._log(`Socket ready`)
    // })

    controllerSocket.on("timeout", () => {
      this._log(`Socket timeout`);
    });

    // Triggers 'end' and 'close' events
    controllerSocket.on("error", (err: any) => {
      this.unreached = false;
      // this._log(`Error on controller ${err.code}`);
      if (err.code == "ENOTFOUND") {
        // this._log(`No device found at '${this.ip}'`)
      } else if (err.code == "ETIMEDOUT") {
        // Lasts about 21 seconds
        // this._log(`Timeout`)
      } else if (err.code == "ECONNRESET") {
        // this._log(`Connection reseted`)
      } else if (err.code == "ECONNREFUSED") {
        // this._log(`Connection refused`)
      } else if (err.code == "EHOSTUNREACH") {
        // When pulling the server wire, all attempts to connect are rejected immediately. This emits 'error' and that emits 'close'.
        // If the code tries to reconnect a controller, this results in a fast loop of connect and close.
        // this._log(`Unreachable ${this.ip}.`)
        this.unreached = true;
      }
    });

    // When ended from the other side
    controllerSocket.on("end", () => {
      this._log(`Socket ended from the other side`);
    });

    // Close is emitted after the error event
    // Also emitted when the controller resets manually?
    controllerSocket.on("close", () => {
      // this._log(`Socket close callback`);
      controllerSocket.end(() => {
        // this._log(`Socket end in close callback`);
      });

      // controllerSocket.destroy();

      BaseAttach.simpleReconnect(selector, this, this.unreached);
    });

    this._currentSocket = controllerSocket;

    if (push) {
      selector.nodeAttachments.push(this);
    }
  }

  resetOnlyData(rowWithData: db2.Controlador2) {
    // ctrl_id, nodo, ip, puerto, usuario, contraseña
    this.setName(rowWithData.nodo);
    this.ip = rowWithData.ip;
    this.port = rowWithData.puerto;
    this.user = rowWithData.usuario;
    this.password = rowWithData.contraseña;
    this._closeOnNextSend = false;
    this._selectable = true;
    this.loggedToController = false;
    this._log(`Data updated node ID = ${this.controllerID}.`);
  }
}

/**
 * Attachment for channels related to managers.
 */
export class ManagerAttach extends BaseAttach {
  private address = BaseAttach.DEFAULT_ADDRESS;

  /**
   * Current logged in manager. Can be null if none is connected or none of the
   * connected are logged in. This field means that only one manager can be
   * connected at a time.
   */
  static connectedManager: ManagerAttach | null = null;

  /**
   * True if one manager has logged in successfully. Once it's true, no other
   * manager should be allowed to log in. Once a manager disconnects or logs out
   * and if he was logged in, this field should be set to false.
   */
  static isAnotherLoggedIn = false;

  /**
   * True when the other end of the manager channel is logged in.
   */
  private loggedIn = false;

  /**
   * Reference to save the parts of ``VALUE_NODE`` command. This will be used when the
   * controller confirms the changes or when there was no socket for the
   * controller.
   */
  private completeNodeData: DataStruct[] | null = null;

  /**
   * Reference to save the trivial part of a ``VALUE_NODE`` command. This will be used
   * to update the socket's attachment only when it is logged to the controller.
   */
  private halfForTrivial: DataStruct[] | null = null;

  /**
   * True when the edition of the node involves changing the password.
   */
  private updatWithPassword = false;

  constructor(logger: Logger, connection: net.Socket) {
    super(logger);
    this._currentSocket = connection;
    if (connection) this.address = connection.remoteAddress ?? BaseAttach.DEFAULT_ADDRESS;
    this._tag = `<Manager@${this.address}>`;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /**
   *
   * @param parts
   * @param cmdOrValue
   * @param id
   * @param command
   * @param code
   * @param bundle
   * @returns
   * @override {@linkcode BaseAttach._processMessage}
   */
  async _processMessage(selector: Selector, parts: string[], cmdOrValue: number, id: number, command: string, code: ResultCode, bundle: Bundle): Promise<boolean> {
    // Operations without logging in
    switch (cmdOrValue) {
      case codes.CMD_HELLO_FROM_MNGR:
        this._log("Received hello from " + this._tag);
        // For now, the response is not useful for the manager
        // this._addResponse(id, codes.AIO_OK)
        break;
      case codes.CMD_KEEP_ALIVE:
        // this._log('Keep alive')
        break;
      case codes.CMD_LOGIN:
        // Register the user trying to log in
        const loginData = this._parseMessage(parts, queries.loginParse, id);
        if (!loginData) break;
        const user = loginData[0].getString();
        const password = loginData[1].getString();
        // Don't log password
        this._log(`Manager logging in as '${user}'`);
        if (ManagerAttach.isAnotherLoggedIn) {
          this._log("Another manager has already logged in.");
          this._addAnotherConnected(id);
        } else {
          const loggedResult = await userExist(user, password);
          // if (!loggedResult) {
          //   this._log('No database manager!')
          //   break
          // }
          if (loggedResult > 0) {
            this._log(`ID = ${loggedResult} Pwd = ${password}`);
            this.addHello(id, loggedResult);
            this.loggedIn = true;
            ManagerAttach.isAnotherLoggedIn = true;
            ManagerAttach.connectedManager = this;
            this._log(`Logged in. User ID = ${loggedResult}.`);
          } else if (loggedResult < 0) {
            this._addResponse(id, codes.ERR_EXECUTING_QUERY);
            this._log("Error executing query");
          } else if (loggedResult == 0) {
            this._addResponse(id, codes.ERR_WRONG_USRPWD);
            this._log("Wrong user or password");
          }
        }
        break;
      default:
        // Operations with log in required
        if (this.loggedIn) {
          switch (cmdOrValue) {
            // Commands that, at this point, need the node ID.
            case codes.CMD_TEST_CONNECTED:
            case codes.CMD_PIN_CONFIG_SET:
            case codes.CMD_ESP:
              const testNodeData = this._parseMessage(parts, queries.idParse, id);
              if (!testNodeData) break;
              const testNodeID = testNodeData[0].getInt();
              switch (cmdOrValue) {
                case codes.CMD_TEST_CONNECTED:
                  // FUTURE UPGRADE: A more trusty way to test if the controller is connected is
                  // asking it to itself.
                  // A test message can be sent to the controller whose response will give another
                  // to the manager. If
                  // the controller doesn't respond in a timeout the back end should answer
                  // automatically and delete the
                  // corresponding pending message. For this, a timer should be started.
                  this._log(`Received test connection '${command}'`);
                  const state = selector.getNodeState(testNodeID);
                  this._addResponse(id, state);
                  this._log(`Node ID = ${testNodeID} is ${useful.getStateName(state)}.`);
                  break;
                case codes.CMD_PIN_CONFIG_SET:
                case codes.CMD_ESP:
                  this._log(`Received command for controller 0x${cmdOrValue.toString(16)}. Received '${command}'`);
                  const nodeAttach = selector.getNodeAttachByID(testNodeID);
                  if (nodeAttach) {
                    nodeAttach.addCommandForController(cmdOrValue, id, null, parts);
                  } else {
                    this._addResponse(id, codes.ERR_DISCONNECTED);
                  }
                  break;
                default:
                // this._log(`Value fell through in switch but wasn't processed inside the case. Value 0x${cmdOrValue.toString(16)}`);
              }
              break;
            case codes.CMD_CONFIG_GET:
              // Commands to get rows from the database that does not require a node
              // ID. Usually, these commands send a response or list of responses with the
              // data required.
              // this._log(`Received get configuration '${command}'`);
              const getData = this._parseMessage(parts, queries.valueParse, id);
              if (!getData) break;
              const valueToGet = getData[0].getInt();
              if (await this.simpleReadAndSend(valueToGet, id)) {
                // this._log('Simple read and send.')
              } else {
                // this._log('Value: %d', valueToGet)
                switch (valueToGet) {
                  case codes.VALUE_NODE:
                    await this.addNodes(selector, id, false);
                    // Just to check on keys. No other particular reason.
                    // printKeyCount(selector)
                    break;
                  case codes.VALUE_WORKER:
                    await this.addWorkers(id, false);
                    break;
                  case codes.VALUE_INPUT_CTRL:
                  case codes.VALUE_OUTPUT_CTRL:
                  case codes.VALUE_TEMP_SENSOR_CTRL:
                  case codes.VALUE_CARD_READER_CTRL:
                  case codes.VALUE_STRUCT_INPUT:
                  case codes.VALUE_CTRL_STATE:
                  case codes.VALUE_NET:
                  case codes.VALUE_SECURITY:
                  case codes.VALUE_VOLTAGE:
                  case codes.VALUE_SD:
                  case codes.VALUE_STATES:
                  case codes.VALUE_ENERGY_CTRL:
                    const nodeData = this._parseMessage(parts, queries.idParse, id);
                    if (!nodeData) break;
                    const targetNodeID = nodeData[0].getInt();
                    const att = selector.getNodeAttachByID(targetNodeID);
                    if (att) {
                      att.addCommandForControllerBody(cmdOrValue, id, [valueToGet.toString()]);
                    } else {
                      this._addResponse(id, codes.ERR_DISCONNECTED);
                    }
                    break;
                  case codes.VALUE_INPUT:
                    this.getDBNameExecuteSend(parts, id, queries.inputsSelect, codes.VALUE_INPUT, codes.VALUE_INPUT_END, false);
                    break;
                  case codes.VALUE_OUTPUT:
                    this.getDBNameExecuteSend(parts, id, queries.outputsSelect, codes.VALUE_OUTPUT, codes.VALUE_OUTPUT_END, false);
                    break;
                  case codes.VALUE_TEMP_SENSOR:
                    this.getDBNameExecuteSend(parts, id, queries.tempSensorsSelect, codes.VALUE_TEMP_SENSOR, codes.VALUE_TEMP_SENSOR_END, false);
                    break;
                  case codes.VALUE_CAMERA:
                    this.getDBNameExecuteSend(parts, id, queries.camerasSelect, codes.VALUE_CAMERA, codes.VALUE_CAMERA_END, false, "camara");
                    break;
                  case codes.VALUE_CARD_READER:
                    this.getDBNameExecuteSend(parts, id, queries.cardReaderSelect, codes.VALUE_CARD_READER, codes.VALUE_CARD_READER_END, false);
                    break;
                  case codes.VALUE_ENERGY:
                    this.getDBNameExecuteSend(parts, id, queries.energySelect, codes.VALUE_ENERGY, codes.VALUE_ENERGY_END, false);
                    break;
                  default:
                    this._log(`Unknown get value. Received '${command}' Value 0x${valueToGet.toString(16)}`);
                    this._addUnknownValue(id);
                }
              }
              break;
            // Commands to save (or empty) rows in the database that does not require a node
            // ID. These commands send one response indicating the result of the operation.
            case codes.CMD_CONFIG_SET:
              const valueData = this._parseMessage(parts, queries.valueParse, id);
              if (!valueData) break;
              const valueToSet = valueData[0].getInt();
              if (valueToSet != codes.VALUE_WORKER_PHOTO && valueToSet != codes.VALUE_WORKER_ADD && valueToSet != codes.VALUE_WORKER) {
                this._log(`Received set config '${command}'.`);
              }
              switch (valueToSet) {
                case codes.VALUE_GROUP:
                case codes.VALUE_GROUP_ADD:
                  const regionData = this._parseMessage(parts, queries.regionParse, id);
                  switch (valueToSet) {
                    case codes.VALUE_GROUP:
                      await this._updateItem("region", regionData, queries.regionUpdate, id);
                      break;
                    case codes.VALUE_GROUP_ADD:
                      await this._insertItem("region", regionData, queries.regionInsert, id);
                      break;
                    default:
                      this._logFeelThroughHex(valueToSet);
                  }
                  break;
                case codes.VALUE_GROUP_DISABLE:
                  await this.disableItem("region", parts, queries.regionDisable, id);
                  break;
                case codes.VALUE_NODE:
                case codes.VALUE_NODE_ADD:
                case codes.VALUE_NODE_PASSWORD:
                  const withPassword = valueToSet === codes.VALUE_NODE_PASSWORD || valueToSet === codes.VALUE_NODE_ADD;
                  this.updatWithPassword = withPassword;
                  const nodeData = this._parseMessage(parts, withPassword ? queries.nodeParsePwd : queries.nodeParse, id);
                  if (!nodeData) break;
                  const nodeID = nodeData[0].getInt();
                  /*
                   * When creating a node, the database for the new node will be created as well.
                   * When editing a node, that is not necessary.In both cases, the order for the
                   * controller was created in the manager if the node was connected.
                   */
                  if (valueToSet == codes.VALUE_NODE_ADD) {
                    if (!(await this.createDatabaseForNode(nodeID))) {
                      break;
                    }
                  }

                  /*
                   * The password should be encrypted before saving it to the database. The back
                   * end will decrypt it right before using it.
                   */
                  if (withPassword) {
                    const nodePassword = nodeData[queries.nodePasswordIndex];
                    const encrytedNodePassword = Encryption.encrypt(nodePassword.getString(), true);
                    if (!encrytedNodePassword) {
                      this._log("Error encrypting node password.");
                      break;
                    }
                    nodePassword.setString(encrytedNodePassword);
                  }

                  /*
                   * Slice the data: Save the parts that are trivial like the name, location, etc.
                   * Save the complete configuration for when the controller confirms the change.
                   * The trivial data is going to be used in this block if the channel is logged
                   * in.
                   */
                  this.completeNodeData = nodeData;
                  const halfForTrivialData: DataStruct[] = [];
                  for (let i = 0; i < queries.indexForTrivial.length; i++) {
                    if (nodeData.length > queries.indexForTrivial[i]) {
                      halfForTrivialData.push(nodeData[queries.indexForTrivial[i]]);
                    } else {
                      this._log("Out of bound! Trivial item in node data array does not exist.");
                    }
                  }
                  this.halfForTrivial = halfForTrivialData;
                  await this.completeReconnect(selector, nodeID, false, id);
                  // After a node related order has been processed
                  this.printKeyCount(selector);
                  break;
                case codes.VALUE_NODE_DISABLE:
                  const disabledID = await this.disableItem("node", parts, queries.nodeDisable, id);
                  const key = selector.getNodeAttachByID(disabledID);
                  if (key) {
                    selector.cancelChannel(key);
                  }
                  // After the node related order has been processed
                  this.printKeyCount(selector);
                  break;
                case codes.VALUE_COMPANY:
                case codes.VALUE_COMPANY_ADD:
                  const companyData = this._parseMessage(parts, queries.companyParse, id);
                  switch (valueToSet) {
                    case codes.VALUE_COMPANY:
                      await this._updateItem("company", companyData, queries.companyUpdate, id);
                      this.printKeyCount(selector);
                      break;
                    case codes.VALUE_COMPANY_ADD:
                      await this._insertItem("company", companyData, queries.companyInsert, id);
                      break;
                    default:
                      this._logFeelThroughHex(valueToSet);
                  }
                  break;
                case codes.VALUE_COMPANY_DISABLE:
                  await this.disableItem("company", parts, queries.companyDisable, id);
                  break;
                case codes.VALUE_USER:
                case codes.VALUE_USER_ADD:
                case codes.VALUE_USER_PASSWORD:
                  const userWithPassword = valueToSet === codes.VALUE_USER_PASSWORD || valueToSet === codes.VALUE_USER_ADD;
                  // consolethis._log\(userWithPassword)
                  const q = userWithPassword ? queries.userParsePwd : queries.userParse;
                  // consolethis._log\(q)
                  const userData = this._parseMessage(parts, q, id);
                  if (!userData) break;
                  // Encrypt password
                  if (userWithPassword) {
                    const userPassword = userData[queries.userPasswordIndex];
                    const encrytedUserPassword = await useful.bCryptEncode(userPassword.getString());
                    if (!encrytedUserPassword) {
                      this._log("Error encrypting user password.");
                      break;
                    }
                    userPassword.setString(encrytedUserPassword);
                  }
                  // Set date for a new user
                  if (valueToSet == codes.VALUE_USER_ADD) {
                    const a = useful.getCurrentDate();
                    // consolethis._log\(a)
                    userData[queries.userDateIndex].setString(a);
                  }
                  // Save user
                  switch (valueToSet) {
                    case codes.VALUE_USER:
                      await this._updateItem("user", userData, queries.userUpdate, id);
                      break;
                    case codes.VALUE_USER_ADD:
                      await this._insertItem("user", userData, queries.userInsert, id);
                      break;
                    case codes.VALUE_USER_PASSWORD:
                      await this._updateItem("user", userData, queries.userUpdatePwd, id);
                      break;
                    default:
                      this._logFeelThroughHex(valueToSet);
                  }
                  break;
                case codes.VALUE_USER_DISABLE:
                  await this.disableItem("user", parts, queries.userDisable, id);
                  break;
                case codes.VALUE_WORKER:
                case codes.VALUE_WORKER_ADD:
                case codes.VALUE_WORKER_PHOTO:
                  // p_id, nombre, telefono, dni, c_id, co_id, foto, correo, activo
                  this._log(`Received set worker '${useful.trimString(command)}'.`);
                  const workerData = this._parseMessage(parts, queries.workerParse, id);
                  if (!workerData) break;
                  const workerID = workerData[queries.workerIDIndex].getInt();
                  const workerPhoto = workerData[queries.workerPhotoIndex];
                  if (valueToSet === codes.VALUE_WORKER_PHOTO || valueToSet === codes.VALUE_WORKER_ADD) {
                    this._log("Writing photo file...");
                    const fileSize = new AtomicNumber();
                    if (await useful.writePhotoFromBase64(workerPhoto.getString(), workerID, fileSize)) {
                      this._log(`New photo saved for worker ID = ${workerID}. File size = ${fileSize.inner} bytes`);
                    } else {
                      this._log(`Error writing photo for worker ID = ${workerID}`);
                    }
                  }
                  workerPhoto.setString(useful.getReplacedPath(useful.getPathForWorkerPhoto(workerID)));
                  switch (valueToSet) {
                    case codes.VALUE_WORKER:
                    case codes.VALUE_WORKER_PHOTO:
                      await this._updateItem("worker", workerData, queries.workerUpdate, id);
                      break;
                    case codes.VALUE_WORKER_ADD:
                      await this._insertItem("worker", workerData, queries.workerInsert, id);
                      break;
                    default:
                      this._logFeelThroughHex(valueToSet);
                      break;
                  }
                  break;
                case codes.VALUE_WORKER_DISABLE:
                  await this.disableItem("worker", parts, queries.workerDisable, id);
                  break;
                case codes.VALUE_CARD:
                  const cardOptional = this._parseMessage(parts, queries.cardParse, id);
                  if (!cardOptional) break;
                  const cardData = cardOptional;
                  await this._updateItem("card", cardOptional, queries.cardUpdate, id);
                  this.updateCardInControllersGeneral(selector, cardData[0].getInt(), cardData[3].getInt(), cardData[1].getInt(), cardData[2].getInt() > 0);
                  break;
                case codes.VALUE_CARD_EMPTY:
                  const cardID = await this.disableItem("card", parts, queries.cardDisable, id);
                  this.removeCardInControllers(selector, cardID);
                  break;
                case codes.VALUE_CAMERA:
                case codes.VALUE_CAMERA_ADD:
                case codes.VALUE_CAMERA_PASSWORD:
                case codes.VALUE_CAMERA_DISABLE:
                case codes.VALUE_TEMP_SENSOR:
                case codes.VALUE_INPUT:
                case codes.VALUE_OUTPUT:
                case codes.VALUE_NET:
                case codes.VALUE_NET_PASSWORD:
                case codes.VALUE_CARD_READER:
                case codes.VALUE_ENERGY:
                  // Node dependent commands
                  const targetNodeData = this._parseMessage(parts, queries.idParse, id);
                  if (!targetNodeData) break;
                  const targetNodeID = targetNodeData[0].getInt();
                  switch (valueToSet) {
                    case codes.VALUE_NET:
                    case codes.VALUE_NET_PASSWORD:
                      const nodeAttach = selector.getNodeAttachByID(targetNodeID);
                      if (!nodeAttach) break;
                      nodeAttach.addCommandForController(
                        cmdOrValue,
                        id,
                        valueToSet.toString(),
                        parts,
                        async (code) => {
                          switch (code) {
                            case codes.AIO_OK:
                              /*
                               * The controller may send a EOS after this point, but that will
                               * only reconnect the channel with the same connection data.
                               */
                              this._log(`Controller confirmed the changed ID = ${id}.`);
                              await this.completeReconnect(selector, targetNodeID, true, id);
                              break;
                            case codes.ERR_NO_CHANGE:
                              this._log("The controller reported no change.");
                              break;
                            default:
                              this._log(`Unknown response code 0x${code.toString(16)}.`);
                          }
                          this._addControllerConfirmation(id);
                        },
                        true
                      );
                      this._log("Net configuration for controller added.");
                      break;
                    case codes.VALUE_CAMERA:
                    case codes.VALUE_CAMERA_ADD:
                    case codes.VALUE_CAMERA_PASSWORD:
                      const cameraWithPassword = valueToSet === codes.VALUE_CAMERA_ADD || valueToSet == codes.VALUE_CAMERA_PASSWORD;
                      // c_id, serie, tc_id, m_id, usuario, ip, puerto, descripcion, puertows, mascara, puertaenlace, contraseña
                      const cameraData = this._parseMessage(parts, cameraWithPassword ? queries.cameraParsePwd : queries.cameraParse, id);
                      if (!cameraData) break;
                      // To update the local cameras list
                      bundle.targetCamera = new Camera(cameraData[queries.cameraIDIndex].getInt(), targetNodeID, cameraData[queries.cameraIPIndex].getString());
                      // Camera object for the front
                      const newCameraItem = new CameraForFront(cameraData[0].getInt(), targetNodeID, cameraData[5].getString(), cameraData[4].getString(), null);
                      // Encrypt password
                      if (cameraWithPassword) {
                        const cameraPassword = cameraData[queries.cameraPasswordIndex];
                        const encrytedCameraPassword = Encryption.encrypt(cameraPassword.getString(), false);
                        if (!encrytedCameraPassword) {
                          this._log("Error encrypting camera password.");
                          break;
                        }
                        cameraPassword.setString(encrytedCameraPassword);
                        newCameraItem.contraseña = encrytedCameraPassword;
                      }

                      // Save camera
                      switch (valueToSet) {
                        case codes.VALUE_CAMERA:
                          await this._updateItem("camera", cameraData, queries.cameraUpdate, id, targetNodeID);
                          code.code = Result.CAMERA_UPDATE;
                          break;
                        case codes.VALUE_CAMERA_ADD:
                          await this._insertItem("camera", cameraData, queries.cameraInsert, id, targetNodeID);
                          code.code = Result.CAMERA_ADD;
                          break;
                        case codes.VALUE_CAMERA_PASSWORD:
                          await this._updateItem("camera", cameraData, queries.cameraUpdatePwd, id, targetNodeID);
                          code.code = Result.CAMERA_UPDATE;
                          break;
                        default:
                          this._logFeelThroughHex(valueToSet);
                          break;
                      }
                      CameraMotionManager.add_update(newCameraItem);
                      break;
                    case codes.VALUE_ENERGY:
                      // id, desc
                      const energyData = this._parseMessage(parts, queries.energyParse, id);
                      await this._updateItem("energy reader", energyData, queries.energyUpdate, id, targetNodeID);
                      if (energyData) {
                        this._notifyEnergy(energyData[0].getInt(), targetNodeID, null, energyData[1].getString(), null, null, null, null, null, null);
                      }
                      break;
                    case codes.VALUE_TEMP_SENSOR:
                      // id, serie, ubicacion
                      const tempData = this._parseMessage(parts, queries.tempSensorParse, id);
                      await this._updateItem("temperature sensor", tempData, queries.tempSensorUpdate, id, targetNodeID);
                      if (tempData) {
                        this._notifyTemp(tempData[0].getInt(), targetNodeID, null, null, tempData[1].getString(), tempData[2].getString());
                      }
                      break;
                    case codes.VALUE_INPUT:
                      // pin, pinp, equipo, desc
                      const inputData = this._parseMessage(parts, queries.inputParse, id);
                      await this._updateItem("input", inputData, queries.inputUpdate, id, targetNodeID);
                      if (inputData) {
                        this._notifyInput(false, inputData[0].getInt(), targetNodeID, inputData[2].getInt(), inputData[3].getString(), null, null, null);
                      }
                      break;
                    case codes.VALUE_OUTPUT:
                      // pin, pinp, equipo, desc
                      const outputData = this._parseMessage(parts, queries.outputParse, id);
                      await this._updateItem("output", outputData, queries.outputUpdate, id, targetNodeID);
                      if (outputData) {
                        this._notifyOutput(outputData[0].getInt(), true, targetNodeID, outputData[2].getInt(), outputData[3].getString(), null, null, null);
                      }
                      break;
                    case codes.VALUE_CARD_READER:
                      const cardReaderData = this._parseMessage(parts, queries.cardReaderParse, id);
                      await this._updateItem("card reader", cardReaderData, queries.cardReaderUpdate, id, targetNodeID);
                      break;
                    case codes.VALUE_CAMERA_DISABLE:
                      const disabledCamera = await this.disableItem("camera", parts, queries.cameraDisable, id, targetNodeID);
                      bundle.targetCamera = new Camera(disabledCamera, targetNodeID);
                      CameraMotionManager.delete(new CameraForFront(disabledCamera, targetNodeID));
                      code.code = Result.CAMERA_DISABLE;
                      break;
                    default:
                      this._logFeelThroughHex(valueToSet);
                  }
                  break;
                default:
                  this._log(`Unknown set value. Received '${command}' Value 0x${valueToSet.toString(16)}`);
                  this._addUnknownValue(id);
              }
              break;
            default:
              return false;
          }
        } else {
          // Don't send a response nor process anything else.
          this._log(`Manager not logged in trying to send message '${command}'`);
        }
        break;
    }
    return true;
  }

  /**
   * Create database for one node with the tables for the temperatures.
   * @param nodeID The node ID for which create the database.
   * @returns True if the database was created, false if an error occurred.
   */
  private async createDatabaseForNode(nodeID: number): Promise<boolean> {
    /**
     * Try to create a database.
     */
    if (Main.isWindows) {
      const dbRes = await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.createDatabase, nodeID));
      if (!dbRes) {
        return false;
      }
      const newNode = BaseAttach.getNodeDBName(nodeID);
      // The timeout generates an error in the callback?
      try {
        cp.execSync(
          `cmd.exe /c mysqldump -u ${appConfig.db.user} -p${appConfig.db.password} nodo | mysql -u ${appConfig.db.user} -p${appConfig.db.password} ${newNode}`,
          // `cmd.exe /c mysqldump -u root -padmin nodo | mysql -u root -padmin ${newNode}`,
          { timeout: BaseAttach.PROCESS_TIMEOUT }
        );
      } catch (e) {
        this._log(`ERROR: Could not create database for node ID ${nodeID}. Error:\n ${e}.`);
        return false;
      }
    } else {
      this._log(`Database creation only implemented for Windows.`);
      return false;
    }

    /**
     * Ensure tables for temperatures AFTER the table for the node exists.
     */
    // const year = useful.getYear();
    // const month = useful.getMonth();
    // if (!month || !year) {
    //   this._log(`ERROR: Could not get the month or year for node ${nodeID}.`);
    //   return false;
    // }
    // if (!(await BaseAttach._checkTablesStatic(nodeID, month, year, true))) {
    //   this._log(`ERROR: Could not create temperature table for node ID ${nodeID}`);
    //   return false;
    // }
    // this._log(`Database created for node ID ${nodeID}.`);

    return true;
  }

  /**
   * Ensure that the controller has a channel registered AFTER a
   * {@linkcode codes.VALUE_NODE}, {@linkcode codes.VALUE_NODE_ADD} or
   * {@linkcode codes.VALUE_NODE_PASSWORD} command has been received or after the
   * {@linkcode codes.VALUE_NET} or {@linkcode codes.VALUE_NET_PASSWORD} command received
   * a response. This method should be called only in the context of those
   * commands. If the attachment is logged to the controller, this method does not
   * try to reconnect unless `forceReconnect` is `true`. If there is
   * not channel for the controller, a new one is created and connected.
   *
   * @param selector       Selector to register the channel to.
   * @param nodeID         Controller ID for which to ensure a channel.
   * @param forceReconnect True to force reconnection even when the attachment is
   *                       logged to the controller. Usually is true when the
   *                       controller responded to a change.
   * @param id             ID of the message being processed.
   */
  private async completeReconnect(selector: Selector, nodeID: number, forceReconnect: boolean, id: number) {
    // The channel must be reconnected anyways. This ensures that there will be a
    // channel for that controller after this method returns.
    const currentAttach = selector.getNodeAttachByID(nodeID);
    const updateQuery = this.updatWithPassword ? queries.nodeUpdatePwd : queries.nodeUpdate;
    if (!currentAttach) {
      this._log(`Channel for controller ID = ${nodeID} did not exist. Opening ...`);
      // The channel was not found. This can happen when a new node is being created
      // or a channel was closed by an error in the code.
      // In both cases, a new channel must be created IF there is data in the
      // database, obviously.

      // Save all the data that was received. This should update the entry in the
      // database when there was one but, somehow, its key wasn't registered.
      if (!(await this._insertItem("node", this.completeNodeData, queries.nodeInsert, id))) {
        this._log("Could not insert, updating node instead.");
        if (await this._updateItem("node", this.completeNodeData, updateQuery, id)) {
          this._log("Node updated");
        } else {
          this._log("Could not update node.");
        }
      }
      // Recover the data just saved
      const newData = await this.getOneControllerData(nodeID);
      if (!newData) {
        this._log("Error recovering the node data saved");
        return;
      }

      // Create attachment and connect the socket

      const newAttach = NodeAttach.getInstanceFromPacket(newData, this._logger);
      newAttach.tryConnectNode(selector, true);
    } else {
      /**
       * The channel was found. IF THE CHANNEL IS LOGGED IN TO THE CONTROLLER, nothing
       * should be done since the manager will send an order for the controller whose
       * response will reconnect the channel.
       * IF THE CHANNEL IS NOT LOGGED IN, the channel must be closed and other opened
       * with the same attachment changing only the connection data.
       * This covers the case where the connection configuration is being corrected.
       */
      if (!currentAttach.loggedToController || forceReconnect) {
        this._log(`About to cancel and reconnect node ID ${currentAttach.controllerID}.`);

        // Save all the data that was received and update attachment

        await this._updateItem("node", this.completeNodeData, updateQuery, id);
        const newData = await this.getOneControllerData(nodeID);
        if (!newData) {
          return;
        }
        currentAttach.resetOnlyData(newData);

        // Reset node attachment data and connect with the new data

        BaseAttach.simpleReconnect(selector, currentAttach);

        // selector.cancelChannel(currentAttach);
        // currentAttach.tryConnectNode(selector, true);
      } else {
        // Save the data that only belongs to the database (that the controller doesn't
        // use)
        await this._updateItem("node trivial data", this.halfForTrivial, queries.nodeUpdateTrivial, id);
        // Update trivial data
        const newData = await this.getOneControllerData(nodeID);
        if (!newData) {
          this._log(`No data for node ID = ${nodeID} while reconnecting`);
          return;
        }
        currentAttach.setName(newData.nodo);
        this._log(`Channel '${currentAttach.toString()}' will reconnect when the controller confirms the changes.`);
      }
    }
    this.printKeyCount(selector);
  }

  /**
   * Get the data needed for connection for one controller.
   *
   * @param nodeID ID of the controller.
   * @returns A {@linkcode db2.Controlador2} containing the data.
   */
  private async getOneControllerData(nodeID: number): Promise<db2.Controlador2 | null> {
    const nodeData = await executeQuery<db2.Controlador2[]>(queries.nodeGetForUpdate, [nodeID]);
    if (nodeData && nodeData.length === 1) {
      return nodeData[0];
    } else {
      this._log(`There is no data for node ID = ${nodeID}`);
    }
    return null;
  }

  /**
   * Same as the overload but ``remove`` defaults to ``true`` so this
   * operation erases a card and no more parameters are needed.
   *
   * @param selector
   * @param cardID
   * @see {@linkcode updateCardInControllersGeneral}
   */
  private removeCardInControllers(selector: Selector, cardID: number) {
    this.updateCardInControllersGeneral(selector, cardID, 0, 0, false, true);
  }

  /**
   * Update one card in all the controllers that are connected. The disconnected
   * controller will get the whole list of admin cards when they connect and the
   * back end logs in successfully.
   *
   * @param selector  The selector containing the controllers data.
   * @param cardID    The ID of the card to update.
   * @param companyID The ID of the company to which this card is related to.
   * @param serial    The serial number of the card.
   * @param isAdmin   Whether the card is admin or not.
   * @param remove    True to remove the card (only the ID is sent), false to
   *                  update it (all necessary data is sent).
   */
  private updateCardInControllersGeneral(selector: Selector, cardID: number, companyID: number, serial: number, isAdmin: boolean, remove: boolean = false) {
    for (const nodeAttach of selector.nodeAttachments) {
      if (nodeAttach.loggedToController) {
        nodeAttach.addCommandForControllerBody(
          codes.CMD_CONFIG_SET,
          -1,
          remove ? [codes.VALUE_CARD_EMPTY.toString(), cardID.toString()] : [codes.VALUE_CARD.toString(), cardID.toString(), companyID.toString(), serial.toString(), isAdmin ? "1" : "0"]
        );
      }
    }
  }

  /**
   * Disable one item in a table in a database.
   *
   * @param name         Name of the item being disabled.
   * @param parts        List of parts to get the ID of the item to disable.
   * @param disableQuery Query to disable the item.
   * @param id           ID of the message being processed.
   * @param nodeID       ID of the node for which to build the query. Can be -1 to
   *                     ignore it and use the query as it is provided.
   * @returns The ID of the item that was disabled. 0 if an error occurred.
   */
  private async disableItem(name: string, parts: string[], disableQuery: string, id: number, nodeID: number = -1): Promise<number> {
    const itemData = this._parseMessage(parts, queries.idParse, id);
    if (!itemData) return 0;
    let disabledID = itemData[0].getInt();
    if (await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(disableQuery, nodeID), [disabledID])) {
      this._log(`Disabled item '${name}' ID = ${disabledID}`);
      // this._log(`Disabled id returned by ResultSetHeader: Insert ID ${res.insertId} Affected: ${res.affectedRows}`);
      this._addResponse(id, codes.AIO_OK);
    } else {
      this._log(`Error disabling item '${name}' ID = ${disabledID}`);
      this._addResponse(id, codes.ERR_EXECUTING_QUERY);
      disabledID = 0;
    }
    return disabledID;
  }

  /**
   * Get the database name, get the items requested by a query and send the rows
   * as separated items. Send a end of message when there are no more rows. The
   * {@linkcode AUTO_INCREMENT} is not sent so this method should be used for fixed
   * length list.
   *
   * @param parts Iterator to get the node ID from (to build the database name).
   * @param id    ID of the message being processed.
   * @param query Query to get the items. Usually a SELECT
   * @param value Header for each item.
   * @param end   Header for the end message.
   */
  private async getDBNameExecuteSend(parts: string[], id: number, query: string, value: number, end: number, log: boolean, tableName: string | null = null) {
    this._log(`Received get value 0x${value.toString(16)}`);
    const nodeData = this._parseMessage(parts, queries.idParse, id);
    if (!nodeData) {
      this._log(`Node ID is missing. Message ID = ${id}`);
      return;
    }
    const nodeID = nodeData[0].getInt();
    const result = await executeQuery<RowDataPacket[]>(BaseAttach.formatQueryWithNode(query, nodeID));
    let idData: RowDataPacket[] | null = null;
    if (tableName) {
      idData = await executeQuery<RowDataPacket[]>(util.format(queries.nextIDForNode, tableName, BaseAttach.getNodeDBName(nodeID)), null, true);
    }
    this._addListNoEmpty(value, end, result, id, log, idData, tableName !== null);
  }

  /**
   * Check a list of the common operations that only require to read items from
   * the database and send them with no further processing. Used for tables that
   * are not in a node's database and for tables with no 'empty' items.
   *
   * @param value Value requested to read and send.
   * @param id    ID of the message being processed.
   * @returns True if the operation requested was in the list, false otherwise.
   */
  private async simpleReadAndSend(value: number, cmdID: number): Promise<boolean> {
    for (let i = 0; i < queries.tableTuples.length; i++) {
      const tt = queries.tableTuples[i];
      if (tt.valueNormal === value) {
        // consolethis._log\(queries.tableTuples[i])
        let items: RowDataPacket[] | null = null;
        if (value === codes.VALUE_USER) {
          items = await executeQuery<db2.Usuario2[]>(queries.tableTuples[i].selectQuery);
          if (items) {
            for (const item of items) {
              const newItem = <db2.Usuario2>item;
              newItem.fecha = useful.fixDate(newItem.fecha);
              // consolethis._log\(newItem.fecha)
            }
          }
        } else {
          items = await executeQuery<RowDataPacket[]>(queries.tableTuples[i].selectQuery);
        }

        const nextID = await this.getNextID(tt.table);
        // consolethis._log\(nextID ? 'ID' : 'ID null')
        // consolethis._log\(items?'Items':'Items null')
        // if (value === codes.VALUE_USER) {
        //   consolethis._log\(items)
        // }
        this._addListNoEmpty(tt.valueNormal, tt.valueEnd, items, cmdID, tt.logOnSend, nextID);
        return true;
      }
    }
    return false;
  }

  private getNextID(tableName: string): Promise<db2.ID[] | null> {
    const q = util.format(queries.nextIDForGeneral, tableName);
    // consolethis._log\(q)
    return executeQuery<db2.ID[]>(q, null, true);
  }

  /**
   * Send a list of active workers from the table `general.personal`
   *
   * @param endID ID of the end message.
   * @param log   Whether to log or not the messages send for each item.
   */
  private async addWorkers(endID: number, log: boolean) {
    const workerData = await executeQuery<db2.Personal2[]>(queries.workersSelect);
    const nextID = await this.getNextID("personal");
    if (!workerData || !nextID) {
      return;
    }
    let count = 0;
    // Add individual workers
    if (workerData.length > 0) {
      const workerKeys = Object.keys(workerData[0]);
      const photoIndex = workerKeys.indexOf("foto");
      for (const worker of workerData) {
        const workerValues = Object.values(worker);
        const base64Values = await useful.readWorkerPhotoAsBase64(worker.foto);
        const body: string[] = [];
        for (let j = 0; j < workerKeys.length; j++) {
          body.push(j == photoIndex ? base64Values ?? codes.SEP_MTY : workerValues[j].toString());
        }
        const msg = new Message(codes.VALUE_WORKER, 0, body).setLogOnSend(log);
        // this._log(useful.lastPart(msg.message))
        this._addOne(msg);
        count++;
      }
    }
    // this._log(`Added ${count} workers with value 0x${codes.VALUE_WORKER.toString(16)}`);
    // Add end of workers
    if (nextID && nextID.length === 1) {
      this._addEnd(codes.VALUE_WORKER_END, endID, nextID[0].AUTO_INCREMENT);
      // this._log("Added end workers.");
    }
  }

  /**
   * Add the list of active controllers from the table `general.controlador`.
   *
   * @param selector Selector containing the socket attachments to know each
   *                 controller state.
   * @param endID    ID of the message being processed.
   * @param log      True to log the messages when they are send.
   */
  private async addNodes(selector: Selector, endID: number, log: boolean) {
    const nodes = await executeQuery<db2.Controlador2[]>(queries.nodeSelect);
    const nextID = await this.getNextID("controlador");
    if (!nodes || !nextID) return;
    let count = 0;
    // Add individual nodes
    for (let node of nodes) {
      const nodeValues = Object.values(node);
      const body: string[] = [];
      for (let j = 0; j < nodeValues.length; j++) {
        body.push(nodeValues[j].toString());
      }
      body.push(selector.getNodeState(node.ctrl_id).toString());
      this._addOne(new Message(codes.VALUE_NODE, 0, body).setLogOnSend(log));
      // this._log(`${count}`)
      count++;
    }
    // this._log(`Added ${count} nodes with value 0x${codes.VALUE_NODE.toString(16)}.`);
    // Add end of nodes
    if (nextID && nextID.length === 1) {
      this._addEnd(codes.VALUE_NODES_END, endID, nextID[0].AUTO_INCREMENT);
      // this._log("Added end nodes.");
    }
  }
}

/**
 * Container of `net.Socket` for controllers and the logged in manager. Implements useful methods to handle said sockets.
 */
export class Selector {
  nodeAttachments: NodeAttach[] = [];
  readonly managerConnections: ManagerAttach[] = [];

  /**
   * Check the selector's registered channels for an attachment with a
   * specific ID.
   *
   * @param selector Selector containing the keys.
   * @param nodeID   ID to look for in the attachment.
   * @returns The {@linkcode NodeAttach} object matching the ID, or null if there was no
   *         match.
   */
  getNodeAttachByID(nodeID: number): NodeAttach | null {
    for (const nodeAttach of this.nodeAttachments) {
      if (nodeAttach.controllerID === nodeID) {
        return nodeAttach;
      }
    }
    return null;
  }

  /**
   * Test whether a node is connected or not to the back end.
   *
   * @param selector Selector containing the sockets currently being used.
   * @param nodeID   The ID of the node being tested. The same ID that is being
   *                 used in the database.
   * @returns True if the node is connected, false otherwise.
   */
  getNodeState(nodeID: number): number {
    const nodeAttach = this.getNodeAttachByID(nodeID);
    if (nodeAttach) {
      if (Selector.isChannelConnected(nodeAttach._currentSocket)) {
        return nodeAttach.loggedToController ? codes.VALUE_CONNECTED : codes.VALUE_DENIED;
      }
    }
    return codes.VALUE_DISCONNECTED;
  }

  /**
   *
   * @param key The socket being tested.
   * @returns True if the socket is connected.
   */
  static isChannelConnected(key: net.Socket | null): boolean {
    if (key) {
      return !key.closed && !key.destroyed && !key.connecting;
    }
    return false;
  }

  /**
   * End and destroy the inner socket of the attachment, if not null.
   * @param attach The attachment containig the socket.
   */
  private simpleCancel(attach: BaseAttach) {
    attach._currentSocket?.removeAllListeners();
    attach._currentSocket?.end();
    attach._currentSocket?.destroy();
    attach._currentSocket = null;
    if (attach instanceof NodeAttach) {
      // Remove node attachment
      const idx = this.nodeAttachments.indexOf(attach);
      if (idx >= 0) {
        this.nodeAttachments.splice(idx, 1);
      }
      // console.log('Was a NodeAttach.')
    } else if (attach instanceof ManagerAttach) {
      // Remove manager attachment
      const index = this.managerConnections.indexOf(attach);
      if (index >= 0) {
        this.managerConnections.splice(index, 1);
      }
      // console.log("Was a ManagerAttach.");
    } else {
      console.log("Unknown instance.");
    }
  }

  /**
   * Clear the attachment, close the channel and cancel the key. This should be
   * used after an attempt to close the socket properly has been made, the channel
   * was closed from the other end or in general when the socket is no longer
   * needed. If the attachment is a {@linkcode BaseAttach}, mark it as not selectable.
   *
   * @param key Key to perform on.
   * @returns True if the attachment was an instance of {@linkcode ManagerAttach},
   *         false otherwise.
   */
  cancelChannel(attach: BaseAttach): boolean {
    const isManager = attach instanceof ManagerAttach;
    if (isManager) {
      const mngrAttach = <ManagerAttach>attach;
      if (mngrAttach.isLoggedIn()) {
        ManagerAttach.isAnotherLoggedIn = false;
      }
    } else if (attach instanceof NodeAttach) {
      const nodeAttach = <NodeAttach>attach;
      nodeAttach._selectable = false;
      nodeAttach.loggedToController = false;
    }
    this.simpleCancel(attach);
    return isManager;
  }
}
