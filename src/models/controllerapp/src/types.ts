import {Camara} from '../../../types/db'

export type IntConsumer = ((code: number) => void) | null;
export type LoadedFile = { ruta: string; nombreoriginal: string; tipo: string };
export type PinOrder = { action:number; ctrl_id:number; pin:number };


export class CameraToCheck{
    readonly nodeID:number
    readonly camara:Camara
    checkedIn:boolean =false
    errorNotified:boolean = false

    constructor(nodeID:number, camara:Camara){
        this.nodeID = nodeID
        this.camara = camara
    }
}