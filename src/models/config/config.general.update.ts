import { GENERAL_CONFIG, UpdateGeneralFunction } from "./config.types";

export class GeneralUpdate {

  static #functions: { [P in keyof GENERAL_CONFIG]: UpdateGeneralFunction<P> } = {
      COMPANY_NAME: (currentConfig, newValue) => {
        if (currentConfig.COMPANY_NAME !== newValue) {
          currentConfig.COMPANY_NAME = newValue;
        }
      },
      EMAIL_ADMIN: (currentConfig, newValue) => {
        if (currentConfig.EMAIL_ADMIN !== newValue) {
          currentConfig.EMAIL_ADMIN = newValue;
        }
      },
    };

  static getFunction<T extends keyof GENERAL_CONFIG>(keyConfig: T): (currentConfig: GENERAL_CONFIG, newValue: GENERAL_CONFIG[T]) => void {
    return GeneralUpdate.#functions[keyConfig];
  }
}
