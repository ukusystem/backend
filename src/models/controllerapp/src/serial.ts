import { SerialPort } from 'serialport';

export async function getComs() {
  const coms = await SerialPort.list();
  //   console.log(coms[0]);
  return coms;
}
