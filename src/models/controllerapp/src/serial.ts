import { SerialPort } from 'serialport';
import { ComData } from './types';
import { executeQuery } from './dbManager';
import * as queries from './queries';
import { GeneralString } from './db2';
import { Logger } from './logger';
import { EventEmitter } from 'stream';
import { isValidCellphone } from './useful';
import { Selector } from './baseAttach';

let currentPort: SerialPort | null = null;
// let lastMessageSent = true;
let currentLogger: Logger | null = null;
const TAG = '(GSM) ';
// const emptyBuffer = Buffer.alloc(0);
// let bufferData: Buffer = emptyBuffer;
// let lastDataReceived: number = -1;
// const DATA_TIMEOUT_MS = 3 * 1000;
const TIMEOUT_CHECK_PERIOD_MS = 100;
const ALWAYS_OPEN_INTERVAL_MS = 3 * 1000;
const TRY_CONFIGURE_PERIOD_MS = 10 * 1000;
let dataInterval: NodeJS.Timeout;
let alwaysOpenInterval: NodeJS.Timeout;
let configureTimeout: NodeJS.Timeout | undefined = undefined;
const br = 115200; // 9600
let gsmConfigured = false;
let currentConfigIndex = -1;
let currentSelector: Selector | null = null;

const generalBuffer = Buffer.alloc(1 * 1024);
let bufferIndex = 0;
const LF = Buffer.from([10]);
const CRLF = Buffer.from([13, 10]);
const smsStart = Buffer.from('+CMT: "+51');
let waitingSMSbody = false;
let senderNumber = 0;

// Known codes
const unplugedSIM = /\r\n\+CPIN: NOT READY\r\n/;
const possibleResponses = /OK|ERROR/;

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

interface Config {
  command: string;
  regex: string;
}

interface MyEventData {
  response: boolean;
  index: number;
}

// await sendUART('AT+COPS?\n');

/**
 * Configurations to perform to the module before using it. All must be successful for the logic to work as expected.
 * The `regex` field contains a string that must match in the response to consider that configuration successful.
 * These `regex` fields should contain special not printable characters like `\r` or `\n` so other type of messages cannot match.
 */
const configs: Config[] = [
  { command: 'AT\n', regex: 'OK' },
  { command: 'ATE0\n', regex: 'OK' },
  { command: 'AT+CMGF=1\n', regex: 'OK' },
  { command: 'AT+CNMI=2,2,0,0,0\n', regex: 'OK' },
];

let currentPath = '';

export function setGSMSelector(selector: Selector | null) {
  if (selector !== null) {
    currentSelector = selector;
  }
}

/**
 * Get the current list of COM ports available in the OS
 * @returns
 */
export async function getComs(): Promise<ComData[]> {
  const coms = await SerialPort.list();
  const data: ComData[] = coms.map((i) => {
    const temp: ComData = { path: i.path, name: '' };
    if ('friendlyName' in i) {
      temp.name = i.friendlyName as string;
    }
    return temp;
  });
  return data;
}

function shouldOpenGSM(): boolean {
  return currentPath.length > 0;
}

/**
 *
 * @returns True if a current port exists and it is open, false otherwise
 */
function isPortOpen(): boolean {
  return currentPort !== null && !currentPort.closed && !currentPort.destroyed && currentPort.isOpen;
}

/**
 * Close the current serial port and stops related intervals EXCEPT `alwaysOpenInterval`.
 */
function closeGSMSerial(logResult: boolean = false) {
  if (!currentPort) {
    if (logResult) {
      log('Port already closed');
    }
    return;
  }
  clearInterval(dataInterval);
  clearTimeout(configureTimeout);
  currentPort?.close(async () => {
    currentPort?.destroy();
    log('Serial port closed and destroyed');
    currentPort = null;
    // lastMessageSent = true;
  });
}

/**
 * Start values and tasks for GSM
 */
export async function initGSM(logger: Logger | null = currentLogger) {
  // Assign logger
  currentLogger = logger;
  // Update path
  await checkPath();
  alwaysOpenInterval = setInterval(keepPortOpenTask, ALWAYS_OPEN_INTERVAL_MS);
}

/**
 * Close and end everything related to the GSM service
 */
export function endGSM() {
  closeGSMSerial();
  clearInterval(alwaysOpenInterval);
  clearTimeout(configureTimeout);
}

/**
 * Read and store the current path for the GSM module
 */
