import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import { Region } from "../../types/db";
import { RegionNotifyManager } from "../system";

interface RegionRowData extends RowDataPacket, Region {}

export class RegionMapManager {
  static #regions: Map<number, Region> = new Map();

  static #filterUndefined(data: Partial<Region>): Partial<Region> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Region;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(rgn_id: number, newRegion: Region) {
    const existRegion = RegionMapManager.#regions.has(rgn_id);
    if (!existRegion) {
      RegionMapManager.#regions.set(rgn_id, newRegion);
    }
  }

  static update(rgn_id: number, fieldsUpdate: Partial<Region>) {
    const currRegion = RegionMapManager.#regions.get(rgn_id);
    if (currRegion !== undefined) {
      const curRegionCopy = {...currRegion}
      const {rgn_id,...fieldsFiltered} = RegionMapManager.#filterUndefined(fieldsUpdate);
      Object.assign(currRegion, fieldsFiltered);
      RegionNotifyManager.update(curRegionCopy,fieldsFiltered);
    }
  }

  static getRegion(rgn_id: number): Region | undefined {
    return RegionMapManager.#regions.get(rgn_id);
  }

  static async init() {
    try {
      const regions = await MySQL2.executeQuery<RegionRowData[]>({
        sql: `SELECT * FROM general.region`,
      });
      console.log(JSON.stringify(regions))
      regions.forEach((region) => {
        RegionMapManager.add(region.rgn_id, region);
      });
    } catch (error) {
      console.log(`RegionMapManager | Error al inicializar regiones`);
      console.error(error);
      throw error;
    }
  }
}


// (async () => {
//   setTimeout(() => {
//     console.log("============Update Region==========")
//     RegionMapManager.update(1,{region: "Ancash"})
//   }, 30000);
// })();