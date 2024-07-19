import { MySQL2 } from "../../database/mysql";
import { handleErrorWithArgument, handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";

import type { SensorTemperatura } from "../../types/db";
import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";
import { Init } from "../init";

interface SensorTemperaturaRowData extends RowDataPacket, SensorTemperatura {}

type RegistroTemperaturaInfo = { temperatura: number; hora_min: number };
interface RegistroTemperaturaRowData extends RowDataPacket, RegistroTemperaturaInfo {}

export class Temperatura {

  static getAllSensoresTemperatura = handleErrorWithoutArgument<(SensorTemperatura & {ctrl_id:number})[]>(async () => {
    const regionNodos = await Init.getRegionNodos()
    if( regionNodos.length > 0){
      const sensoresTempData = await regionNodos.reduce(async (resultPromise, item) => {
        const result = await resultPromise;
        const { nododb_name, ctrl_id } = item;

        const sensorsData = await MySQL2.executeQuery<SensorTemperaturaRowData[]>({ sql: `SELECT * from ${nododb_name}.sensortemperatura` });

        if (sensorsData.length > 0) {
          for (let sensor of sensorsData) {
            result.push({...sensor,ctrl_id})
          }
        }

        return result
      },Promise.resolve([] as (SensorTemperatura & {ctrl_id:number})[] ))
      return sensoresTempData
    }

    return [];
  }, "Temperatura.getAllSensoresTemperatura");
  
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

  static getRegistroTempByCtrlIdAndStIdAndDate = handleErrorWithArgument<RegistroTemperaturaInfo[], { ctrl_id: number; st_id: number; date: string }>(async ({ ctrl_id, st_id, date }) => {
    const registrosTempData = await MySQL2.executeQuery<RegistroTemperaturaRowData[]>({
      sql: `SELECT valor AS temperatura, CAST(CONCAT(DATE_FORMAT(fecha, '%H'), '.', DATE_FORMAT(fecha, '%i')) AS DECIMAL(10, 2) ) AS hora_min from ${"nodo" + ctrl_id}.registrotemperatura${dayjs(date).format("YYYY")} WHERE st_id = ? AND DATE(fecha) = ? `,
      // sql: `SELECT valor, fecha from ${"nodo" + ctrl_id}.registrotemperatura${dayjs(date).format("YYYY")} WHERE st_id = ? AND DATE(fecha) = ? `,
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

  static getRegistroTempByDay = handleErrorWithArgument<RegistroTemperaturaInfo[], { ctrl_id: number; st_id: number; date: string }>(async ({ ctrl_id, st_id, date }) => {
    const newDate = dayjs(date,"YYYY-MM-DD")
    console.log(`SELECT valor, fecha from ${"nodo" + ctrl_id}.registrotemperatura${newDate.year()} WHERE st_id = ? AND fecha BETWEEN '${newDate.startOf("day").format("YYYY-MM-DD HH:mm:ss")}' AND '${newDate.endOf("day").format("YYYY-MM-DD HH:mm:ss")}' ORDER BY rtmp_id ASC`)
    console.log(newDate.startOf("day").toISOString(),newDate.add(1,"day").startOf("day").toISOString())
    const registrosTempData = await MySQL2.executeQuery<RegistroTemperaturaRowData[]>({
      sql: `SELECT fecha AS x , valor AS y from ${"nodo" + ctrl_id}.registrotemperatura${newDate.year()} WHERE st_id = ? AND fecha BETWEEN '${newDate.startOf("day").format("YYYY-MM-DD HH:mm:ss")}' AND '${newDate.endOf("day").format("YYYY-MM-DD HH:mm:ss")}' ORDER BY rtmp_id ASC`,
      values: [st_id, date],
    });
    // console.log(dayjs(date).format('YYYY'))

    // Ejemplo
    // AND fecha > '2023-05-06' AND fecha<'2023-05-07'

    if (registrosTempData.length > 0) {
      return registrosTempData;
    }
    return [];
  }, "Temperatura.getRegistroTempByDay");
}
