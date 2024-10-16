export class RequestResult {
     readonly resultado: boolean; 
     readonly mensaje: string;
     readonly codigo:number;

     constructor(resultado:boolean, mensage:string, code:number = -1){
        this.resultado = resultado
        this.mensaje = mensage
        this.codigo = code
     }
}
