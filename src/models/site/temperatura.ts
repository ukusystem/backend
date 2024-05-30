import { MySQL2 } from "../../database/mysql";
import { handleErrorWithArgument } from "../../utils/simpleErrorHandler";

import type { SensorTemperatura } from "../../types/db";
import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";

interface SensorTemperaturaRowData extends RowDataPacket, SensorTemperatura {}

type RegistroTemperaturaInfo = { temperatura: number; hora_min: number };
interface RegistroTemperaturaRowData extends RowDataPacket, RegistroTemperaturaInfo {}

export class Temperatura {
  static getSensoresTemperaturaByCtrlID = handleErrorWithArgument<SensorTemperatura[], { ctrl_id: number }>(async ({ ctrl_id }) => {
    const sensoresTempData = await MySQL2.executeQuery<SensorTemperaturaRowData[]>({ sql: `SELECT * from ${"nodo" + ctrl_id}.sensortemperatura WHERE activo = 1` });

    if (sensoresTempData.length > 0) {
      return sensoresTempData;
    }

    return [];
  }, "Temperatura.getSensoresTemperaturaByCtrlID");

  static getSensorDataByCtrlIdAndStId = handleErrorWithArgument<SensorTemperatura | null, { ctrl_id: number; st_id: number }>(async ({ ctrl_id, st_id }) => {
    const sensoresTempData = await MySQL2.executeQuery<SensorTemperaturaRowData[]>({ sql: `SELECT * from ${"nodo" + ctrl_id}.sensortemperatura WHERE  st_id = ? AND  activo = 1`, values: [st_id] });

    if (sensoresTempData.length > 0) {
      return sensoresTempData[0];
    }
    return null;
  }, "Temperatura.getSensorDataByCtrlIdAndStId");

  static getRegistroTempByCtrlIdAndStIdAndDate = handleErrorWithArgument<RegistroTemperaturaInfo[] | [], { ctrl_id: number; st_id: number; date: string }>(async ({ ctrl_id, st_id, date }) => {
    const registrosTempData = await MySQL2.executeQuery<RegistroTemperaturaRowData[]>({
      sql: `SELECT valor AS temperatura, CAST(CONCAT(DATE_FORMAT(fecha, '%H'), '.', DATE_FORMAT(fecha, '%i')) AS DECIMAL(10, 2) ) AS hora_min from ${"nodo" + ctrl_id}.registrotemperatura${dayjs(
        date
      ).format("YYYY")} WHERE st_id = ? AND DATE(fecha) = ? `,
      values: [st_id, date],
    });
    // console.log(dayjs(date).format('YYYY'))

    // Ejemplo
    // AND fecha > '2023-05-06' AND fecha<'2023-05-07'

    if (registrosTempData.length > 0) {
      return registrosTempData;
    }
    return [];
  }, "Temperatura.getRegistroTempByCtrlIdAndStIdAndDate");
}
