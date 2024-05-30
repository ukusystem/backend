import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import type { ActividadPersonal, ArchivoTicket, Cargo, Contrata, Controlador ,Estado,Personal,Region,RegistroTicket , TipoTrabajo} from "../types/db";
import { handleErrorWithArgument, handleErrorWithoutArgument } from "../utils/simpleErrorHandler";
import { Init } from "./init";
import { UserInfo } from "./auth";
import { CustomError } from "../utils/CustomError";


type PersonalInfo = Pick<Personal, "p_id"|"nombre" | "apellido"| "telefono" | "dni"  | "c_id" | "co_id" | "foto">
type PersonalSolicitante = Personal &  Pick<Cargo,"cargo"> & Pick<Contrata,"contrata">
type RegionNodo = Pick<Region,"region"> & Pick<Controlador,"ctrl_id"|"nodo">
type ActividaPersonalDetail = ActividadPersonal & Pick<Cargo,"cargo"> & Pick<Contrata,"contrata">
type TotalRegistroTicket = {total:number}
type RegistroTicketDetail = RegistroTicket & Pick<Estado,"estado"> & {tipotrabajo: string} & Pick<Contrata,"contrata"> & Pick<Personal, "nombre" | "apellido">

interface RegistroTicketRowData extends RowDataPacket , RegistroTicket {}
interface TipoTrabajoRowData extends RowDataPacket, TipoTrabajo {}
interface PersonalRowData extends RowDataPacket, PersonalInfo {}
interface RegionNodoRowData extends RowDataPacket, RegionNodo {}
interface CargoRowData extends RowDataPacket, Cargo {}

interface PersonalSolicitanteRowData extends RowDataPacket, PersonalSolicitante {}
interface ActividaPersonalDetailRowData extends RowDataPacket, ActividaPersonalDetail {}
interface ArchivoRowData extends RowDataPacket, ArchivoTicket {}
interface TotalRegistroTicketRowData extends RowDataPacket, TotalRegistroTicket {}
interface RegistroTicketDetailRowData extends RowDataPacket , RegistroTicketDetail {} 

export class Ticket {

    static getTicketsByControladorId = handleErrorWithArgument< RegistroTicket[],Pick<Controlador,"ctrl_id">>(
        async ({ctrl_id})=>{
            const registroTickets = await MySQL2.executeQuery<RegistroTicketRowData[]>({sql:`SELECT * FROM ${"nodo"+ctrl_id}.registroticket r ORDER BY r.rt_id DESC`})
            
            if(registroTickets.length>0){
                return registroTickets
            }
            return []
        }
        ,"Ticket.getTicketsByControladorId"
    )

    static getTicketsPendientesByControladorId = handleErrorWithArgument< RegistroTicket[],Pick<Controlador,"ctrl_id">>(
        async ({ctrl_id})=>{

            const registroTickets = await MySQL2.executeQuery<RegistroTicketRowData[]>({sql:`SELECT * FROM ${"nodo"+ctrl_id}.registroticket r WHERE r.estd_id = 1`})

            if(registroTickets.length>0){
                return registroTickets
            }
            return []
        }
        ,"Ticket.getTicketsByControladorId"
    )

    static getNext7DaysByCtrlId= handleErrorWithArgument<RegistroTicket[] ,Pick<Controlador,"ctrl_id">>(
        async ({ctrl_id})=>{

            const registroData = await MySQL2.executeQuery<RegistroTicketRowData[]>({sql:`SELECT * FROM  ${"nodo"  + ctrl_id}.registroticket WHERE fechacomienzo >= CURDATE() AND fechatermino <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND (estd_id = 1 OR estd_id = 2)`})

          if(registroData.length>0){
            return registroData
          }else{
            return []
          }
        }
      ,"Ticket.getNext7DaysByCtrlId")

    static getTiposTrabajo = handleErrorWithoutArgument<TipoTrabajo[]>(async ()=>{

        const registrosTipoTrabajo = await MySQL2.executeQuery<TipoTrabajoRowData[]>({sql:`SELECT * FROM general.tipotrabajo`})
        
        if(registrosTipoTrabajo.length> 0){
            return registrosTipoTrabajo
        }
        return []
    }, "Ticket.getTiposTrabajo")

    static getPersonalesByContrataId = handleErrorWithArgument<PersonalInfo[],Pick<Contrata, "co_id">>(async({co_id})=>{
        
        const personalesContrata = await MySQL2.executeQuery<PersonalRowData[]>({sql:`SELECT p_id, nombre,apellido, telefono, dni, c_id , co_id, foto FROM general.personal p WHERE p.co_id = ? AND nombre IS NOT NULL`, values:[co_id]})

        if(personalesContrata.length>0){
            return personalesContrata
        }
        return []
    },"Ticket.getPersonalesByContrataId")

