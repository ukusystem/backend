
interface IAppConfig {
    node_env: "development" | "production" | "test";
    server: {
      ip: string;
      port: number;
      manager_port: number;
    };
    jwt: {
      access_token: {
        secret: string;
        expire: string;
      };
      refresh_token: {
        secret: string;
        expire: string;
      };
    };
    cookie: {
      access_token: {
        max_age: number;
        name: string;
      };
      refresh_token: {
        max_age: number;
        name: string;
      };
    };
    encrypt: {
      secret: string;
      salt: string;
    };
    // db: PoolOptions;
    // email: {
    //   client_id: string;
    //   client_secret: string;
    //   redirect_uris: string;
    //   refresh_token: string;
    // };
  }

// type SYSMTEM_MODE = "seguridad" | "libre"

enum CONTROLLER_MODE {
  Libre = 0,
  Seguridad = 1,
}

enum CONTROLLER_SECURITY {
  Desarmado = 0,
  Armado = 1,
}

interface CONTROLLER_MOTION {
  //   record: {
  //     seconds: number;
  //     resolution: {
  //       width: number;
  //       height: number;
  //     };
  //     fps: number;
  //   };
  //   snapshot: {
  //     seconds: number;
  //     resolution: {
  //       width: number;
  //       height: number;
  //     };
  //     interval: number;
  //   };
  MOTION_RECORD_SECONDS: number;
  MOTION_RECORD_RESOLUTION_WIDTH: number;
  MOTION_RECORD_RESOLUTION_HEIGHT: number;
  MOTION_RECORD_FPS: number;

  MOTION_SNAPSHOT_SECONDS: number;
  MOTION_SNAPSHOT_RESOLUTION_WIDTH: number;
  MOTION_SNAPSHOT_RESOLUTION_HEIGHT: number;
  MOTION_SNAPSHOT_INTERVAL: number;
}

interface CONTROLLER_STREAM {
  //   primary: {
  //     resolution: {
  //       width: number;
  //       height: number;
  //     };
  //     fps: number;
  //   };
  //   secondary: {
  //     resolution: {
  //       width: number;
  //       height: number;
  //     };
  //     fps: number;
  //   };
  //   auxiliary: {
  //     resolution: {
  //       width: number;
  //       height: number;
  //     };
  //     fps: number;
  //   };
  STREAM_PRIMARY_RESOLUTION_WIDTH: number;
  STREAM_PRIMARY_RESOLUTION_HEIGHT: number;
  STREAM_PRIMARY_RESOLUTION_FPS: number;

  STREAM_SECONDARY_RESOLUTION_WIDTH: number;
  STREAM_SECONDARY_RESOLUTION_HEIGHT: number;
  STREAM_SECONDARY_RESOLUTION_FPS: number;

  STREAM_AUXILIARY_RESOLUTION_WIDTH: number;
  STREAM_AUXILIARY_RESOLUTION_HEIGHT: number;
  STREAM_AUXILIARY_RESOLUTION_FPS: number;
}

interface CONTROLLER_CONFIG extends CONTROLLER_MOTION, CONTROLLER_STREAM {
//   CONTROLLER_MODE: CONTROLLER_MODE;
//   CONTROLLER_SECURITY: CONTROLLER_SECURITY;
}

export class AppConfig {
  readonly controller: { [ctrl_id: string]: CONTROLLER_CONFIG } = {};


  public static update_controller(newConfig: { [Property in keyof CONTROLLER_CONFIG]: CONTROLLER_CONFIG[Property] }) {

  }
  

}