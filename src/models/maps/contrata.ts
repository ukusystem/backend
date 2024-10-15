import { RowDataPacket } from "mysql2";
import { Contrata } from "../../types/db";
import { MySQL2 } from "../../database/mysql";
import { genericLogger } from "../../services/loggers";

interface ContrataRowData extends RowDataPacket, Contrata {};

export class ContrataObject implements Contrata {
  #co_id: number;
  #contrata: string;
  #r_id: number;
  #descripcion: string;
  #activo: number;

  constructor(props: Contrata) {
    const { activo, co_id, contrata, descripcion, r_id } = props;
    this.#co_id = co_id;
    this.#contrata = contrata;
    this.#r_id = r_id;
    this.#descripcion = descripcion;
    this.#activo = activo;
  }

  public get co_id(): number {
    return this.#co_id;
  }
  public get contrata(): string {
    return this.#contrata;
  }
  public get r_id(): number {
    return this.#r_id;
  }
  public get descripcion(): string {
    return this.#descripcion;
  }
  public get activo(): number {
    return this.#activo;
  }
  
  public setCoId(co_id: Contrata["co_id"]): void {
    this.#co_id = co_id;
  }
  public setContrata(contrata: Contrata["contrata"]): void {
    this.#contrata = contrata;
  }
  public setRId(r_id: Contrata["r_id"]): void {
    this.#r_id = r_id;
  }
  public setDescripcion(descripcion: Contrata["descripcion"]): void {
    this.#descripcion = descripcion;
  }
  public setActivo(activo: Contrata["activo"]): void {
    this.#activo = activo;
  }
}

export class ContrataMap {
  public static map: { [co_id: string]: ContrataObject } = {};

  public static add_update(contrata: ContrataObject) {
    if (!ContrataMap.map[contrata.co_id]) {
      // add
      ContrataMap.map[contrata.co_id] = contrata;
    } else {
      // update
      const currentContrata = ContrataMap.map[contrata.co_id];
      if (currentContrata.activo != contrata.activo) currentContrata.setActivo(contrata.activo);
      if (currentContrata.contrata != contrata.contrata) currentContrata.setContrata(contrata.contrata);
      if (currentContrata.descripcion != contrata.descripcion) currentContrata.setDescripcion(contrata.descripcion);
      if (currentContrata.r_id != contrata.r_id) currentContrata.setRId(contrata.r_id);
    }
  }

  public static delete(contrata: ContrataObject) {
    if (ContrataMap.map[contrata.co_id]) {
      delete ContrataMap.map[contrata.co_id];
    }
  }

  public static async init(){
    try {
        const initailContratas = await MySQL2.executeQuery<ContrataRowData[]>({ sql: `SELECT * FROM general.contrata WHERE activo = 1`, });
        if (initailContratas.length > 0) {
          for (let contrata of initailContratas) {
            const newContrata = new ContrataObject(contrata);
            ContrataMap.add_update(newContrata);
          }
        }
    } catch (error) {
        genericLogger.error(`ContrataMap | Error al inicilizar contratas`,error);
        throw error
    }
  }

}
