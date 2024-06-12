import { RowDataPacket } from "mysql2";
import { EquipoSalida } from "../../types/db";
import { MySQL2 } from "../../database/mysql";

export class EquipoSalidaObject implements EquipoSalida {
  #descripcion: string;
  #activo: number;
  #es_id: number;
  #actuador: string;

  constructor(props: EquipoSalida) {
    const { activo, descripcion, actuador, es_id } = props;
    this.#descripcion = descripcion;
    this.#activo = activo;
    this.#actuador = actuador;
    this.#es_id = es_id;
  }

  public get es_id(): number {
    return this.#es_id;
  }
  public get actuador(): string {
    return this.#actuador;
  }
  public get descripcion(): string {
    return this.#descripcion;
  }
  public get activo(): number {
    return this.#activo;
  }
  public setEsId(es_id: EquipoSalida["es_id"]): void {
    this.#es_id = es_id;
  }
  public setActuador(actuador: EquipoSalida["actuador"]): void {
    this.#actuador = actuador;
  }
  public setDescripcion(descripcion: EquipoSalida["descripcion"]): void {
    this.#descripcion = descripcion;
  }
  public setActivo(activo: EquipoSalida["activo"]): void {
    this.#activo = activo;
  }
}

interface EquipoSalidaRowData extends RowDataPacket, EquipoSalida {}

export class EquipoSalidaMap {
  public static map: { [es_id: string]: EquipoSalidaObject } = {} ;

  public static add_update(equiSal: EquipoSalidaObject) {
    if (!EquipoSalidaMap.map[equiSal.es_id]) {
      // add
      EquipoSalidaMap.map[equiSal.es_id] = equiSal;
    } else {
      // update
      const currentEquiEnt = EquipoSalidaMap.map[equiSal.es_id];
      if (currentEquiEnt.actuador != equiSal.actuador) currentEquiEnt.setActuador(equiSal.actuador);
      if (currentEquiEnt.descripcion != equiSal.descripcion) currentEquiEnt.setDescripcion(equiSal.descripcion);
      if (currentEquiEnt.activo != equiSal.activo) currentEquiEnt.setActivo(equiSal.activo);
    }
  }

  public static delete(equiSal: EquipoSalidaObject) {
    if (EquipoSalidaMap.map[equiSal.es_id]) {
      delete EquipoSalidaMap.map[equiSal.es_id];
    }
  }

  public static async init() {
    try {
      const equiposSalida = await MySQL2.executeQuery<EquipoSalidaRowData[]>({sql: `SELECT * FROM general.equiposalida WHERE activo = 1`,});
      if (equiposSalida.length > 0) {
        for (let equiSal of equiposSalida) {
          const newEquiSal = new EquipoSalidaObject(equiSal);
          EquipoSalidaMap.add_update(newEquiSal);
        }
      }
    } catch (error) {
      console.log(`EquipoSalidaMap | Error al inicilizar equipos de salida`);
      console.error(error);
    }
  }
}
