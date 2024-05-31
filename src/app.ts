import { resolve } from "path";
import { ServerApp } from "./models/server";
import * as cp from 'child_process'

(async () => {
  try {
    // Conectar a la base de datos:
    await ServerApp.connectDataBase();

    // Crear un servidor
    const server = new ServerApp();
    // Inicializar websockets
    server.websocket();
    // Inicializar dectecion de movimiento
    // await server.motion()

    // Init Maps
    await server.initmaps()

    // Mio
    server.runController();

    // Actulizar Tickets no atendidos:
    server.ticketNoAtendidoTest();

    // test()
  } catch (error) {
    console.log(error);
  }
})();

async function test() {
  
  // const a = [1,2,3]
  // const i = a.splice(8,1)
  // console.log(i)
  
  // console.log('Start')
  // cp.exec(`ping 172.16.4.200 -n 1`, { timeout: 10*1000 }, (error, stdout, stderror) => {
  //   if (error) {
  //     console.log('Error')
  //   } else {
  //     console.log('Success')
  //   }
  // });
  // console.log('After')


    // const a = [1,2,3,4,5]
    // const b = a.slice()
    // console.log(b)
    // for(const v of b){
    //   const i = a.indexOf(v)
    //   console.log(`${i}: ${v}`)
    //   if(v%2===0){
    //     a.splice(i,1)
    //   }
    // }
    // console.log(a)

//   const a = new Promise((a, b) => {
//     console.log(`Body`);
//     a(123)
//   });
//   await a
// //   .then((data) => {
// //     console.log(`Done ${data}`);
// //   }).catch((e) => {
// //     console.log(`Done ${e}`);
// //   });
//   console.log(`After`);
}
