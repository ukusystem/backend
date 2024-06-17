import { NodeAttach, ManagerAttach, Selector, BaseAttach } from "./baseAttach";
// import { Personal } from "../../../controllers/ticket/createTicket";
import { Changes, Result, States, getState } from "./enums";
// import { Solicitante } from "../../../controllers/ticket";

import { PartialTicket } from "./partialTicket";
import { RequestResult } from "./requestResult";
import { AtomicNumber } from "./atomicNumber";
import { FinishTicket } from "./finishTicket";
import { PartialNode } from "./partialNode";
import { executeQuery } from "./dbManager";
import { ResultCode } from "./resultCode";
import { ResultSetHeader } from "mysql2";
import { Logger } from "./logger";
import { Camera } from "./camera";
import { Bundle } from "./bundle";
import { Mortal } from "./mortal";
import { Ticket ,type  Personal, type Solicitante } from "./ticket";
import { PinOrder } from "./types";
import fs from "fs";
import * as config from "./../../../configs/server.configs";
import * as queries from "./queries";
import * as useful from "./useful";
import * as codes from "./codes";
import * as db2 from "./db2";
import * as util from "util";
import * as net from "net";
import { CameraMotionMap } from "../../camera/CameraMotion";
import * as cp from "child_process";

export class Main {
  /**
   * Whether the object has already been created and the service has already started running
   */
  private static running = false;

  // year in seconds 31,536,000
  // month in seconds 2,628,000
  private static readonly TABLES_INTERVAL = 2628000;

  private static readonly REQUEST_TIMEOUT = 5 * 1000;

  private static readonly ALIVE_INTERVAL_MS = 2 * 1000;
  private static readonly ALIVE_TIMEOUT = 15;
  private static readonly MANAGER_ALIVE_TIMEOUT = 10;

  private static readonly TICKET_CHECK_PERIOD = 1 * 1000;

  private static readonly ALIVE_CAMERA_INTERVAL_MS = 4 * 1000;

  private static readonly ALIVE_CAMERA_REACH_TIMEOUT_MS = 2 * 1000;
  private static readonly ALIVE_CAMERA_TIMEOUT = 16;

  private static readonly MANAGER_TIMEOUT = 10 * 1000;

  private static readonly LOGGER_RELATIVE_PATH = "./logs";
  private readonly tag = "█ ";
  private readonly logger: Logger;

  /* Container of `net.Socket` */
  private readonly selector = new Selector();

  private managerServer: net.Server | null = null;

  /* Flags to keep timeouts active */

  private sendMessagesTimer: NodeJS.Timeout | null = null;
  private disconnectionTimer: NodeJS.Timeout | null = null;
  private checkCamerasTimer: NodeJS.Timeout | null = null;
  private ticketsTimer: NodeJS.Timeout | null = null;
  private tablesInterval: NodeJS.Timeout | null = null;

  private processMessages = true;

  /**
   * List of cameras to check their connection state.
   */
  private readonly cameras: Camera[] = [];

  /**
   * Approved tickets are stored here, grouped by nodes, to send them when the
   * controller has space.
   */
  private readonly ticketsBuffer = new Map<number, PartialNode>();

  /**
   * Whether the initialization of the service has been successful and the service can start running. The conditions are:
   * - The service is not running
   * - The required folders have been created
   */
  #conditionsMet = true;

  // static readonly isWindows2 = useful.isWindows();
  // static readonly isWindows2 = true;
  static  isWindows = false

  constructor() {
    Main.isWindows = useful.isWindows();
    /* Logger */

    this.logger = new Logger("msControllerService", Main.LOGGER_RELATIVE_PATH);

    /* Check for double running */

    if (Main.running) {
      this.log("Already created and running");
      this.#conditionsMet = false;
      return;
    }

    /* Create folders */

    try {
      fs.mkdirSync(Main.LOGGER_RELATIVE_PATH, { recursive: true });
      this.log("Directories created");
    } catch (e) {
      this.#conditionsMet = false;
      this.log("Error creating directories");
    }

    /* Init messages */

    this.log("████ BACKEND INIT ████");
    this.log(`Running on ${useful.isWindows() ? "Windows" : useful.isLinux() ? "Linux" : "Unknown OS"}`);

    /* Events to clean up */

    process.once("SIGINT", (signal) => {
      this.end(signal);
    });

    process.once("SIGTERM", (signal) => {
      this.end(signal);
    });

    process.once("SIGHUP", (signal) => {
      this.end(signal);
    });

    /* Database manager */

    // this.dbManager = new DBManager(this.#logger)
  }

