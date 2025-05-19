import { SerialPort } from 'serialport';
import { ComData } from './types';
import { executeQuery } from './dbManager';
import * as queries from './queries';
import { GeneralString } from './db2';
import { Logger } from './logger';

let currentPort: SerialPort | null;
// let lastMessageSent = true;
let currentLogger: Logger | null = null;
const TAG = '(GSM) ';

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

export async function restartGSMSerial() {
  closeGSMSerial(startGSMSerial);
  // await startGSMSerial();
}

/**
 * Close the current serial port and invokes a callback. If there was no serial port, the callback is called anyways.
 * @param callback
 */
async function closeGSMSerial(callback: (() => Promise<void>) | null = null) {
  if (currentPort) {
    currentPort.close(async () => {
      currentPort?.destroy();
      log('Serial port destroyed');
      currentPort = null;
      // lastMessageSent = true;
      await callback?.();
    });
  } else {
    await callback?.();
  }
}

export async function startGSMSerial(logger: Logger | null = currentLogger) {
  // Assign logger
  currentLogger = logger;

  // Read data from db
  const comData = await executeQuery<GeneralString[]>(queries.selectCOM, null);
  if (!comData || comData.length !== 1) {
    log(`ERROR Reading com port. Select returned length (${comData?.length})`);
    return;
  }
  const path = comData[0].text;
  if (path.length <= 0) {
    log('WARNING No com port configured');
    return;
  }

  // Restart serial
  // uart_config_t uartConfig = {
  //       .baud_rate = DEFAULT_BAUDRATE,
  //       .data_bits = UART_DATA_8_BITS,
  //       .parity = UART_PARITY_DISABLE,
  //       .stop_bits = UART_STOP_BITS_1,
  //       .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
  //       .rx_flow_ctrl_thresh = 122,
  //       .source_clk = UART_SCLK_APB};
  const br = 9600;
  currentPort = new SerialPort({ path: path, baudRate: br, dataBits: 8, parity: 'none', stopBits: 1 }, async (e) => {
    if (e) {
      log(`ERROR Openning serial\n${e}`);
    } else {
      log(`Serial '${currentPort?.path}' open at ${currentPort?.baudRate} bps`);
    }
    await sendUART('AT\n'); // Ask if the module is active
    await sendUART('ATE1\n');
    await sendUART('AT+CMGF=1\n');
    await sendUART('AT+CNMI=1,2,0,0,0\n'); // Important to configure the format of the new message notification
    await sendUART('AT+CBC\n');
    await sendUART('AT+COPS?\n');
  });
  currentPort.on('data', (data) => {
    log(`Received serial: '${data}'`);
    // Process data
  });
  currentPort.on('error', (error) => {
    log(`ERROR Reading serial GSM: '${error}'`);
  });
  currentPort.on('close', () => {
    log(`Serial port closed event`);
  });
  currentPort.on('drain', () => {
    log('Serial port empty event');
  });
}

export function isGSMAvailable(): boolean {
  return false;
}

export async function sendUART(message: string): Promise<boolean> {
  // if (!lastMessageSent) {
  //   log('Not ready for message');
  //   return;
  // }
  // lastMessageSent = false;
  // lastMessageSent = true;
  const messagePromise: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
    currentPort?.write(message, (e) => {
      if (e) {
        log(`ERROR Sending message:\n${e}`);
        reject(false);
      } else {
        log(`Sent: '${message}'\n`);
        resolve(true);
      }
    });
  });
  return messagePromise;
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