export async function checkPath() {
  currentPath = '';

  // Read data from db
  const comData = await executeQuery<GeneralString[]>(queries.selectCOM, null);
  if (!comData || comData.length !== 1) {
    log(`ERROR Reading com port. Select returned length (${comData?.length})`);
    return;
  }
  const tempPath = comData[0].text;
  if (tempPath.length <= 0) {
    log('WARNING No com port configured');
    return;
  }
  currentPath = tempPath;
}

/**
 * Check if data has been inactive for a period of time and if so, consider it a complete message ans process it.
 */
function checkDataTimeout() {
  // if (lastDataReceived >= 0 && Date.now() > lastDataReceived + DATA_TIMEOUT_MS) {
  //   log(`Received data (${bufferData.length}): '${bufferData.toString()}'`);
  //   if (bufferData.length === 1) {
  //     log(`Hex: ${bufferData.toString('hex')}`);
  //   }
  //   lastDataReceived = -1;
  //   // Unsolicited codes
  //   if (unplugedSIM.test(bufferData.toString('utf8'))) {
  //     log('SIM unplugged!');
  //     configureGSM();
  //   }
  //   if (gsmConfigured) {
  //     // Process data IF CONFIGURED
  //     // TODO
  //   } else {
  //     // If not configured, data can still be messages from server, but only responses to configs are processed.
  //     const eventData: MyEventData = { response: bufferData, index: currentConfigIndex };
  //     myEmitter.emit('config_response', eventData);
  //   }
  //   // Empty buffer and save remaining
  //   bufferData = emptyBuffer;
  // }
}

/**
 * Try to open the serial port once, if a valid path is stored.
 */
function keepPortOpenTask() {
  if (!shouldOpenGSM()) {
    // log('No valid path for GSM');
    return;
  }

  if (isPortOpen()) {
    // log('The port is already open');
    return;
  }

  closeGSMSerial();

  // Restart serial
  // log('Attempt to open serial port');
  currentPort = new SerialPort({ path: currentPath, baudRate: br, dataBits: 8, parity: 'none', stopBits: 1 }, async (e) => {
    if (e) {
      // log(`ERROR Openning serial port\n${e}`);
      currentPort = null;
      return;
    }

    log(`Serial '${currentPort?.path}' open at ${currentPort?.baudRate} bps`);

    // Start data buffering
    dataInterval = setInterval(checkDataTimeout, TIMEOUT_CHECK_PERIOD_MS);

    // Register events
    currentPort?.on('data', (data: Buffer) => {
      if (data.length < 1) {
        return;
      }
      // log(`Chunk ${data.length}`);
      // log(`Received chunk: '${data}'`);
      // bufferData = Buffer.concat([bufferData, data]);
      // lastDataReceived = Date.now();

      // Save the data received
      data.copy(generalBuffer, bufferIndex, 0);
      bufferIndex += data.length;
      // log(`Buffered (+${data.length}): '${generalBuffer.toString('utf8')}'`);
      // console.log(generalBuffer);

      // Parse data as lines of data

      // If new data includes new line
      if (data.includes(LF)) {
        // log(`Includes LF`);

        let lineStart = 0;
        let crlfIndex = generalBuffer.indexOf(CRLF, 0);
        while (crlfIndex >= 0) {
          // If CRLF is found, then buffered data is one or more complete line.
          // Parse each line
          const rawLine = generalBuffer.subarray(lineStart, crlfIndex).toString('utf8');
          log(`CRLF found. Raw line: '${rawLine}'`);

          // If configured, SMS can be proccessed
          if (gsmConfigured) {
            // If it is a sms header
            if (generalBuffer.indexOf(smsStart) === 0) {
              waitingSMSbody = true;
              // Assuming the line starts with '+CMT: "+51xxxxxxxxx"'
              senderNumber = parseInt(generalBuffer.subarray(10, 19).toString('utf8'));
              senderNumber = Number.isNaN(senderNumber) ? 0 : senderNumber;
            } else if (waitingSMSbody) {
              // Then this line is the body
              // const line = generalBuffer.subarray(lineStart, crlfIndex).toString('utf8');
              waitingSMSbody = false;
              log(`Received SMS line from (${senderNumber}): '${rawLine}'`);
              // Process line as command. Add line to the received buffer
              // TODO
              const nodeAttach = currentSelector?.getNodeByNumber(senderNumber);
              nodeAttach?.addData(Buffer.from(rawLine));
            } else if (unplugedSIM.test(rawLine)) {
              log('SIM unplugged!');
              configureGSM();
            }
          } else {
            const isResponse = possibleResponses.test(rawLine);
            if (isResponse) {
              const eventData: MyEventData = {
                response: rawLine.includes(configs[currentConfigIndex].regex),
                index: currentConfigIndex,
              };
              myEmitter.emit('config_response', eventData);
            }
          }

          // Find next line
          lineStart = crlfIndex + CRLF.length;
          crlfIndex = generalBuffer.indexOf(CRLF, lineStart);
        }

        // If at least one complete line was found
        if (lineStart > 0) {
          // Displace the subarray that was processed
          generalBuffer.copy(generalBuffer, 0, lineStart, bufferIndex);
          generalBuffer.fill(0, bufferIndex - lineStart);
          bufferIndex = bufferIndex - lineStart;
          // bufferIndex = 0;
        } else {
          // No need to displace buffer, since none of it was processed
        }
        // Since it was a complete line, clear buffer
      }
    });
    currentPort?.on('error', (error) => {
      log(`ERROR Reading serial GSM: '${error}'`);
    });
    currentPort?.on('close', () => {
      log(`Serial port closed event`);
      currentPort?.removeAllListeners('close');
      closeGSMSerial();
      // currentPort = null;
    });
    currentPort?.on('drain', () => {
      log('Serial port empty event');
    });

    // No need to wait
    configureGSM();
  });
}