  async run() {
    if (this.#conditionsMet) {
      Main.running = true;
    } else {
      this.log("Conditions are not met. Can't continue.");
      return;
    }

    /* Load data from database */

    if (!(await this.loadNodes())) {
      return;
    }
    await this.loadActiveCameras();
    await this.loadAcceptedTickets();

    /* Server for manager */

    this.startServerForManager();

    /* Try to connect to controllers */

    await this.startNodes();

    /* Start interval to send messages */

    this.startSendingMessages();

    /* Start intervals to check states and send tickets */

    setTimeout(this.processOneFromAll, 1);
    setTimeout(this.startDisconnectionDetection, Main.ALIVE_INTERVAL_MS, this.selector);
    setTimeout(this.startCamerasCheck, Main.ALIVE_CAMERA_INTERVAL_MS);

    // this.startCamerasCheck();
    this.startTicketsCheck();
  }

  /**
   * Process one cashed message from all sockets registered. Af the end of the method, a timeout is set to call it again, thus simulating a loop.
   */
  private processOneFromAll = async () => {
    for (const node of this.selector.nodeAttachments) {
      const code = new ResultCode();
      const bundle = new Bundle();
      await node.readOne(this.selector, code, bundle);
    }

    // Process messages from managers
    for (const manager of this.selector.managerConnections) {
      const code = new ResultCode();
      const bundle = new Bundle();
      await manager.readOne(this.selector, code, bundle);
      switch (code.code) {
        case Result.CAMERA_ADD:
        case Result.CAMERA_UPDATE:
          this.addUpdateCamera(bundle.targetCamera);
          break;
        case Result.CAMERA_DISABLE:
          this.removeCamera(bundle.targetCamera.nodeID, bundle.targetCamera.cameraID);
          break;
        default:
          break;
      }
    }
    if (this.processMessages) {
      setTimeout(this.processOneFromAll, 1);
    }
  };

  /**
   * Remove one camera from the list used to check their connection state.
   *
   * @param nodeID   Camera node ID
   * @param cameraID Camera ID
   */
  private removeCamera(nodeID: number, cameraID: number) {
    let found = false;
    for (let i = 0; i < this.cameras.length; i++) {
      const current = this.cameras[i];
      if (current.nodeID == nodeID && current.cameraID == cameraID) {
        this.cameras.slice(i, 1);
        found = true;
        this.log(`Remove camera ${current} from checking list`);
        break;
      }
    }
    if (!found) {
      this.log(`Camera ID=${cameraID} Node ID=${nodeID} not found`);
    }
    this.log(`Total cameras: ${this.cameras.length}`);
  }

  /**
   * Add or update a camera in the buffer, depending on whether it already exists
   * or not. The camera will be updated if an existing one has the same camera ID
   * and node ID. Otherwise, it will be added.
   *
   * @param newCamera The data of the new camera or data to update with.
   */
  private addUpdateCamera(newCamera: Camera) {
    let found = false;
    for (let i = 0; i < this.cameras.length; i++) {
      const current = this.cameras[i];
      if (current.nodeID == newCamera.nodeID && current.cameraID == newCamera.cameraID) {
        found = true;
        this.cameras[i] = newCamera;
        this.log(`Updated camera to '${newCamera}' in checking list`);
        break;
      }
    }
    if (!found) {
      this.cameras.push(newCamera);
      executeQuery(BaseAttach.formatQueryWithNode(queries.insertCameraState, newCamera.nodeID), [newCamera.cameraID, useful.getCurrentDate(), Mortal.DEFAULT_INITIAL_STATE]);
      this.log(`Added camera ${newCamera} to checking list`);
    }
    this.log(`Total cameras: ${this.cameras.length}`);
  }

  private startSendingMessages() {
    this.sendMessagesTimer = setInterval(() => {
      // Send messages to controllers
      for (const node of this.selector.nodeAttachments) {
        node.sendOne(this.selector);
      }

      // Send messages to managers
      for (const manager of this.selector.managerConnections) {
        manager.sendOne(this.selector);
      }
    }, 1);
  }

  /**
   * Start the server for the managers.
   */
  private startServerForManager() {
    this.managerServer = net.createServer((connection) => {
      try {
        const newManagerSocket = new ManagerAttach(this.logger, connection);
        this.selector.managerConnections.push(newManagerSocket);
        this.log(`Managers after push: ${this.selector.managerConnections.length}`);

        connection.setTimeout(Main.MANAGER_TIMEOUT, () => {
          this.log("Manager idle timeout");
          // Activate when the manager sends keep alives to the server.
          // newManagerSocket.reconnect(this.selector)
        });

        connection.on("data", (data: Buffer) => {
          // this.log(`Received '${data}'`);
          newManagerSocket.addData(data);
        });

        connection.on("end", () => {
          this.log("Manager disconnected");
          newManagerSocket.reconnect(this.selector);
        });

        // Triggers 'end' and 'close' events
        connection.on("error", () => {
          this.log("Manager error");
          // newManagerSocket.reconnect(this.selector);
        });

        connection.on("close", (hadError) => {
          this.log(`Manager closed. ${hadError ? "With" : "No"} error.`);
          newManagerSocket.reconnect(this.selector);
        });

        this.log("Manager accepted and events set.");
      } catch (e) {
        this.log("Error setting object for manager");
      }
    });

    this.managerServer.on("error", (e: any) => {
      this.log(`ERROR listening to managers. Code ${e.code}`);
    });

    this.managerServer.listen(config.MANAGER_PORT, config.SERVER_IP, 16, () => {
      this.log(`Server for managers listening on ${config.MANAGER_PORT}`);
    });
  }

