import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import type { Controlador, EquipoSalida , PinesSalida } from "../../types/db";
import { handleErrorWithArgument } from "../../utils/simpleErrorHandler";

type EquipoSalidaInfo = Pick<EquipoSalida, "actuador" | "es_id">

interface EquipoSalidaInfoRowData extends RowDataPacket , EquipoSalidaInfo {}
interface PinesSalidaRowData extends RowDataPacket , PinesSalida {}

export class Control{
    static  getEquiposSalidaByCtrlId = handleErrorWithArgument<EquipoSalidaInfo[] | [], Pick<Controlador, "ctrl_id">>(async ({ctrl_id})=>{
        
        const equiposSalida = await MySQL2.executeQuery<EquipoSalidaInfoRowData[]>({sql:`SELECT DISTINCT e.actuador , e.es_id FROM ${"nodo" + ctrl_id}.pinessalida p INNER JOIN general.equiposalida e ON p.es_id = e.es_id AND e.activo = 1 AND p.activo = 1`})

        if(equiposSalida.length>0){
            return equiposSalida;
        }
        
        return []
    },"Control.getEquiposSalidaByCtrlId")

    static getControlesByCtrlIdAndEsId = handleErrorWithArgument<PinesSalida[] | [],Pick<Controlador, "ctrl_id"> & Pick<EquipoSalida,"es_id">>(async ({ctrl_id,es_id})=>{

        const pinesSalida = await MySQL2.executeQuery<PinesSalidaRowData[]>({sql:`SELECT * FROM  ${"nodo" + ctrl_id}.pinessalida p WHERE p.es_id = ? AND p.activo = 1`, values: [es_id]})

        if(pinesSalida.length>0){
            return pinesSalida
        }

        return []
    }, "Control.getControlesByCtrlIdAndEsId")
}