/**
 * Reconfigure the SIM module (SIM800L). If it is already configured, do it again, if it fails, it will be considered as not configured.
 * An interval is set to keep trying configure the module.
 * @returns
 */
function configureGSM() {
  if (configureTimeout) {
    log('Already configuring module');
    return;
  }
  gsmConfigured = false;
  configureTimeout = setTimeout(configCallback, TRY_CONFIGURE_PERIOD_MS);
}

const configCallback = async () => {
  let res = false;
  log('Attempt to configure');
  // Send every configuration in the list waiting for each to get a response before sending the next
  for (let i = 0; i < configs.length; i++) {
    currentConfigIndex = i;
    await sendUART(Buffer.from(configs[i].command, 'utf8'));
    res = await new Promise<boolean>(configExecutor);
    if (!res) {
      log(`GSM config index ${i} failed`);
      break;
    }
  }
  gsmConfigured = res;
  if (gsmConfigured) {
    log('GSM Configured!');
    clearInterval(configureTimeout);
    configureTimeout = undefined;
    // Test message. Comment for production
    // sendSMS('Listo', 974283546);
  } else {
    log('ERROR Configuring module');
    configureTimeout = setTimeout(configCallback, TRY_CONFIGURE_PERIOD_MS);
  }
};

const configExecutor = (resolve: (arg: boolean) => void) => {
  myEmitter.once<MyEventData>('config_response', (data: MyEventData) => {
    const res = data.response;
    log(`Config index ${data.index}: ${res ? 'OK' : 'FAILED'}`);
    resolve(res);
  });
};

export function isGSMAvailable(): boolean {
  return gsmConfigured && isPortOpen();
}

export async function sendSMS(message: string, phone: number): Promise<boolean> {
  if (!gsmConfigured) {
    log('ERROR GSM not configured yet');
    return false;
  }
  if (!isValidCellphone(phone)) {
    log(`ERROR Number out of range to send message ${phone}`);
    return false;
  }
  const res = await sendUART(Buffer.from(getFormattedDestiny(phone), 'utf8'));
  if (res) {
    const smsRes = (await sendUART(Buffer.from(message, 'utf8'), false)) && (await sendUART(Buffer.from([0x1a, 0]), true));
    if (smsRes) {
      log(`Sent to (${phone}): '${message}'`);
    } else {
      log(`ERROR Sending SMS`);
    }
    return smsRes;
  }
  return false;
}

async function sendUART(message: Buffer, logOK: boolean = true): Promise<boolean> {
  const messagePromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
    currentPort?.write(message, (e) => {
      if (e) {
        log(`ERROR Sending message:\n${e}`);
        reject(false);
      } else {
        if (logOK) {
          // log(`Sent: '${message}'`);
        }
        resolve(true);
      }
    });
  });
  return messagePromise;
}

function getFormattedDestiny(phone: number): string {
  return `AT+CMGS="+51${phone}"\n`;
}

/**
 * Log a message with a tag.
 *
 * @param format    Format of the message.
 */
function log(format: string) {
  if (currentLogger) {
    currentLogger.log(TAG + format);
  } else {
    console.log(format);
  }
}