  /**
   * Load information related to the nodes.
   * @returns False if the nodes could not be read from the database or if some tables could not be created, true otherwise.
   */
  private async loadNodes(): Promise<boolean> {
    // Get nodes
    const res = await executeQuery<db2.Controlador2[]>(queries.nodeGetForSocket);
    if (!res) {
      this.log("ERROR Querying nodes.");
      return false;
    }

    // Fill nodes
    for (const node of res) {
      const newNode = NodeAttach.getInstanceFromPacket(node, this.logger);
      this.selector.nodeAttachments.push(newNode);
    }

    // Verify temperature tables before the communication with the nodes start
    if (!(await this.checkTablesForNodes(true))) {
      return false;
    }

    // Set a monthly timer to create tables for the following years if the month>=11
    this.tablesInterval = setInterval(async () => {
      await this.checkTablesForNodes(false);
    }, Main.TABLES_INTERVAL);

    this.log(`Loaded ${this.selector.nodeAttachments.length} nodes.`);

    return true;
  }

  /**
   * Create tables for temperatures.
   * @param current Whether to create a table for the current year.
   * @returns False if a table could not be created.
   */
  private async checkTablesForNodes(current: boolean): Promise<boolean> {
    // Get year, month
    const year = useful.getYear();
    const month = useful.getMonth();
    if (!month || !year) {
      this.log("ERROR: Could not get the month or year.");
      return false;
    }
    for (const node of this.selector.nodeAttachments) {
      if (!(await BaseAttach._checkTablesStatic(node.controllerID, month, year, current))) {
        this.log(`ERROR Could not create temperature table for node ID ${node.controllerID}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Read nodes from database, cancel current keys that are related to controllers
   * in selector, start a connection for each node and register them in the
   * selector.
   */
  private async startNodes() {
    for (const node of this.selector.nodeAttachments) {
      // Save initial state. Disconnected by default.
      await node.insertNet(false);
      node.tryConnectNode(this.selector, true, false);
    }
    this.log("Nodes started.");
  }

  /**
   * If the ticket exists, remove it from the pending list and send a
   * {@linkcode Codes.CMD_TICKET_REMOVE} command.
   *
   * @param nodeID
   * @param ticketID
   */
  private async removeTicket(nodeID: number, ticketID: number) {
    this.log("Removing ticket...");
    const partialNode = this.ticketsBuffer.get(nodeID);
    if (!partialNode) {
      this.log(`Ticket ID = ${ticketID} has no partial node ID ${nodeID}`);
      return;
    }
    const tickets = partialNode.tickets;
    let found = false;
    // Remove from pending
    for (let i = 0; i < tickets.length; i++) {
      if (tickets[i].ticketID == ticketID) {
        found = true;
        tickets.splice(i, 1);
        this.log(`Ticket ID = ${ticketID} removed from pending`);
        break;
      }
    }
    // Remove from controller
    const nodeOptional = this.selector.getNodeAttachByID(nodeID);
    if (!nodeOptional) {
      this.log(`No node attach ID = ${nodeID}`);
    } else {
      if (nodeOptional.loggedToController) {
        nodeOptional.addCommandForControllerBody(codes.CMD_TICKET_REMOVE, -1, [ticketID.toString()]);
        this.log("Added command for controller.");
      } else {
        this.log(`Node ID = ${nodeID} was not connected.`);
      }
    }
    if (!found) {
      this.log(`Could not find ticket ID = ${ticketID} in pending list`);
    }
    let count = 0;
    for (const partial of this.ticketsBuffer.values()) {
      count += partial.tickets.length;
    }
    this.log(`Total tickets: ${count}`);
  }

  /**
   * Add a ticket to the pending list that is supposed to be accepted. It will be
   * send as soon as the controller has space.
   *
   * @param nodeID        ID of the target node as it appears in the database.
   * @param partialTicket The ticket data.
   */
  private addTicket(nodeID: number, partialTicket: PartialTicket) {
    const partialNode = this.ticketsBuffer.get(nodeID);
    if (partialNode) {
      partialNode.tickets.push(partialTicket);
      this.log(`Ticket ID = ${partialTicket.ticketID} added to node ${nodeID}`);
    } else {
      const newPartialNode = new PartialNode();
      newPartialNode.tickets.push(partialTicket);
      this.ticketsBuffer.set(nodeID, newPartialNode);
      this.log(`New partial node created ID = ${nodeID} and ticket ID = ${partialTicket.ticketID} added`);
    }
    let count = 0;
    for (const partial of this.ticketsBuffer.values()) {
      count += partial.tickets.length;
    }
    this.log(`Total tickets: ${count}`);
  }

  private static validateSolicitor(solicitor: Solicitante): boolean {
    return solicitor.tt_id > 0 && solicitor.sn_id > 0 && solicitor.ctrl_id > 0 && solicitor.p_id > 0 && solicitor.co_id > 0;
  }

  private static validateWorker(worker: Personal): boolean {
    return worker.c_id > 0 && worker.co_id > 0;
  }

  /**
   * Convert this instance to an array that fits the parameters needed by
   * {@linkcode queries.insertWorker}. (nombre, telefono, dni, c_id, co_id, rt_id, foto)
   *
   * @param ticketID ID of the ticket to register this worker to.
   * @param filename Value to fill in the column called 'foto'.
   * @returns Array of parameters.
   */
  private workerToArrayForQuery(worker: Personal, ticketID: number, filename: string | null): any[] {
    return [worker.nombre, worker.apellido, worker.telefono, worker.dni, worker.c_id, worker.co_id, ticketID, filename];
  }

  private async finishTicket(finalState: number, ticketID: number, nodeID: number) {
    await executeQuery(BaseAttach.formatQueryWithNode(queries.finishTicket, nodeID), [finalState, useful.getCurrentDate(), ticketID]);
    this.log(`Final state of ticket ID = ${ticketID} : ${finalState}`);
  }

  /**
   * Process an order to change the state of a ticket. This method considers that
   * all the possible states of the ticket can only be 4: ACCEPTED,
   * WAITING_APPROVE, CANCELLED or REJECTED. Other states in the database or as an
   * action is illegal and ends execution of this method.
   *
   * @param newFinish Order data from the web application
   * @returns The result of the operation
   */
  async onFinishTicket(newFinish: FinishTicket): Promise<RequestResult> {
    if (!newFinish.isValid()) {
      this.log(`Invalid finish ticket`);
      return new RequestResult(false, `Algún campo contiene un valor fuera de rango.`);
      // return States.ILLEGAL;
    }
    // Read the ticket info from database
    const ticketID = newFinish.rt_id;
    const nodeID = newFinish.ctrl_id;
    // co_id, fechacomienzo, fechatermino, estd_id
    const ticketData = await executeQuery<db2.OneTicket[]>(BaseAttach.formatQueryWithNode(queries.ticketSelectOne, nodeID), [ticketID]);
    if (!ticketData) {
      this.log(`No ticket data for ID = ${ticketID}`);
      return new RequestResult(false, `Error leyendo ticket ID = ${ticketID} de la base de datos.`);
      // return States.ERROR;
    }
    // Monitor state by default
    let monitor = States.ERROR;
    // Get current state
    const currentState = getState(ticketData[0].estd_id);
    let isFinal = false;
    switch (currentState) {
      case States.FINISHED:
      case States.NULLIFIED:
      case States.CANCELLED:
      case States.REJECTED:
      case States.UNATTENDED:
        isFinal = true;
        break;
      default:
        isFinal = false;
    }
    let second = false;
    switch (currentState) {
      case States.ACCEPTED:
      case States.WAITING_APPROVE:
        second = true;
        break;
      default:
        second = false;
    }
    const isExpected = isFinal || second;
    // Check illegal states
    if (!isExpected) {
      this.log("Error getting current ticket state. Unknown state.");
      return new RequestResult(false, `El ticket ID = ${ticketID} tiene un estado inválido.`);
      // return States.ILLEGAL;
    }
    const newAction = getState(newFinish.action);
    if (newAction == States.IMPOSSIBLE) {
      this.log("Unknown new action.");
      return new RequestResult(false, `Acción inválida para el ticket.`);
      // return States.ILLEGAL;
    }

    // Execute order

    // Check for final states
    if (isFinal) {
      this.log(`Ticket ID=${ticketID} is already finished with state ${currentState}`);
      return new RequestResult(false, `El ticket ya está finalizado.`);
      // return States.EXECUTED;
    } else {
      // Can only request to accept, reject, cancel or unattended.
      if (currentState == States.WAITING_APPROVE) {
        // These events can happen only when the ticket is waiting for approve.
        switch (newAction) {
          case States.ACCEPTED:
            const start = useful.datetimeToLong(ticketData[0].fechacomienzo);
            const end = useful.datetimeToLong(ticketData[0].fechatermino);
            this.finishTicket(States.ACCEPTED, ticketID, nodeID);
            this.addTicket(nodeID, new PartialTicket(ticketID, ticketData[0].co_id, start, end));
            monitor = States.EXECUTED;
            break;
          case States.CANCELLED:
          case States.REJECTED:
          case States.UNATTENDED:
            // At this point, the current state can only be ACCEPTED or WAITING_APPROVE so
            // it can always be rejected.
            this.finishTicket(newAction, ticketID, nodeID);
            // Ticket was never accepted so there is no need to alter the pending tickets,
            // but anyways.
            this.removeTicket(nodeID, ticketID);
            monitor = States.EXECUTED;
            break;
          default:
            this.log(`Illegal new action. Current state: ${currentState} Action: ${newAction}`);
            monitor = States.ILLEGAL;
            break;
        }
      } else if (currentState == States.ACCEPTED) {
        switch (newAction) {
          // These events can happen only if the ticket is accepted.
          // FINISHED, NULLIFIED can happen only if the ticket is also in time.
          // CANCELLED, REJECTED can happen only if the current time is before the start time.
          case States.FINISHED:
          case States.NULLIFIED:
          case States.CANCELLED:
          case States.REJECTED:
            this.finishTicket(newAction, ticketID, nodeID);
            // Ticket was never accepted so there is no need to alter the pending tickets,
            // but anyways.
            this.removeTicket(nodeID, ticketID);
            monitor = States.EXECUTED;
            break;
          default:
            this.log(`Illegal new action. Current state: ${currentState} Action: ${newAction}`);
            monitor = States.ILLEGAL;
            break;
        }
      }
    }
    if (monitor === States.EXECUTED) {
      return new RequestResult(true, `Acción ejecutada.`);
    }
    return new RequestResult(false, `Error interno.`);
    // return monitor;
  }

  /**
   * Process an order to create a ticket.
   *
   * @param newTicket Order data from the web application
   * @returns The result of the operation
   */
  async onTicket(newTicket: Ticket): Promise<RequestResult> {
    const solicitor = newTicket.solicitante;
    if (!Main.validateSolicitor(solicitor)) {
      this.log("Solicitor is not valid");
      // return States.ILLEGAL;
      return new RequestResult(false, "Algún campo contiene un valor fuera de rango.");
    }
    const nodeID = solicitor.ctrl_id;
    if (!this.selector.getNodeAttachByID(nodeID)) {
      this.log(`Node ${nodeID} does not exist.`);
      // return States.NONEXISTENT;
      return new RequestResult(false, `El controlador con ID ${newTicket.solicitante.ctrl_id} no existe`);
    }
    const insertedTicket = await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertTicket, nodeID), newTicket.toArrayForQuery());
    if (!insertedTicket) {
      this.log("Error inserting ticket");
      // return States.ERROR;
      return new RequestResult(false, `Error creando ticket`);
    }
    const insertedID = insertedTicket.insertId;
    // Save workers
    for (const worker of newTicket.personales) {
      if (!Main.validateWorker(worker)) {
        this.log(`Invalid worker: ${worker}`);
        continue;
      }
      // Write photo, if conditions are met
      const byteSize = new AtomicNumber();
      const newFileName = await this.processPhotoField(worker, byteSize, nodeID);
      this.log(`File writing result: Filename = '${newFileName ?? "<photo not present>"}' Written = ${byteSize.inner} bytes`);
      // Save worker. All workers who are going to visit the node must have been sent
      // in the JSON.
      if (await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertWorker, nodeID), this.workerToArrayForQuery(worker, insertedID, newFileName))) {
        this.log(`Worker added: Ticket ID ${insertedID} Worker '${worker}'`);
      } else {
        this.log(`Error adding worker: Ticket ${insertedID}`);
      }
    }
    // Save documents
    for (const doc of newTicket.archivos_cargados) {
      if (await executeQuery(BaseAttach.formatQueryWithNode(queries.insertDocument, nodeID), [doc.ruta, doc.nombreoriginal, doc.tipo, insertedID])) {
        this.log(`Added file: Ticket ID ${insertedID} Name '${doc}'`);
      } else {
        this.log(`Error adding file: Ticket ID ${insertedID} Name '${doc}'`);
      }
    }
    this.log(`Ticket created ID ${insertedID}.`);
    // return States.EXECUTED;
    return new RequestResult(true, `Ticket creado`,insertedID);
  }

  /**
   * Process an order to set a state on an output.
   *
   * @param newOrder Order data from the web application
   * @returns The result of the operation
   */
  async onOrder(newOrder: PinOrder): Promise<RequestResult> {
    // Validate order
    if (newOrder.pin <= 0 || newOrder.ctrl_id <= 0) {
      this.log("Pin or node ID negative.");
      // return States.ILLEGAL;
      return new RequestResult(false, "Algún campo contiene un valor fuera de rango.");
    }
    let newState = codes.VALUE_TO_AUTO; // Automatic state by default.
    switch (newOrder.action) {
      case 1:
        newState = codes.VALUE_TO_ACTIVE;
        break;
      case 0:
        newState = codes.VALUE_TO_AUTO;
        break;
      case -1:
        newState = codes.VALUE_TO_INACTIVE;
        break;
      default:
        this.log(`Invalid action number '${newOrder.action}'.`);
        // return States.ILLEGAL;
        return new RequestResult(false, "Algún campo contiene un valor fuera de rango.");
    }

    // Check node connection
    const nodeKey = this.selector.getNodeAttachByID(newOrder.ctrl_id);
    if (!nodeKey) {
      this.log(`Controller ${newOrder.ctrl_id} doesn't exist.`);
      // return States.NONEXISTENT;
      return new RequestResult(false, `El nodo ID = ${newOrder.ctrl_id} no existe`);
    }

    // Asynchronous task
    const myPromise: Promise<RequestResult> = new Promise(async (resolve, reject) => {
      let monitor = States.ERROR;
      let ignoreTimeout = false;
      if (Selector.isChannelConnected(nodeKey._currentSocket)) {
        // Timeout for this operation
        const reqHandle = setTimeout(() => {
          if (ignoreTimeout) {
            return;
          }
          this.log(`Remove message ID = ${msgID}by timeout.`);
          // Message has to be removed anyways
          nodeKey.removePendingMessageByID(msgID, codes.ERR_TIMEOUT, true, false);
          monitor = States.TIMEOUT;
          this.registerOrder(newOrder, monitor);
          // resolve(monitor)
          resolve(new RequestResult(false, `El controlador ID = ${newOrder.ctrl_id} no ha respondido a tiempo.`));
        }, Main.REQUEST_TIMEOUT);
        // Send order to controller
        const msgID = nodeKey.addCommandForControllerBody(codes.CMD_PIN_CONFIG_SET, -1, [newOrder.pin.toString(), newState.toString()], true, true, (code) => {
          ignoreTimeout = true;
          clearTimeout(reqHandle);
          monitor = States.EXECUTED;
          this.registerOrder(newOrder, monitor);
          // resolve(monitor)
          resolve(new RequestResult(true, `Order ejecutada.`));
          this.log(`Response from controller ${code}`);
        });
        this.log("Added order for controller. Waiting response...");
      } else {
        this.log(`Controller ${newOrder.ctrl_id} disconnected.`);
        monitor = States.DISCONNECTED;
        this.registerOrder(newOrder, monitor);
        // resolve(monitor)
        resolve(new RequestResult(true, `El controlador ID = ${newOrder.ctrl_id} no está conectado.`));
      }
    });
    return myPromise;
  }

  /**
   * Save the order event in the database.
   * @param order The order received.
   * @param state The resulting state of the order.
   */
  private async registerOrder(order: PinOrder, state: number) {
    // This is the default data that should be saved when an error occurs.
    // pin, orden, fecha, estd_id
    const params = [order.pin, order.action, useful.getCurrentDate(), state];
    this.log(`Inserting request result ${state}`);
    await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.insertRequest, order.ctrl_id), params);
  }

