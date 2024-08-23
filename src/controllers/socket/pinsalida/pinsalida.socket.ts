import { Server } from "socket.io";
import { SocketPinSalida } from "./pinsalida.types";
import { PinSalidaManager, PinSalidaSocketObserver } from "./pinsalida.manager";
import { pinSalNamespaceSchema } from "./pinsalida.schema";
import { onOrder } from "../../../models/controllerapp/controller";

export const pinSalidaSocket = async ( io: Server, socket: SocketPinSalida ) => {
      
  const nspEnergia = socket.nsp;
  const [, , xctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pines_salida/ctrl_id"

  const result = pinSalNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    console.log(
      result.error.errors.map((errorDetail) => ({
        message: errorDetail.message,
        status: errorDetail.code,
        path: errorDetail.path,
      }))
    );

    return;
  }

  const { ctrl_id } = result.data;

  console.log(`Socket Pines Salida | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
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
    console.log("orden: ",{action,ctrl_id,pin, es_id} )
    try {
      const ordenResult =  await onOrder({action,ctrl_id,pin})
      if(ordenResult != undefined){
        console.log("result_orden: ", ordenResult.resultado, ordenResult.mensaje)
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
      console.error(error)
    }
  })

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_salida/${ctrl_id}`).sockets.size;
    console.log(`Socket Pines Salida | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Pines Salida | Eliminado Observer | ctrl_id = ${ctrl_id}`)
      PinSalidaManager.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Pines Salida | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}