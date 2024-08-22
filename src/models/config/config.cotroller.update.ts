import { CamStreamQuality, CamStreamSocketManager, ControllerStateManager, PinEntradaManager, PinSalidaManager } from "../../controllers/socket";
import { Resolution } from "./config.resolution";
import { CONTROLLER_CONFIG, UpdateControllerFunction } from "./config.types";

export class ControllerUpdate {
    
  static #functions: { [P in keyof CONTROLLER_CONFIG]: UpdateControllerFunction<P>  } = {
    CONTROLLER_MODE: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.CONTROLLER_MODE !== newValue) {
        //update
        currentConfig.CONTROLLER_MODE = newValue;
        // notify
        PinEntradaManager.notifyControllerMode(ctrl_id, newValue);
        ControllerStateManager.notifyMode(ctrl_id, newValue);
        ControllerStateManager.notifyAnyChange(ctrl_id,{mode: newValue});
         
      }
    },
    CONTROLLER_SECURITY: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.CONTROLLER_SECURITY !== newValue) {
        //update
        currentConfig.CONTROLLER_SECURITY = newValue;
        // notify
        PinEntradaManager.notifyControllerSecurity(ctrl_id, newValue);
        ControllerStateManager.notifySecurity(ctrl_id, newValue);
        ControllerStateManager.notifyAnyChange(ctrl_id,{security: newValue});
        PinSalidaManager.updateArmado(ctrl_id,newValue);
      }
    },
    MOTION_RECORD_SECONDS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_SECONDS !== newValue) {
        //update
        currentConfig.MOTION_RECORD_SECONDS = newValue;
      }
    },
    MOTION_RECORD_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = Resolution.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.MOTION_RECORD_RESOLUTION = newResolution;
        }
      }
    },
    MOTION_RECORD_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_FPS !== newValue) {
        //update
        currentConfig.MOTION_RECORD_FPS = newValue;
      }
    },
    MOTION_SNAPSHOT_SECONDS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_SECONDS !== newValue) {
        //update
        currentConfig.MOTION_SNAPSHOT_SECONDS = newValue;
      }
    },
    MOTION_SNAPSHOT_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = Resolution.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.MOTION_SNAPSHOT_RESOLUTION = newResolution;
        }
      }
    },
    MOTION_SNAPSHOT_INTERVAL: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_INTERVAL !== newValue) {
        //update
        currentConfig.MOTION_SNAPSHOT_INTERVAL = newValue;
      }
    },
    STREAM_PRIMARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_PRIMARY_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = Resolution.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.STREAM_PRIMARY_RESOLUTION = newResolution;
          // notify
          CamStreamSocketManager.notifyChangeConfig(ctrl_id,CamStreamQuality.Primary);
        }
      }
    },
    STREAM_PRIMARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_PRIMARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_PRIMARY_FPS = newValue;
        // notify
        CamStreamSocketManager.notifyChangeConfig( ctrl_id, CamStreamQuality.Primary );
      }
    },
    STREAM_SECONDARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if ( currentConfig.STREAM_SECONDARY_RESOLUTION.res_id !== newValue.res_id ) {
        const newResolution = Resolution.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.STREAM_SECONDARY_RESOLUTION = newResolution;
          // notify
          CamStreamSocketManager.notifyChangeConfig( ctrl_id, CamStreamQuality.Secondary );
        }
      }
    },
    STREAM_SECONDARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_SECONDARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_SECONDARY_FPS = newValue;
        // notify
        CamStreamSocketManager.notifyChangeConfig( ctrl_id, CamStreamQuality.Secondary );
      }
    },
    STREAM_AUXILIARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_AUXILIARY_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = Resolution.getResolution(newValue.res_id);
        if (newResolution) {
          // update
          currentConfig.STREAM_AUXILIARY_RESOLUTION = newResolution;
          // notify
          CamStreamSocketManager.notifyChangeConfig( ctrl_id, CamStreamQuality.Auxiliary );
        }
      }
    },
    STREAM_AUXILIARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_AUXILIARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_AUXILIARY_FPS = newValue;
        // notify
        CamStreamSocketManager.notifyChangeConfig(
          ctrl_id,
          CamStreamQuality.Auxiliary
        );
      }
    },
  };

  static getFunction<T extends keyof CONTROLLER_CONFIG>( keyConfig: T ): ( currentConfig: CONTROLLER_CONFIG, newValue: CONTROLLER_CONFIG[T], ctrl_id: number ) => void {
    return ControllerUpdate.#functions[keyConfig];
  }
}