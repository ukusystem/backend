import { RowDataPacket } from "mysql2";
import { EquipoAcceso } from "../../types/db";
import { MySQL2 } from "../../database/mysql";

interface EquipoAccesoRowData extends RowDataPacket , EquipoAcceso {}
export class EquipoAccesoMap {
  // map:
  public static async init() {
    try {
        const equiposAcceso = await MySQL2.executeQuery<EquipoAccesoRowData[]>({sql:`SELECT * FROM general.equipoacceso`})
    } catch (error) {

    }
  }
}
