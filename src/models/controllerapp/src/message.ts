import * as codes from './codes';
import { Encryption } from './encryption';
import { IntConsumer } from './types';

/**
 * Class representing the message that will be send through the socket.
 */
export class Message {
  static nextID = 1;

  /**
   * Message (can be encrypted) without the separator character.
   * The separator will be appended on every call to `getMessage()`
   */
  private message = '';
  messageID = 0;
  responseExpected = false;
  forceAddToPending = false;
  logOnSend = true;
  logOnResponse = true;
  isEncrypted = false;
  action: IntConsumer = null;

  /**
   * Construct a string message joining the header, id and body separating each
   * component with proper characters and adding a end of message character at the
   * end. The minimum message is composed of a command (CMD_X || VALUE_X) and a
   * positive or zero id (>=0). Shorter messages will not be understood by the
   * receiving side.
   *
   * @constructor
   * @param header    The header of the message
   * @param id        The id of the message. A negative value means that the id is assigned automatically using an internal count and that a response is expected. A zero or positive value means that no response is expected and positive values are used when the message is the final response to another message.
   * @param body      The body of the message. Can be empty to create a message without a body.
   * @param action    Action to perform after the response to this message has been received, if a response was expected.
   * @param forceAdd
   */
  constructor(header: number, id: number = 0, body: string[] = [], action: IntConsumer = null, forceAdd: boolean = false) {
    this.action = action;
    this.forceAddToPending = forceAdd;
    this.responseExpected = id < 0;
    this.messageID = this.responseExpected ? Message.nextID : id;
    this.message = Message.joinMessage(header, this.messageID, body);
    Message.nextID += this.responseExpected ? 1 : 0;
  }

  /**
   *
   * @returns The inner message with {@linkcode codes.SEP_EOL} appended
   */
  getMessage() {
    return this.message + codes.SEP_EOL;
  }

  /**
   * Encrypt the inner message if this instance has not been encrypted yet.
   * Calling {@linkcode Message.reset} makes the instance not encrypted.
   * @returns The same instance
   */
  encrypt(): Message {
    if (this.isEncrypted) {
      return this;
    }

    const encryptedMsg = Encryption.encrypt(this.message, false);
    if (encryptedMsg) {
      if (encryptedMsg.length + codes.SEP_MTY.length > codes.MAX_CRYPTED_LENGTH) {
        console.log(`ERROR Encrypted message too long ${encryptedMsg?.length}`);
        this.message = codes.SEP_MTY;
      } else {
        this.message = encryptedMsg;
      }
    } else {
      console.log(`ERROR Encrypting message`);
      // return codes.SEP_MTY + codes.SEP_EOL;
      this.message = codes.SEP_MTY;
    }

    this.isEncrypted = true;

    return this;
  }

  attachAction(action: IntConsumer | null = null): Message {
    this.action = action;
    return this;
  }

  setLogOnSend(log: boolean): Message {
    this.logOnSend = log;
    return this;
  }

  setLogOnResponse(log: boolean): Message {
    this.logOnResponse = log;
    return this;
  }

  /**
   * Edit the object with a different message and an id = 0.
   * Assume the new message is not encrypted ({@linkcode Message.encrypt} can be called)
   * @param newMessage The new inner text. The ending character <code>SEP_EOL</code> will be appended at the end.
   * @returns The same object with the parameters changed.
   */
  reset(newMessage: string): Message {
    this.message = newMessage;
    this.isEncrypted = false;
    this.messageID = 0;
    this.responseExpected = false;
    return this;
  }

  /**
   * Join the header, id and body parts into a String separating each component
   * with a SEP_CMD
   *
   * @param header The header of the message
   * @param id     The id of the message. This exact value will be added to the
   *               message.
   * @param body   The body of the message. Can be empty to create a message
   *               without a body.
   * @returns The String with all the values joined
   */
  private static joinMessage(header: number, id: number, body: string[]): string {
    let tempMessage = `${header}${codes.SEP_CMD}${id}`;
    for (let i = 0; i < body.length; i++) {
      tempMessage = `${tempMessage}${codes.SEP_CMD}${body[i]}`;
    }
    // return encryptedMsg + codes.SEP_EOL;
    return tempMessage;
  }

  /**
   * Get the string representation
   * @returns The string representation
   * @override
   */
  toString(): string {
    return `<${this.messageID}:${this.message}>`;
  }
}
