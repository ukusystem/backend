import { MySQL2 } from "../../database/mysql";
import { Resolucion } from "../../types/db";
import { ResolucionRowData } from "./system.state.types";

export class Resolution {
  static #resolutions: Resolucion[] = [];

  static getResolution(res_id: Resolucion["res_id"]) {
    const resolutionFound = this.#resolutions.find((resolucion) => resolucion.res_id === res_id);
    return resolutionFound;
  }

  static async init() {
    try {
      const resolutions = await MySQL2.executeQuery<ResolucionRowData[]>({ sql: `SELECT * FROM general.resolucion`, });
      if (resolutions.length > 0) {
        this.#resolutions = resolutions;
      }
    } catch (error) {
      throw new Error("Error al inicializar resolociones");
    }
  }

}