    static getNodos = handleErrorWithoutArgument<RegionNodo[]>(async ()=>{

        const regionNodo = await MySQL2.executeQuery<RegionNodoRowData[]>({sql:`SELECT r.region, c.nodo, c.ctrl_id  FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id WHERE c.nodo IS NOT NULL`})

        if(regionNodo.length>0){
            return regionNodo
        }
        return []
    },"Ticket.getNodos")

    static getTicketByCrtlIdAndTicketId = handleErrorWithArgument<RegistroTicket | null, Pick<Controlador,"ctrl_id"> & Pick<RegistroTicket,"rt_id">>(async({ctrl_id, rt_id})=>{

        const ticket = await MySQL2.executeQuery<RegistroTicketRowData[]>({sql:`SELECT * FROM ${"nodo"+ctrl_id}.registroticket r WHERE r.rt_id = ?`, values: [rt_id]})

        if(ticket.length>0){
            return ticket[0]
        }
        return null
    },"Ticket.getTicketByCrtlIdAndTicketId")

    static getCargos = handleErrorWithoutArgument<Cargo[]>( async ()=>{

        const cargosData = await MySQL2.executeQuery<CargoRowData[]>({sql:`SELECT * FROM general.cargo`})
      
        if(cargosData.length>0){
          return cargosData
        }
        return []
    },"Ticket.getCargos")

    static getSolicitante = handleErrorWithArgument< PersonalSolicitante | null, Pick<Personal ,"p_id">>( async ({p_id})=>{
        
        const personal = await MySQL2.executeQuery<PersonalSolicitanteRowData[]>({sql:`SELECT p.p_id, p.nombre, p.telefono, p.dni, p.c_id , ca.cargo , p.co_id, co.contrata , p.foto, p.correo , p.activo FROM general.personal p INNER JOIN general.cargo ca ON p.c_id = ca.c_id INNER JOIN general.contrata co ON p.co_id = co.co_id WHERE p.p_id = ?`,values:[p_id]})

        if(personal.length>0){
            return personal[0]
        }
        return null;
    },"Ticket.getSolicitante")

    static getActividaPersonal = handleErrorWithArgument<ActividaPersonalDetail[],{ctrl_id:number, rt_id: number}>(async ({ctrl_id, rt_id})=>{
        
        const actividadPersonal = await MySQL2.executeQuery<ActividaPersonalDetailRowData[]>({sql:`SELECT ap.ap_id, ap.nombre, ap.telefono, ap.dni , ap.c_id, ca.cargo, ap.co_id, co.contrata, ap.rt_id, ap.foto FROM ${"nodo" + ctrl_id}.actividadpersonal ap INNER JOIN general.cargo ca ON ap.c_id = ca.c_id INNER JOIN general.contrata co ON ap.co_id = co.co_id WHERE ap.rt_id = ? `, values:[rt_id]})

        if(actividadPersonal.length>0){
            return actividadPersonal
        }
        return [];
    },"Ticket.getActividaPersonal")

    static getArchivosCargados = handleErrorWithArgument< ArchivoTicket[] , {ctrl_id:number, rt_id: number} >(async ({ctrl_id, rt_id})=>{
        
        const archivos = await MySQL2.executeQuery<ArchivoRowData[]>({sql:`SELECT * FROM ${"nodo"+ ctrl_id}.archivoticket a WHERE a.rt_id = ? `, values:[rt_id]})

        if(archivos.length>0){
            return archivos
        }

        return [];

    },"Ticket.getArchivosCargados");

    static getTicketsPendientes = handleErrorWithoutArgument<(RegistroTicket & {ctrl_id:number})[] | []>(
        async ()=>{
            const region_nodos = await Init.getRegionNodos()
            if(region_nodos.length>0){
                const allHistorial = await region_nodos.reduce(async (acc, item) => {
                    const resultAcc = await acc;
                    const { region, nodo, ctrl_id, nododb_name } = item;
                    const registroTickets = await Ticket.getTicketsPendientesByControladorId({ctrl_id});
                    if(registroTickets.length>0){
                        const finalRegistroTickets = registroTickets.map((ticket) => ({ ...ticket, ctrl_id }));
                        resultAcc.push(...finalRegistroTickets)
                    }
                    return resultAcc;
                }, Promise.resolve([] as (RegistroTicket & {ctrl_id:number})[]));
                return allHistorial
            }
            return []
        }
        , "Ticket.getTodosPendientes"
    )

