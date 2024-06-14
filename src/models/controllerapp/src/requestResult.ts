export class RequestResult {
     readonly resultado: boolean; 
     readonly mensaje: string;
     readonly id: null | number;

     constructor(resultado:boolean, mensage:string, id: null | number  = null){
        this.resultado = resultado
        this.mensaje = mensage
        this.id = id
     }
}
