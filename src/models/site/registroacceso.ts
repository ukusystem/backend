import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import type { Contrata, RegistroAcceso} from "../../types/db";
import { handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import { Init } from "../init";

interface ContrataRowData extends RowDataPacket, Contrata {}
interface RegistroAccesoRowData extends RowDataPacket , RegistroAcceso {}
export class RegistroAccesoSite {

    static getAllRegistrosAcceso = handleErrorWithoutArgument<(RegistroAcceso & {ctrl_id:number})[]>(async ()=>{
        const regionNodos = await Init.getRegionNodos()
        if( regionNodos.length > 0){
            const pinSalidaData = await regionNodos.reduce(async (resultPromise, item) => {
              const result = await resultPromise;
              const { nododb_name, ctrl_id } = item;
      
              const regAcc = await MySQL2.executeQuery<RegistroAccesoRowData[]>({ sql: `SELECT * from ${nododb_name}.registroacceso ORDER BY ra_id DESC LIMIT 5` });
      
              if (regAcc.length > 0) {
                for (let pin of regAcc) {
                  result.push({...pin,ctrl_id})
                }
              }
      
              return result
            },Promise.resolve([] as (RegistroAcceso & {ctrl_id:number})[] ))
            return pinSalidaData
        }
        return [];   
    },"RegistroAccesoSite.getAllRegistrosAcceso")

    // static getContratas = handleErrorWithoutArgument<Contrata[]>(async ()=>{
    //     const equiposSalida = await MySQL2.executeQuery<ContrataRowData[]>({sql:`SELECT * FROM general.contrata WHERE activo = 1`})
    //     if(equiposSalida.length > 0){
    //         return equiposSalida
    //     }
    //     return []
    // },"RegistroAccesoSite.getContratas")
}