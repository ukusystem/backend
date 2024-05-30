export class RequestResult {
     readonly resultado: boolean; 
     readonly mensaje: string
     constructor(resultado:boolean, mensage:string){
        this.resultado = resultado
        this.mensaje = mensage
     }
}
