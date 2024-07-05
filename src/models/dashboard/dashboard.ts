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
interface AcumuladoKWHRowDataPacket extends RowDataPacket {
  potenciakwh: number;
  me_id: number;
  ultimo: 0 | 1;
}


interface TotalAccesoTarjetaRemoto {
  tarjeta:{total_registrado:number, total_noregistrado: number}, 
  remoto:{total_remoto: number}
}

interface AccesoTarjetaRowData extends RowDataPacket {
  acceso_tarjeta: "no_registrado" | "registrado" | "otros";
  total: number;
}
interface AccesoRemotoRowData extends RowDataPacket {
  total_acceso_remoto : number;
}


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
      let subQuery = `SELECT re.ee_id, COUNT(*) as total_activo FROM ${"nodo"+ctrl_id}.${finalTable} re  WHERE re.fecha BETWEEN '${startDate}' AND '${endDate}' AND re.estado = 1 GROUP BY re.ee_id`
      let finalQuery = `SELECT totalpinentrada.* , ee.detector , ee.descripcion FROM ( ${subQuery} ) AS totalpinentrada  INNER JOIN general.equipoentrada ee ON totalpinentrada.ee_id = ee.ee_id ORDER BY totalpinentrada.ee_id ASC `
      const totalPinEntrada = await MySQL2.executeQuery<RowDataPacket[]>({sql:finalQuery})
      if(totalPinEntrada.length > 0) return totalPinEntrada;
      return []
    },"Dashboard.getTotalActivePinEntrada");

    static getTotalActivePinSalida = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
      const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
      const finalTable = DashboardConfig.salida.has_yearly_tables ? `registrosalida${year}` : "registrosalida";
      let subQuery = `SELECT rs.es_id , COUNT(*) as total_activo FROM ${"nodo"+ctrl_id}.${finalTable} rs WHERE rs.fecha BETWEEN '${startDate}' AND '${endDate}' AND rs.estado = 1 GROUP BY rs.es_id`
      let finalQuery = `SELECT totalpinsalida.* , es.actuador , es.descripcion FROM ( ${subQuery} ) AS totalpinsalida INNER JOIN general.equiposalida es ON totalpinsalida.es_id = es.es_id ORDER BY totalpinsalida.es_id ASC`
      const totalPinSalida = await MySQL2.executeQuery<RowDataPacket[]>({sql:finalQuery})
      if(totalPinSalida.length > 0) return totalPinSalida;
      return [];
    },"Dashboard.getTotalActivePinSalida");

    static getTotalAlarmas = handleErrorWithArgument<{total_alarma: number},IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.salida.has_yearly_tables ?`registrosalida${year}` :"registrosalida"
        const totalAlarmas = await MySQL2.executeQuery<TotalRowDataPacket[]>({sql:`SELECT COUNT(*) AS total FROM ${"nodo"+ctrl_id}.${finalTable} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' AND estado = 1 AND alarma = 1`})
        if(totalAlarmas.length > 0) return {total_alarma: totalAlarmas[0].total};
        return {total_alarma:0};
    },"Dashboard.getTotalAlarmas");

    static getTotalTarjeta = handleErrorWithoutArgument<{total_tarjeta:number}>(async ()=>{
        const totalTarjetas = await MySQL2.executeQuery<TotalRowDataPacket[]>({sql:`SELECT COUNT(*) AS total FROM general.acceso WHERE activo = 1`})
        if(totalTarjetas.length > 0) return {total_tarjeta: totalTarjetas[0].total};
        return {total_tarjeta:0};
    },"Dashboard.getTotalTarjeta")

    static getCameraStates = handleErrorWithArgument<Record<any,any>[],Pick<Controlador,"ctrl_id">>(async ({ctrl_id}) => {
        const camStates = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT c.cmr_id, c.tc_id , t.tipo, c.m_id, m.marca, c.ip , c.descripcion, c.conectado FROM ${"nodo" + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`})
        if(camStates.length > 0) return camStates;

        return [];
    },"Dashboard.getCameraStates")

    static getTotalTicketContrata = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.ticket.has_yearly_tables ?`registroticket${year}` :"registroticket"
        let subQuery = `SELECT rt.co_id, COUNT(*) AS total_ticket  FROM ${"nodo"+ctrl_id}.${finalTable} rt WHERE rt.fechacomienzo BETWEEN '${startDate}' AND '${endDate}' AND ( rt.estd_id = 2 OR rt.estd_id = 16 ) GROUP BY rt.co_id`
        let finalQuery = `SELECT totalticket.* , co.contrata , co.descripcion FROM ( ${subQuery} ) AS totalticket INNER JOIN general.contrata co ON totalticket.co_id = co.co_id ORDER BY totalticket.co_id ASC `
        const totalTicketContrata = await MySQL2.executeQuery<RowDataPacket[]>({sql:finalQuery})
        if(totalTicketContrata.length > 0) return totalTicketContrata;
        return [];
    },"Dashboard.getTotalTicketContrata");

    static getTotalIngresoContrata = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.acceso.has_yearly_tables ?`registroacceso${year}` :"registroacceso"
        let subQuery = `SELECT ra.co_id, COUNT(*) AS total_ingreso FROM ${"nodo"+ctrl_id}.${finalTable} ra WHERE ra.fecha BETWEEN '${startDate}' AND '${endDate}' AND ra.tipo = 1 AND ra.autorizacion = 1 GROUP BY ra.co_id`
        let finalQuery = `SELECT ingresototal.* , co.contrata, co.descripcion FROM ( ${subQuery} ) AS ingresototal INNER JOIN general.contrata co ON ingresototal.co_id = co.co_id ORDER BY ingresototal.co_id `
        const totalIngresoContrata = await MySQL2.executeQuery<RowDataPacket[]>({sql:finalQuery})
        if(totalIngresoContrata.length > 0) return totalIngresoContrata;
        return [];
    },"Dashboard.getTotalIngresoContrata");

    static getTotalAccesoTarjetaRemoto = handleErrorWithArgument<{data: TotalAccesoTarjetaRemoto, start_date: string, end_date: string},IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTableRegAcc = DashboardConfig.acceso.has_yearly_tables ?`registroacceso${year}` :"registroacceso"
        const finalTableRegSal = DashboardConfig.salida.has_yearly_tables ?`registrosalida${year}` :"registrosalida"
        const queryAccesoTarjeta = `SELECT CASE WHEN (co_id = 0 AND autorizacion = 0) THEN 'no_registrado' WHEN (co_id >= 1 AND autorizacion = 1) THEN 'registrado' ELSE 'otros' END AS acceso_tarjeta, COUNT(*) AS total FROM  ${"nodo"+ctrl_id}.${finalTableRegAcc} WHERE tipo = 1 AND fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY acceso_tarjeta`
        const queryAccesoRemoto = `SELECT COUNT(*) as total_acceso_remoto FROM ${"nodo"+ctrl_id}.${finalTableRegSal} WHERE es_id = 1 AND estado = 1 AND fecha BETWEEN '${startDate}' AND '${endDate}'`

        const resultAccesos : TotalAccesoTarjetaRemoto = {tarjeta:{total_registrado:0, total_noregistrado: 0}, remoto:{total_remoto: 0}}

        const totalAccesoTarjeta = await MySQL2.executeQuery<AccesoTarjetaRowData[]>({sql:queryAccesoTarjeta})
        if(totalAccesoTarjeta.length > 0){
          totalAccesoTarjeta.forEach((totalAcc)=>{
            if(totalAcc.acceso_tarjeta == "registrado") resultAccesos.tarjeta.total_registrado = totalAcc.total;
            if(totalAcc.acceso_tarjeta == "no_registrado") resultAccesos.tarjeta.total_noregistrado = totalAcc.total;
          })
        }

        const totalAccesoRemoto = await MySQL2.executeQuery<AccesoRemotoRowData[]>({sql:queryAccesoRemoto})
        if(totalAccesoRemoto.length > 0){
          resultAccesos.remoto.total_remoto = totalAccesoRemoto[0].total_acceso_remoto
        }

        return {data: resultAccesos, start_date:startDate, end_date:endDate}

    },"Dashboard.getTotalAccesoTarjetaRemoto");

    static getAcumuladoKWH = handleErrorWithArgument<Record<any,any>,IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
        const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
        const finalTable = DashboardConfig.energia.has_yearly_tables ?`registroenergia${year}` :"registroenergia"
        
        let subQuery = `SELECT me_id, MIN(fecha) AS primera_fecha , MAX(fecha) AS ultima_fecha FROM ${"nodo"+ctrl_id}.${finalTable} WHERE fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY me_id`
        let finalQuery = `SELECT re.me_id, re.potenciakwh,re.fecha , CASE WHEN re.fecha = minmaxregister.primera_fecha THEN 0 WHEN re.fecha = minmaxregister.ultima_fecha THEN 1 ELSE NULL END AS ultimo FROM ${"nodo"+ctrl_id}.${finalTable} re INNER JOIN ( ${subQuery} ) AS minmaxregister ON re.me_id = minmaxregister.me_id AND  (re.fecha = minmaxregister.ultima_fecha OR re.fecha = minmaxregister.primera_fecha )`

        const acumuladoKwh = await MySQL2.executeQuery<AcumuladoKWHRowDataPacket[]>({sql:finalQuery})
        const sumAcumulados = acumuladoKwh.reduce((prev, curr) => {
            const result = prev;
            if (curr.ultimo == 1) {
              result.sumFinal = result.sumFinal + curr.potenciakwh;
            } else if (curr.ultimo == 0) {
              result.sumInitial = result.sumInitial + curr.potenciakwh;
            }
            return result;
        },{ sumInitial: 0, sumFinal: 0 });

        let acumFinal = sumAcumulados.sumFinal - sumAcumulados.sumInitial > 0 ? sumAcumulados.sumFinal - sumAcumulados.sumInitial : 0 

        return {acumulado: acumFinal , data: acumuladoKwh}
    },"Dashboard.getAcumuladoKWH");

    static getMaxSensorTemperatura = handleErrorWithArgument<Record<any,any>[],IPropMethod>(async ({ctrl_id,isMonthly,date}) => {
      const {endDate,startDate,year}=Dashboard.getStartEndDate(date,isMonthly)
      const finalTable = DashboardConfig.temperatura.has_yearly_tables ?`registrotemperatura${year}` :"registrotemperatura"
      let subQuery = `SELECT rt.st_id, MAX(rt.valor) as valor_maximo FROM ${"nodo"+ctrl_id}.${finalTable} rt WHERE rt.fecha BETWEEN '${startDate}' AND '${endDate}' GROUP BY rt.st_id`
      let finalQuery = `SELECT maxtemperatura.* , st.serie , st.ubicacion FROM ( ${subQuery} ) AS maxtemperatura INNER JOIN nodo1.sensortemperatura st ON maxtemperatura.st_id = st.st_id WHERE st.activo = 1`
      const maxTempSensor = await MySQL2.executeQuery<RowDataPacket[]>({sql:finalQuery})
      if(maxTempSensor.length > 0) return maxTempSensor;
      return [];
    },"Dashboard.getMaxSensorTemperatura");


}

type RegisterType =  "acceso" | "energia" | "entrada" | "estadocamara" | "microsd" | "peticion" | "salida" | "seguridad" | "temperatura" | "ticket";

const DashboardConfig: {[key in RegisterType]: { has_yearly_tables: boolean };} = {
  acceso: {
    has_yearly_tables: false,
  },
  energia: {
    has_yearly_tables: false, // true
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