  /**
   * Process the field {@linkcode foto}. If the worker is new, {@linkcode foto} may
   * contain the worker's photo in base 64 format. If not new, {@linkcode foto} must
   * contain the photo file name and that file should already exist.
   *
   * @param byteSize If the photo file is written, the amount of bytes written is
   *                 stored here. If an error occurred, ``-1`` is stored, is no file
   *                 was written, ``0`` is stored.
   * @param nodeID The ID of the node for which the ticket was created for.
   * @returns The proper filename to save in the database, or an error message if an error occurs.
   */
  private async processPhotoField(worker: Personal, byteSize: AtomicNumber, nodeID: number): Promise<string | null> {
    const millis = useful.timeInt();
    const fotoOptional = worker.foto;
    // Initial state. the case where (isNew && fotoOptional.isPresent()) can still
    // change, depending on the success of the file written and that value is set
    // inside the writing function.
    byteSize.inner = !worker.isNew != !fotoOptional ? 0 : -1;
    // Photo can be optional
    if (worker.isNew) {
      if (fotoOptional) {
        // The final byte size is defined here, if this case occurs
        if (await useful.writeNewTicketPhotoFromBase64(fotoOptional, millis, nodeID, byteSize)) {
          return useful.getReplacedPath(useful.getPathForNewWorkerPhoto(nodeID, millis));
        } else {
          return "error-WritingFile";
        }
      } else {
        //				return "error-PhotoWasOptional";
        return null;
      }
    }
    // Photo file name is mandatory
    else {
      return fotoOptional ?? "error-NoFotoOfExistingWorker";
    }
  }

