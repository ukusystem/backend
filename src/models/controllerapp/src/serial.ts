import { SerialPort } from 'serialport';
import { ComData } from './types';
import { executeQuery } from './dbManager';
import * as queries from './queries';
import { GeneralString } from './db2';
import { Logger } from './logger';
import { EventEmitter } from 'stream';

let currentPort: SerialPort | null = null;
// let lastMessageSent = true;
let currentLogger: Logger | null = null;
const TAG = '(GSM) ';
const emptyBuffer = Buffer.alloc(0);
let bufferData: Buffer = emptyBuffer;
let lastDataReceived: number = -1;
const DATA_TIMEOUT_MS = 1 * 1000;
const TIMEOUT_CHECK_PERIOD_MS = 100;
const ALWAYS_OPEN_INTERVAL_MS = 3 * 1000;
let dataInterval: NodeJS.Timeout;
let alwaysOpenInterval: NodeJS.Timeout;
const br = 9600;
let gsmConfigured = false;
let currentConfigIndex = -1;

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

interface Config {
  command: string;
  regex: RegExp;
}

interface MyEventData {
  response: Buffer;
  index: number;
}

// await sendUART('AT\n'); // Ask if the module is active
// await sendUART('ATE1\n');
// await sendUART('AT+CMGF=1\n');
// await sendUART('AT+CNMI=1,2,0,0,0\n'); // Important to configure the format of the new message notification
// await sendUART('AT+COPS?\n');

const configs: Config[] = [
  { command: 'AT\n', regex: /\r\nOK\r\n/ },
  { command: 'ATE1\n', regex: /\r\nOK\r\n/ },
  { command: 'AT+CMGF=1\n', regex: /\r\nOK\r\n/ },
  { command: 'AT+CNMI=1,2,0,0,0\n', regex: /\r\nOK\r\n/ },
];

let currentPath = '';

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
  if (lastDataReceived >= 0 && Date.now() > lastDataReceived + DATA_TIMEOUT_MS) {
    log(`Received data: '${bufferData.toString()}'`);
    lastDataReceived = -1;
    // Process data IF CONFIGURED
    // TODO
    if (!gsmConfigured) {
      const eventData: MyEventData = { response: bufferData, index: currentConfigIndex };
      myEmitter.emit('config_response', eventData);
    }
    // Empty buffer and save remaining
    bufferData = emptyBuffer;
  }
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
    currentPort?.on('data', (data) => {
      if (data.length < 1) {
        return;
      }
      // log(`Received chunk: '${data}'`);
      bufferData = Buffer.concat([bufferData, data]);
      lastDataReceived = Date.now();
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

async function configureGSM() {
  gsmConfigured = false;

  // Send config 1
  currentConfigIndex = 0;
  await sendUART(configs[0].command);
  const res1 = await new Promise<boolean>(executor);
  if (!res1) {
    log('GSM config failed');
    return;
  }

  // Send config 2
  currentConfigIndex = 1;
  await sendUART(configs[1].command);
  const res2 = await new Promise<boolean>(executor);
  if (!res2) {
    log('GSM config failed');
    return;
  }

  // Send config 3
  currentConfigIndex = 2;
  await sendUART(configs[2].command);
  const res3 = await new Promise<boolean>(executor);
  if (!res3) {
    log('GSM config failed');
    return;
  }

  // Send config 4
  currentConfigIndex = 3;
  await sendUART(configs[3].command);
  const res4 = await new Promise<boolean>(executor);
  if (!res4) {
    log('GSM config failed');
    return;
  }

  gsmConfigured = true;
  log('GSM Configured!');
}

const executor = (resolve: (arg: boolean) => void) => {
  myEmitter.once<MyEventData>('config_response', (data: MyEventData) => {
    const res = configs[data.index].regex.test(data.response.toString('utf8'));
    log(`Config index ${data.index}: ${res ? 'OK' : 'FAILED'}`);
    resolve(res);
  });
};

export function isGSMAvailable(): boolean {
  return false;
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

export async function sendUART(message: string): Promise<boolean> {
  const messagePromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
    currentPort?.write(message, (e) => {
      if (e) {
        log(`ERROR Sending message:\n${e}`);
        reject(false);
      } else {
        log(`Sent: '${message}'`);
        resolve(true);
      }
    });
  });
  return messagePromise;
}
