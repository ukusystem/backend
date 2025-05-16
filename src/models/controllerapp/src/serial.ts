import { SerialPort } from 'serialport';
import { ComData } from './types';
import { executeQuery } from './dbManager';
import * as queries from './queries';
import { GeneralString } from './db2';

let currentPort: SerialPort | null;
let lastMessageSent = true;

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
  closeGSMSerial();
  await startGSMSerial();
}

export function closeGSMSerial() {
  currentPort?.close(() => {
    console.log('Serial port closed');
    currentPort?.destroy();
  });
}

export async function startGSMSerial() {
  const comData = await executeQuery<GeneralString[]>(queries.selectCOM, null);
  if (!comData || comData.length !== 1) {
    console.log(`ERROR Reading com port ${comData?.length}`);
    return;
  }
  const path = comData[0].text;
  if (path.length <= 0) {
    console.log('WARNING No com port configured');
    return;
  }

  const br = 9600;
  currentPort = new SerialPort({ path: path, baudRate: br }, () => {
    console.log(`Serial '${path}' open at ${br} bps`);
  });
  currentPort.on('data', (data) => {
    console.log(`Received serial: '${data}'`);
  });
  currentPort.on('error', (error) => {
    console.log(`ERROR Reading serial GSM: '${error}'`);
  });
  currentPort.on('close', () => {
    console.log(`Serial port closed`);
  });
  currentPort.on('drain', () => {
    console.log('Serial port empty');
  });
}

export function isGSMAvailable(): boolean {
  return false;
}

export function sendGSM(message: string) {
  if (!lastMessageSent) {
    return;
  }
  lastMessageSent = false;
  currentPort?.port?.write(Buffer.from(message)).then(() => {
    lastMessageSent = true;
  });
  return;
}
