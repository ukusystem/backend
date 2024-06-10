import { RowDataPacket } from "mysql2";
import  type { EquipoEntrada, PinesEntrada } from "../../types/db";
import { handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import { Init } from "../init";
import { MySQL2 } from "../../database/mysql";

interface PinesEntradaRowData extends RowDataPacket , PinesEntrada {}
interface EquipoEntradaRowData extends RowDataPacket , EquipoEntrada {}

export class PinEntrada {
    
    static getAllPinesEntrada = handleErrorWithoutArgument<(PinesEntrada & {ctrl_id:number})[]>(async ()=>{
        const regionNodos = await Init.getRegionNodos()
        if( regionNodos.length > 0){
            const pinSalidaData = await regionNodos.reduce(async (resultPromise, item) => {
              const result = await resultPromise;
              const { nododb_name, ctrl_id } = item;
      
              const pinData = await MySQL2.executeQuery<PinesEntradaRowData[]>({ sql: `SELECT * from ${nododb_name}.pinesentrada` });
      
              if (pinData.length > 0) {
                for (let pin of pinData) {
                  result.push({...pin,ctrl_id})
                }
              }
      
              return result
            },Promise.resolve([] as (PinesEntrada & {ctrl_id:number})[] ))
            return pinSalidaData
        }
        return [];   
    },"PinSalida.getAllPinesEntrada")

    static getEquiposEntrada = handleErrorWithoutArgument<EquipoEntrada[]>(async ()=>{
        const equiposEntrada = await MySQL2.executeQuery<EquipoEntradaRowData[]>({sql:`SELECT * FROM general.equipoentrada WHERE activo = 1`})
        if(equiposEntrada.length > 0){{
            return equiposEntrada
        }}
        return []
    },"PinSalida.getEquiposEntrada")
}