import { MySQL2 } from "../../database/mysql";
import { Init } from "../init";
import { CamaraEvents, CameraJob, NvrControllerStructure, NvrJobSchedule, NvrPreferencia, NvrPreferenciaRowData } from "./nvr.types";
import { CronJob } from "cron";


export class NvrManager {
  static #map: NvrControllerStructure = new Map();

  static #getCronTime(): string {
    return `******`;
  }

  static async init() {
    try {
      const region_nodos = await Init.getRegionNodos();
      region_nodos.forEach(async (reg_nodo) => {
        const { ctrl_id, nododb_name } = reg_nodo;

        const preferencias = await MySQL2.executeQuery<NvrPreferenciaRowData[]>(
          {
            sql: `SELECT * FROM ${nododb_name}.nvrpreferencia`,
          }
        );

        const newCamEvent: CamaraEvents = new Map();

        preferencias.forEach((preferencia) => {
          const newCronStart = CronJob.from<null, NvrPreferencia>({
            cronTime: NvrManager.#getCronTime(),
            onTick: function (this: NvrPreferencia) {
                // ...
            },
            onComplete: null,
            start: true,
            // context: ticket.toJSON(),
          });
          const newCamJob: CameraJob = { info: preferencia };
          newCamEvent.set(preferencia.cmr_id, newCamJob);
        });

        NvrManager.#map.set(ctrl_id, newCamEvent);
      });
    } catch (error) {
      console.log(`NvrManager | Error al inicializar`);
      console.error(error);
      throw error;
    }
  }
}

export class CamCronJob implements NvrJobSchedule {
  #cron: CronJob<null, NvrPreferencia>;
  constructor(cron: CronJob<null, NvrPreferencia>) {
    this.#cron = cron;
  }
  stop(): void {
    this.#cron.stop();
  }
}