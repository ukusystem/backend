import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import type { Controlador, EquipoSalida , PinesSalida } from "../../types/db";
import { handleErrorWithArgument, handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import { Init } from "../init";

type EquipoSalidaInfo = Pick<EquipoSalida, "actuador" | "es_id">

interface EquipoSalidaInfoRowData extends RowDataPacket , EquipoSalidaInfo {}
interface EquipoSalidaRowData extends RowDataPacket , EquipoSalida {}
interface PinesSalidaRowData extends RowDataPacket , PinesSalida {}

export class PinSalida{
    static  getEquiposSalidaByCtrlId = handleErrorWithArgument<EquipoSalidaInfo[] | [], Pick<Controlador, "ctrl_id">>(async ({ctrl_id})=>{

        const equiposSalida = await MySQL2.executeQuery<EquipoSalidaInfoRowData[]>({sql:`SELECT DISTINCT e.actuador , e.es_id FROM ${"nodo" + ctrl_id}.pinessalida p INNER JOIN general.equiposalida e ON p.es_id = e.es_id AND e.activo = 1 AND p.activo = 1`})

        if(equiposSalida.length>0){
            return equiposSalida;
        }
        
        return []
    },"PinSalida.getEquiposSalidaByCtrlId")

    static getAllPinesSalida = handleErrorWithoutArgument<(PinesSalida & {ctrl_id:number})[]>(async ()=>{
        const regionNodos = await Init.getRegionNodos()
        if( regionNodos.length > 0){
            const pinSalidaData = await regionNodos.reduce(async (resultPromise, item) => {
              const result = await resultPromise;
              const { nododb_name, ctrl_id } = item;
      
              const pinData = await MySQL2.executeQuery<PinesSalidaRowData[]>({ sql: `SELECT * from ${nododb_name}.pinessalida` });
      
              if (pinData.length > 0) {
                for (let pin of pinData) {
                  result.push({...pin,ctrl_id})
                }
              }
      
              return result
            },Promise.resolve([] as (PinesSalida & {ctrl_id:number})[] ))
            return pinSalidaData
        }
        return [];   
    },"PinSalida.getAllPinesSalida")

    static getEquiposSalida = handleErrorWithoutArgument<EquipoSalida[]>(async ()=>{
        const equiposSalida = await MySQL2.executeQuery<EquipoSalidaRowData[]>({sql:`SELECT * FROM general.equiposalida WHERE activo = 1`})
        if(equiposSalida.length > 0){{
            return equiposSalida
        }}
        return []
    },"PinSalida.getEquiposSalida")

    static getControlesByCtrlIdAndEsId = handleErrorWithArgument<PinesSalida[] | [],Pick<Controlador, "ctrl_id"> & Pick<EquipoSalida,"es_id">>(async ({ctrl_id,es_id})=>{

        const pinesSalida = await MySQL2.executeQuery<PinesSalidaRowData[]>({sql:`SELECT * FROM  ${"nodo" + ctrl_id}.pinessalida p WHERE p.es_id = ? AND p.activo = 1`, values: [es_id]})

        if(pinesSalida.length>0){
            return pinesSalida
        }

        return []
    }, "PinSalida.getControlesByCtrlIdAndEsId")
}