import { RowDataPacket } from "mysql2";
import { Resolucion } from "../../types/db";
import { MySQL2 } from "../../database/mysql";

interface ResolucionRowData extends RowDataPacket, Resolucion {}

export class Resolution {
  static #resolutions: Map<number, Resolucion> = new Map();

  static #filterUndefined(data: Partial<Resolucion>): Partial<Resolucion> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Resolucion;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(res_id: number, newRegion: Resolucion) {
    const existResolution = Resolution.#resolutions.has(res_id);
    if (!existResolution) {
      Resolution.#resolutions.set(res_id, newRegion);
    }
  }

  static update(res_id: number, fieldsUpdate: Partial<Resolucion>) {
    const currResolution = Resolution.#resolutions.get(res_id);
    if (currResolution !== undefined) {
      const fieldsFiltered = Resolution.#filterUndefined(fieldsUpdate);
      Object.assign(currResolution, fieldsFiltered);
    }
  }

  static getResolution(res_id: number): Resolucion | undefined {
    return Resolution.#resolutions.get(res_id);
  }

  static async init() {
    try {
      const resolutions = await MySQL2.executeQuery<ResolucionRowData[]>({
        sql: `SELECT * FROM general.resolucion`,
      });

      resolutions.forEach((resolution) => {
        Resolution.add(resolution.res_id, resolution);
      });
    } catch (error) {
      console.log(`Resolution | Error al inicializar regiones`);
      console.error(error);
      throw error;
    }
  }
}