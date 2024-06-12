import { RowDataPacket } from "mysql2";
import { EquipoEntrada } from "../../types/db";
import { MySQL2 } from "../../database/mysql";

export class EquipoEntradaObject implements EquipoEntrada {
  #ee_id: number;
  #detector: string;
  #descripcion: string;
  #activo: number;

  constructor(props: EquipoEntrada) {
    const { activo,descripcion,detector,ee_id } = props;
    this.#ee_id = ee_id
    this.#detector = detector
    this.#descripcion = descripcion
    this.#activo = activo
  }

  public get ee_id(): number {
    return this.#ee_id;
  }
  public get detector(): string {
    return this.#detector;
  }
  public get descripcion(): string {
    return this.#descripcion;
  }
  public get activo(): number {
    return this.#activo;
  }
  public setEeId(ee_id:EquipoEntrada["ee_id"]) : void {
    this.#ee_id = ee_id
  }
  public setDetector(detector:EquipoEntrada["detector"]) : void {
    this.#detector = detector
  }
  public setDescripcion(descripcion:EquipoEntrada["descripcion"]) : void {
    this.#descripcion = descripcion
  }
  public setActivo(activo:EquipoEntrada["activo"]) : void {
    this.#activo = activo
  }
}

interface EquipoEntradaRowData extends RowDataPacket , EquipoEntrada {}

export class EquipoEntradaMap {

  public static map: {[ee_id:string]:EquipoEntradaObject} = {}

  public static add_update(equiEnt :EquipoEntradaObject ){
    if (!EquipoEntradaMap.map[equiEnt.ee_id]) {
      // add
      EquipoEntradaMap.map[equiEnt.ee_id] = equiEnt;
    } else {
      // update
      const currentEquiEnt = EquipoEntradaMap.map[equiEnt.ee_id];
      if(currentEquiEnt.detector != equiEnt.detector) currentEquiEnt.setDetector(equiEnt.detector);
      if(currentEquiEnt.descripcion != equiEnt.descripcion) currentEquiEnt.setDescripcion(equiEnt.descripcion);
      if(currentEquiEnt.activo != equiEnt.activo) currentEquiEnt.setActivo(equiEnt.activo);
      
    }
  }

  public static delete(equiEnt :EquipoEntradaObject){
    if (EquipoEntradaMap.map[equiEnt.ee_id]) {
      delete EquipoEntradaMap.map[equiEnt.ee_id]
    }
  }

  public static async init() {
    try {
        const equiposEntrada = await MySQL2.executeQuery<EquipoEntradaRowData[]>({sql:`SELECT * FROM general.equipoentrada WHERE activo = 1`})
        if(equiposEntrada.length > 0){
          for(let equiEnt of equiposEntrada){
            const newEquiEnt = new EquipoEntradaObject(equiEnt)
            EquipoEntradaMap.add_update(newEquiEnt)
          }
        }
    } catch (error) {
      console.log(`EquipoEntradaMap | Error al inicilizar equipos de entrada`);
      console.error(error);  
    }
  }

}
