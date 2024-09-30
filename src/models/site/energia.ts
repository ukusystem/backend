import { MySQL2 } from "../../database/mysql";
import { handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";

import type { MedidorEnergia } from "../../types/db";
import { RowDataPacket } from "mysql2";
import { Init } from "../init";
interface MedidorEnergiaRowData extends RowDataPacket, MedidorEnergia {}

export class Energia {

  static getAllModuloEnergia = handleErrorWithoutArgument<(MedidorEnergia & {ctrl_id:number})[]>(async () => {
    const regionNodos = await Init.getRegionNodos()
    if( regionNodos.length > 0){
      const medEnergiaData = await regionNodos.reduce(async (resultPromise, item) => {
        const result = await resultPromise;
        const { nododb_name, ctrl_id } = item;

        const medidorData = await MySQL2.executeQuery<MedidorEnergiaRowData[]>({ sql: `SELECT * from ${nododb_name}.medidorenergia` });

        if (medidorData.length > 0) {
          for (let sensor of medidorData) {
            result.push({...sensor,ctrl_id})
          }
        }

        return result
      },Promise.resolve([] as (MedidorEnergia & {ctrl_id:number})[] ))
      return medEnergiaData
    }

    return [];
  }, "Energia.getAllModuloEnergia");

}