  /**
   * Load accepted tickets from the database. This is called once on every start
   * of the program to load a buffer of pending tickets to send.
   */
  private async loadAcceptedTickets() {
    this.log("Loading approved tickets...");
    let nodes = 0;
    let tickets = 0;
    const nodesData = await executeQuery<db2.GeneralNumber[]>(queries.nodeSelectID);
    if (!nodesData) {
      this.log("Error getting nodes' IDs");
      return;
    }
    for (const node of nodesData) {
      nodes++;
      const nodeID = node.entero;
      const newNode = new PartialNode();
      if (this.ticketsBuffer.has(nodeID)) {
        this.log(`ERROR Node with duplicate ID? ID=${nodeID}`);
      } else {
        this.ticketsBuffer.set(nodeID, newNode);
      }
      const ticketsData = await executeQuery<db2.Ticket[]>(BaseAttach.formatQueryWithNode(queries.ticketSelectAccepted, nodeID));
      if (!ticketsData) {
        this.log(`Error getting approved tickets for node ID=${nodeID}`);
        continue;
      }
      for (const ticket of ticketsData) {
        tickets++;
        const start = useful.datetimeToLong(useful.fixDate(ticket.fechacomienzo));
        const end = useful.datetimeToLong(useful.fixDate(ticket.fechatermino));
        newNode.tickets.push(new PartialTicket(ticket.rt_id, ticket.co_id, start, end));
      }
    }
    this.log(`Loaded ${tickets} ticket(s) for ${nodes} node(s).`);
  }

