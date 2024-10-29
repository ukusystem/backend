import { Server } from "socket.io";
import { SocketPinSalida } from "./pinsalida.types";
import { PinSalidaManager, PinSalidaSocketObserver } from "./pinsalida.manager";
import { pinSalNamespaceSchema } from "./pinsalida.schema";
import { onOrder } from "../../../models/controllerapp/controller";
import { genericLogger } from "../../../services/loggers";

export const pinSalidaSocket = async ( io: Server, socket: SocketPinSalida ) => {
      
  const nspPinSal = socket.nsp;
  const [, , xctrl_id] = nspPinSal.name.split("/"); // Namespace : "/pines_salida/ctrl_id"

  const result = pinSalNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const observer = new PinSalidaSocketObserver(socket);
  PinSalidaManager.registerObserver(Number(ctrl_id),observer);

  let newEquipSal = PinSalidaManager.getEquiposSalida(ctrl_id);
  const equiSalFiltered = newEquipSal.filter((equiSal)=> equiSal.es_id !== PinSalidaManager.ES_ID_ARMADO);
  socket.emit("equipos_salida",equiSalFiltered);
  
  socket.on("initial_list_pines_salida",(es_id: number)=>{
    let newListPinSal = PinSalidaManager.getListPinesSalida(ctrl_id,es_id);
    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)){
      if(PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)){
        let {pines_salida,...equisal} = PinSalidaManager.map[ctrl_id][es_id];
        if(equisal.es_id !== PinSalidaManager.ES_ID_ARMADO){
          socket.emit("list_pines_salida",newListPinSal,equisal);
        }
      }}
  })

  socket.on("initial_item_pin_salida",(es_id: number, ps_id:number)=>{
    let newItemPinSal = PinSalidaManager.getItemPinSalida(ctrl_id,es_id,ps_id)
    if(newItemPinSal){
      if(newItemPinSal.es_id !== PinSalidaManager.ES_ID_ARMADO){
        socket.emit("item_pin_salida",newItemPinSal)
      }
    }
  })

  socket.on("orden_pin_salida",async ({action,ctrl_id,pin,es_id})=>{
    genericLogger.info(`Socket Pines Salida | Orden | ctrl_id = ${ctrl_id}`,{action,pin,es_id});
    try {
      const ordenResult =  await onOrder({action,ctrl_id,pin})
      if(ordenResult != undefined){
        genericLogger.info(`Socket Pines Salida | Resultado Orden | ctrl_id = ${ctrl_id}`,ordenResult);
        if(ordenResult.resultado){ // orden correcto
          if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
            if (PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
              if(PinSalidaManager.map[ctrl_id][es_id].pines_salida.hasOwnProperty(pin)){

                const  currentPinSal = PinSalidaManager.map[ctrl_id][es_id].pines_salida[pin]
                currentPinSal.setOrden(action)
                PinSalidaManager.add_update(currentPinSal);

                socket.emit("response_orden_pin_salida",{success:ordenResult.resultado , message: ordenResult.mensaje, ordenSend:{action,ctrl_id,pin,es_id}})
              }
            }
          }
        }else{
          socket.emit("response_orden_pin_salida",{success:ordenResult.resultado , message: ordenResult.mensaje, ordenSend:{action,ctrl_id,pin,es_id}})
        }
      }
    } catch (error) {
      genericLogger.error(`Socket Pines Salida | Error Orden | ctrl_id = ${ctrl_id}`,error);
    }
  })

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_salida/${ctrl_id}`).sockets.size;
    if (clientsCount == 0 ) {
      PinSalidaManager.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    genericLogger.error(`Error en el namespace pines de salida | ctrl_id = ${ctrl_id}`,error);
  });
}