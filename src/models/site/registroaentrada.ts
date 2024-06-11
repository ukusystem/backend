import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import type { EquipoEntrada, RegistroEntrada} from "../../types/db";
import { handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import { Init } from "../init";

interface EquipoEntradaRowData extends RowDataPacket, EquipoEntrada {}
interface RegistroEntradaRowData extends RowDataPacket , RegistroEntrada {}
export class RegistroEntradaSite {

    static getAllRegistrosEntrada = handleErrorWithoutArgument<(RegistroEntrada & {ctrl_id:number})[]>(async ()=>{
        const regionNodos = await Init.getRegionNodos()
        if( regionNodos.length > 0){
            const pinSalidaData = await regionNodos.reduce(async (resultPromise, item) => {
              const result = await resultPromise;
              const { nododb_name, ctrl_id } = item;
      
              const regAcc = await MySQL2.executeQuery<RegistroEntradaRowData[]>({ sql: `SELECT * from ${nododb_name}.registroentrada ORDER BY rentd_id DESC LIMIT 5` });
      
              if (regAcc.length > 0) {
                for (let pin of regAcc) {
                  result.push({...pin,ctrl_id})
                }
              }
      
              return result
            },Promise.resolve([] as (RegistroEntrada & {ctrl_id:number})[] ))
            return pinSalidaData
        }
        return [];   
    },"RegistroEntradaSite.getAllRegistrosEntrada")

    static getEquiposEntrada = handleErrorWithoutArgument<EquipoEntrada[]>(async ()=>{
        const equiposSalida = await MySQL2.executeQuery<EquipoEntradaRowData[]>({sql:`SELECT * FROM general.equipoentrada WHERE activo = 1`})
        if(equiposSalida.length > 0){{
            return equiposSalida
        }}
        return []
    },"RegistroEntradaSite.getEquiposEntrada")
}