import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import { Controlador } from "../../types/db";
import { handleErrorWithArgument, handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import dayjs from "dayjs";

interface IPropMethod {
    ctrl_id : Controlador["ctrl_id"],
    isMonthly: boolean,
    date: string,
}

interface ITotal {
    total: number
} 

interface TotalRowDataPacket extends RowDataPacket, ITotal {}

export class Dashboard {

    private static getStartEndDate(date: string, is_monthly: boolean){
        const petitionDate = dayjs(date,"YYYY-MM");
        const startDateTime = petitionDate.startOf(is_monthly ? "month" : "year").format("YYYY-MM-DD HH:mm:ss")
        const endDateTime = petitionDate.endOf(is_monthly ? "month" : "year").format("YYYY-MM-DD HH:mm:ss");
        return {startDate: startDateTime,endDate: endDateTime, year: petitionDate.year(), month: petitionDate.month()}
    }

    static getTotalActivePinEntrada = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
      const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
      const finalTable = DashboardConfig.entrada.has_yearly_tables ?`registroentrada${year}` :"registroentrada"
      const totalPinEntrada = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT ee.detector, COUNT(*) as total FROM ${"nodo"+ctrl_id}.${finalTable} re INNER JOIN general.equipoentrada ee ON re.ee_id = ee.ee_id WHERE re.fecha BETWEEN '${startDate}' AND '${endDate}' AND re.estado = 1 GROUP BY ee.detector ORDER BY ee.detector ASC`})
      if(totalPinEntrada.length > 0) return totalPinEntrada;
      return []
    },"Dashboard.getTotalActivePinEntrada");

    static getTotalActivePinSalida = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
      const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
      const finalTable = DashboardConfig.salida.has_yearly_tables ?`registrosalida${year}` :"registrosalida"
      const totalPinSalida = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT es.actuador , COUNT(*) as total FROM ${"nodo"+ctrl_id}.${finalTable} rs INNER JOIN general.equiposalida es ON rs.es_id = es.es_id WHERE rs.fecha BETWEEN '${startDate}' AND '${endDate}' AND rs.estado = 1 GROUP BY es.actuador ORDER BY es.actuador ASC`})
      if(totalPinSalida.length > 0) return totalPinSalida;
      return [];
    },"Dashboard.getTotalActivePinSalida");

    static getTotalAlarmas = handleErrorWithArgument<ITotal,IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.acceso.has_yearly_tables ?`registrosalida${year}` :"registrosalida"
        const totalAlarmas = await MySQL2.executeQuery<TotalRowDataPacket[]>({sql:`SELECT COUNT(*) AS total FROM ${"nodo"+ctrl_id}.${finalTable} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' AND estado = 1 AND alarma = 1`})
        if(totalAlarmas.length > 0) return totalAlarmas[0];
        return {total:0};
    },"Dashboard.getTotalAlarmas");

    static getTotalTarjeta = handleErrorWithoutArgument<ITotal>(async ()=>{
        const totalTarjetas = await MySQL2.executeQuery<TotalRowDataPacket[]>({sql:`SELECT COUNT(*) AS total FROM general.acceso WHERE activo = 1`})
        if(totalTarjetas.length > 0) return totalTarjetas[0];

        return {total:0};
    },"Dashboard.getTotalTarjeta")

    static getCameraStates = handleErrorWithArgument<Record<any,any>[],Pick<Controlador,"ctrl_id">>(async ({ctrl_id}) => {
        const camStates = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT c.cmr_id, c.tc_id , t.tipo, c.m_id, m.marca, c.ip , c.descripcion, c.conectado FROM ${"nodo" + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`})
        if(camStates.length > 0) return camStates;

        return [];
    },"Dashboard.getCameraStates")

    static getTicketContrata = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.ticket.has_yearly_tables ?`registroticket${year}` :"registroticket"
        const totalTicketContrata = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT co.contrata, COUNT(*) AS total FROM ${"nodo"+ctrl_id}.${finalTable} rt INNER JOIN general.contrata co ON rt.co_id = co.co_id WHERE rt.fechacomienzo BETWEEN '${startDate}' AND '${endDate}' AND ( rt.estd_id = 2 OR rt.estd_id = 16 ) GROUP BY co.contrata ORDER BY co.contrata ASC`})
        if(totalTicketContrata.length > 0) return totalTicketContrata;
        return [];
      },"Dashboard.getTicketContrata");


}

type RegisterType =  "acceso" | "energia" | "entrada" | "estadocamara" | "microsd" | "peticion" | "salida" | "seguridad" | "temperatura" | "ticket";

const DashboardConfig: {[key in RegisterType]: { has_yearly_tables: boolean };} = {
  acceso: {
    has_yearly_tables: false,
  },
  energia: {
    has_yearly_tables: true,
  },
  entrada: {
    has_yearly_tables: false,// true
  },
  estadocamara: {
    has_yearly_tables: false,
  },
  microsd: {
    has_yearly_tables: false,
  },
  peticion: {
    has_yearly_tables: false,
  },
  salida: {
    has_yearly_tables: false, // true
  },
  seguridad: {
    has_yearly_tables: false,
  },
  temperatura: {
    has_yearly_tables: true,
  },
  ticket: {
    has_yearly_tables: false,
  },
};