  /**
   * Only active cameras are selected. The cameras are selected from all the
   * active nodes.
   */
  private async loadActiveCameras() {
    this.log("Starting cameras detection...");
    const nodesOptional = await executeQuery<db2.GeneralNumber[]>(queries.nodeSelectForCameraCheck);
    if (!nodesOptional) {
      this.log("Error reading nodes for cameras check.");
      return;
    }
    for (const node of nodesOptional) {
      const nodeID = node.entero;
      const camerasData = await executeQuery<db2.CameraForDetection[]>(util.format(queries.cameraSelectForConnection, BaseAttach.getNodeDBName(nodeID)));
      if (!camerasData) {
        this.log(`Error getting cameras for node ID = ${nodeID}`);
        return;
      }
      for (const camera of camerasData) {
        this.cameras.push(new Camera(camera.cmr_id, nodeID, camera.ip));
      }
    }
    this.log(`Cameras found: ${this.cameras.length}`);

    // Set initial states
    for (const cam of this.cameras) {
      executeQuery(BaseAttach.formatQueryWithNode(queries.insertCameraState, cam.nodeID), [cam.cameraID, useful.getCurrentDate(), Mortal.DEFAULT_INITIAL_STATE]);
    }
  }

  /**
   * Start a thread that, if there are pending tickets, periodically checks if a
   * controller can accept a ticket. If a controller has space for tickets and
   * there are tickets pending for that controller, the ticket is send and removed
   * from the buffer.
   */
  private startTicketsCheck() {
    this.ticketsTimer = setInterval(() => {
      for (const ticket of this.ticketsBuffer) {
        // If there are tickets left
        const ticketList = ticket[1].tickets;
        if (ticketList.length === 0) {
          // log("No tickets pending in node ID = %d", nodeID);
          continue;
        }
        // If node is registered
        const nodeID = ticket[0];
        const attach = this.selector.getNodeAttachByID(nodeID);
        if (!attach) {
          // log("No attachment for node ID = %d", nodeID);
          continue;
        }
        // If node is logged in
        if (!attach.loggedToController) {
          // log("Attachment ID = %d not logged", nodeID);
          continue;
        }
        attach.addCommandForControllerBody(codes.CMD_CONFIG_GET, -1, [codes.VALUE_CAN_ACCEPT_TICKET.toString()], true, true, (available: number) => {
          if (available <= 0) {
            this.log(`No space for ticket in node ID = ${nodeID}`);
            return;
          }
          // log("Available %d in controller ID=%d", available, nodeID);
          let count = 0;
          for (const ticket of ticketList) {
            attach.addCommandForControllerBody(codes.CMD_TICKET_ADD, -1, ticket.getBody(), true, true, async (rsp: number) => {
              if (rsp === codes.AIO_OK || rsp === codes.ERR_NO_CHANGE) {
                // Remove if the ticket can be updated in the database
                const toRemove = ticketList.indexOf(ticket);
                if (ticketList.splice(toRemove, 1)) {
                  this.log(`Removed ticket ID = ${ticket.ticketID} from list.`);
                } else {
                  this.log("Couldn't remove ticket. Maybe it was cancelled in the process?");
                }
                await executeQuery<ResultSetHeader>(BaseAttach.formatQueryWithNode(queries.ticketSetSent, nodeID), [ticket.ticketID]);
                this.log(`Ticket ID = ${ticket.ticketID} ${rsp === codes.AIO_OK ? "added to" : "was already in the"} controller.`);
              } else {
                this.log(`Couldn't add ticket ID = ${ticket.ticketID}. Error 0x${rsp.toString(16)}. Not removed.`);
              }
            });
            count++;
            if (count >= available) {
              break;
            }
          }
        });
      }
    }, Main.TICKET_CHECK_PERIOD);
  }

