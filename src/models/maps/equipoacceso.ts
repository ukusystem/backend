import { RowDataPacket } from "mysql2";
import { EquipoAcceso } from "../../types/db";
import { MySQL2 } from "../../database/mysql";

export class EquipoAccesoObject implements EquipoAcceso {
  #ea_id: number;
  #nombre: string;

  constructor(props: EquipoAcceso) {
    const { ea_id, nombre } = props;
    this.#ea_id = ea_id;
    this.#nombre = nombre;
  }

  public get ea_id(): number {
    return this.#ea_id;
  }

  public get nombre(): string {
    return this.#nombre;
  }

  public setEaId(ea_id: number): void {
    this.#ea_id = ea_id;
  }

  public setNombre(nombre: string): void {
    this.#nombre = nombre;
  }
}

interface EquipoAccesoRowData extends RowDataPacket , EquipoAcceso {}

export class EquipoAccesoMap {

  public static map: {[ea_id:string]:EquipoAccesoObject} = {}

  public static add_update(equiAcc :EquipoAccesoObject ){
    if (!EquipoAccesoMap.map[equiAcc.ea_id]) {
      // add
      EquipoAccesoMap.map[equiAcc.ea_id] = equiAcc;
    } else {
      // update
      const currentEquipAcc = EquipoAccesoMap.map[equiAcc.ea_id];
      if(currentEquipAcc.nombre != equiAcc.nombre) currentEquipAcc.setNombre(equiAcc.nombre);
    }
  }

  public static delete(equiAcc :EquipoAccesoObject){
    if (EquipoAccesoMap.map[equiAcc.ea_id]) {
      delete EquipoAccesoMap.map[equiAcc.ea_id]
    }
  }

  public static async init() {
    try {
        const equiposAcceso = await MySQL2.executeQuery<EquipoAccesoRowData[]>({sql:`SELECT * FROM general.equipoacceso`})
        if(equiposAcceso.length>0){
          for(let equiAcc of equiposAcceso){
            const newEquiAcc = new EquipoAccesoObject(equiAcc)
            EquipoAccesoMap.add_update(newEquiAcc)
          }
        }
    } catch (error) {
      console.log(`EquipoAccesoMap | Error al inicilizar equipos de acceso`);
      console.error(error);  
      throw error
    }
  }

}