    static getRegistrosByCtrlIdAndLimitAndOffset = handleErrorWithArgument<RegistroTicketDetail[],{ctrl_id:number, limit:number, offset: number, user: UserInfo}>( async({ctrl_id,limit,offset,user})=>{
        if(user.rol === "Invitado"){
            
            const registroTickets = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({sql:`SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${"nodo"+ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.co_id = ? ORDER BY rt.rt_id DESC LIMIT ? OFFSET ? `, values:[user.co_id,limit, offset]})

            if(registroTickets.length>0){
                return registroTickets
            }
            return []

        }else if( user.rol === "Administrador" || user.rol === "Usuario" ){

            const registroTickets = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({sql:`SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${"nodo"+ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id ORDER BY rt.rt_id DESC LIMIT ? OFFSET ? `, values:[limit, offset]})
            
            if(registroTickets.length>0){
                return registroTickets
            }
            return []
        }else{
            const errUserRol = new CustomError("Rol de usuario no contemplado",500,"user-rol-notimplemented")
            throw errUserRol
        } 
    },"Ticket.getRegistrosByCtrlIdAndLimitAndOffset")

    static getSingleRegistroTicketByCtrlIdAndRtId = handleErrorWithArgument<RegistroTicketDetail | null,{rt_id:number, ctrl_id:number, user: UserInfo}>(async({rt_id,ctrl_id,user})=>{
        if(user.rol === "Invitado"){
            
            const singleRegistroTicket = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({sql:`SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${"nodo"+ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.rt_id = ? AND rt.co_id = ? `, values:[rt_id,user.co_id]})

            if(singleRegistroTicket.length>0){
                return singleRegistroTicket[0]
            }
            return null
        }else if(user.rol === "Administrador" || user.rol === "Usuario"){
            
            const singleRegistroTicket = await MySQL2.executeQuery<RegistroTicketDetailRowData[]>({sql:`SELECT rt.*, e.estado, tt.nombre as tipotrabajo, co.contrata ,p.nombre , p.apellido FROM  ${"nodo"+ctrl_id}.registroticket rt INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id INNER JOIN general.personal p ON rt.p_id = p.p_id WHERE rt.rt_id = ? `,values:[rt_id]})

            if(singleRegistroTicket.length>0){
                return singleRegistroTicket[0]
            }
            return null
        }else{
            const errUserRol = new CustomError("Rol de usuario no contemplado",500,"user-rol-notimplemented")
            throw errUserRol   
        }

    },"Ticket.getSingleRegistroTicketByCtrlIdAndRtId")

    static getTotalRegistroTicketByCtrlId = handleErrorWithArgument<number,{ctrl_id:number, user: UserInfo}>(async({ctrl_id,user})=>{

        if(user.rol === "Invitado"){

            const totalRegistros = await MySQL2.executeQuery<TotalRegistroTicketRowData[]>({sql:`SELECT COUNT(*) AS total FROM ${"nodo"+ctrl_id}.registroticket WHERE co_id = ?`, values:[ user.co_id ]})

            if(totalRegistros.length > 0){
                return totalRegistros[0].total
            }
            return 0;
        }else if(user.rol === "Administrador" || user.rol === "Usuario"){
            
            const totalRegistros = await MySQL2.executeQuery<TotalRegistroTicketRowData[]>({sql:`SELECT COUNT(*) AS total FROM ${"nodo"+ctrl_id}.registroticket`})

            if (totalRegistros.length > 0) {
                return totalRegistros[0].total;
            }
            return 0;
        }else{
            const errUserRol = new CustomError("Rol de usuario no contemplado",500,"user-rol-notimplemented")
            throw errUserRol   
        }
        
    },"Ticket.getTotalRegistroTicketByCtrlId")

    static getAllTicketDetails = handleErrorWithArgument<null | {solicitante: PersonalSolicitante;ticket: RegistroTicketDetail;personales: ActividaPersonalDetail[];archivos_respaldo: ArchivoTicket[]}, {rt_id:number, ctrl_id:number, user: UserInfo}>(async ({ctrl_id,rt_id, user}) => {

        const ticket = await Ticket.getSingleRegistroTicketByCtrlIdAndRtId({ctrl_id,rt_id,user})
        if(ticket){
            const solicitante = await Ticket.getSolicitante({p_id: ticket.p_id});
            const personales = await Ticket.getActividaPersonal({ctrl_id, rt_id: ticket.rt_id})
            const archivosRespaldo = await Ticket.getArchivosCargados({ctrl_id,rt_id:ticket.rt_id})
            
            const result = {
              solicitante: solicitante!,
              ticket,
              personales,
              archivos_respaldo: archivosRespaldo,
            };
            
            
            return result
        }
        
        return null;
    },"Ticket.getAllTicketDetails")

}