  private startCamerasCheck = async () => {
    for (const cam of this.cameras) {
      try {
        // Send ping or try to reach address
        if (Main.isWindows) {
          cp.exec(`ping ${cam.cameraIP} -n 1`, { timeout: Main.ALIVE_CAMERA_REACH_TIMEOUT_MS }, (error, stdout, stderror) => {
            if (error) {
              // this.log(`Error sending ping to ${cam.cameraIP}. Code ${error.code}`);
              // this.log(`Error output\n ${stderror}\nStdout\n${stdout}`)
            } else {
              const res = stdout.includes("TTL");
              // this.log(`Output\n${ res}`);
              if (res) {
                cam.setAlive();
              }
            }
          });
        } else {
          this.log(`Ping only implemented for Windows`);
        }

        cam.setState(!cam.isDead(Main.ALIVE_CAMERA_TIMEOUT));
        const change = cam.getChange();
        if (change !== Changes.NONE) {
          this.log(`Camera ID = ${cam.cameraID} in node ID = ${cam.nodeID} changed state to ${change === Changes.TO_ACTIVE ? "ACTIVO" : "INACTIVO"}`);
          await executeQuery(BaseAttach.formatQueryWithNode(queries.insertCameraState, cam.nodeID), [cam.cameraID, useful.getCurrentDate(), change === Changes.TO_ACTIVE]);
          if (change === Changes.TO_ACTIVE) {
            this.log(`Reconnecting camera ${cam.cameraIP}`);
            CameraMotionMap.reconnect(cam.cameraID, cam.nodeID);
          }else if(change === Changes.TO_INACTIVE){
            CameraMotionMap.deleteFfmpegProccess(cam.cameraID, cam.nodeID)
          }
        }
        cam.errorNotified = false;
      } catch (e) {
        if (!cam.errorNotified) {
          this.log(`Error trying to rach camera ID = ${cam.cameraID}. ${e}`);
          cam.errorNotified = true;
        }
      }
    }
    setTimeout(this.startCamerasCheck, Main.ALIVE_CAMERA_INTERVAL_MS);
  };

  /**
   * Start one timer that will test if each channel IS STILL CONNECTED. It doesn't
   * matter if the channel is logged in, only if it is connected. When the other
   * end's address can not be reached, the channel will be closed, the key
   * canceled and a new channel will be registered with the same attachment, thus
   * 'reseting' the connection. This doesn't do anything if the channel was not
   * connected in the first place, i.e. this method only acts on a 'falling edge'.
   *
   * @param selector Selector with the registered keys.
   */
  private startDisconnectionDetection = async (selector: Selector) => {
    const nodeCopy = selector.nodeAttachments.slice();
    for (const node of nodeCopy) {
        if (node.isDead(Main.ALIVE_TIMEOUT)) {
          if (node.loggedToController) {
            this.log(`Channel '${node}' ID = ${node.controllerID} is dead. Reconnecting...`);
            BaseAttach.simpleReconnect(this.selector, node);
            await node.insertNet(false);
            node.printKeyCount(selector);
          }
        }
    }
    let deleted = false;
    const mngrCopy = this.selector.managerConnections.slice();
    for (const manager of mngrCopy) {
      if (manager.isDead(Main.MANAGER_ALIVE_TIMEOUT)) {
        this.log("Manager keep alive timeout");
        manager.reconnect(selector);
        const mngrIndex = this.selector.managerConnections.indexOf(manager);
        if(mngrIndex>=0){
          this.selector.managerConnections.splice(mngrIndex, 1);
          deleted = true;
        }
      }
    }
    if (deleted) {
      this.log(`Managers left: ${this.selector.managerConnections.length}`);
    }
    setTimeout(this.startDisconnectionDetection, Main.ALIVE_INTERVAL_MS, selector);
  };

  /**
   * Clean up before ending eveything
   */
  private end(signal: NodeJS.Signals) {
    this.log(`Ending with signal ${signal}`);

    // End processing messages
    this.processMessages = false;

    // End timers
    if (this.disconnectionTimer) {
      clearInterval(this.disconnectionTimer);
    }
    if (this.checkCamerasTimer) {
      clearInterval(this.checkCamerasTimer);
    }
    
    if (this.ticketsTimer) {
      clearInterval(this.ticketsTimer);
    }
    if (this.sendMessagesTimer) {
      clearTimeout(this.sendMessagesTimer);
    }
    if (this.tablesInterval) {
      clearInterval(this.tablesInterval);
    }

    // Close managers
    for (const manager of this.selector.managerConnections) {
      manager._currentSocket?.end(() => {
        this.log(`Manager socket '${manager._tag}' ended`);
      });
    }

    // Close server for managers
    this.managerServer?.close((err) => {
      if (err) {
        this.log(`Server for manager was not started.`);
      } else {
        this.log("Server for manager closed.");
      }
    });

    // Close controllers' sockets
    for (const node of this.selector.nodeAttachments) {
      node._currentSocket?.end(() => {
        node._currentSocket?.destroy();
        this.log(`Socket ended for '${node.toString()}'`);
      });
    }

    this.log(`End of controller service.`);
  }

  /**
   * Log a message with the tag of this object.
   *
   * @param format    Format of the message.
   * @param arguments Arguments to format with.
   */
  private log(format: string) {
    if (this.logger) {
      this.logger.log(this.tag + format);
    } else {
      console.log(format);
    }
  }
}
