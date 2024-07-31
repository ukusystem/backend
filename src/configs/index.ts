import "dotenv/config";
import { IDbEnv, dbEnv } from "./db.configs";
import { jwtEnv , IJwtEnv } from "./jwt.configs";
import { emailEnv ,IEmailEnv } from "./email.configs";
import { serverEnv , IServerEnv } from "./server.configs";
import { PoolOptions } from "mysql2";
import { encryptEnv ,IEncryptEnv  } from "./encrypt.configs";
import { cookieEnv ,ICookieEnv} from "./cookie.config";


const zodEnv = jwtEnv.merge(dbEnv).merge(emailEnv).merge(serverEnv).merge(encryptEnv).merge(cookieEnv)


declare global {
  namespace NodeJS {
    interface ProcessEnv extends IJwtEnv , IDbEnv , IEmailEnv , IServerEnv, IEncryptEnv ,ICookieEnv {}
  }
}

const {success,data : validatedEnv,error} = zodEnv.safeParse(process.env,{})

if (!success) {
  console.log(error.errors.map(
    (errorDetail) => ({
      message: errorDetail.message,
      status: errorDetail.code,
      path: errorDetail.path
    })
  ))
  throw new Error(
    `Environment variable validation error:`
  );

}

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
      // cookie_name: string;
    };
    refresh_token: {
      secret: string;
      expire: string;
      // cookie_name: string;
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
  db: PoolOptions;
  email: {
    client_id: string;
    client_secret: string;
    redirect_uris: string;
    refresh_token: string;
  };
}

const appConfig: IAppConfig = {
  node_env: validatedEnv.NODE_ENV,
  server: {
    ip: validatedEnv.SERVER_IP,
    port: validatedEnv.SERVER_PORT,
    manager_port: validatedEnv.MANAGER_PORT,
  },
  jwt: {
    access_token: {
      secret: validatedEnv.ACCESS_TOKEN_SECRET,
      expire: validatedEnv.ACCESS_TOKEN_EXPIRE,
      // cookie_name: validatedEnv.ACCESS_TOKEN_COOKIE_NAME,
    },
    refresh_token: {
      secret: validatedEnv.REFRESH_TOKEN_SECRET,
      expire: validatedEnv.REFRESH_TOKEN_EXPIRE,
      // cookie_name: validatedEnv.REFRESH_TOKEN_COOKIE_NAME,
    },
  },
  cookie: {
    access_token: {
      name: validatedEnv.COOKIE_ACCESS_TOKEN_NAME,
      max_age: validatedEnv.COOKIE_ACCESS_TOKEN_MAX_AGE,
    },
    refresh_token: {
      name: validatedEnv.COOKIE_REFRESH_TOKEN_NAME,
      max_age: validatedEnv.COOKIE_REFRESH_TOKEN_MAX_AGE,
    },
  },
  encrypt: {
    secret: validatedEnv.ENCRYPT_SECRET_KEY,
    salt: validatedEnv.ENCRYPT_SALT,
  },
  db: {
    host: validatedEnv.DB_HOST,
    port: validatedEnv.DB_PORT,
    user: validatedEnv.DB_USER,
    password: validatedEnv.DB_PASSWORD,
    database: validatedEnv.DB_DATABASE,
    waitForConnections: validatedEnv.DB_WAIT_FOR_CONNECTIONS,
    connectionLimit: validatedEnv.DB_CONNECTION_LIMIT,
    maxIdle: validatedEnv.DB_MAX_IDLE,
    idleTimeout: validatedEnv.DB_IDLE_TIMEOUT,
    queueLimit: validatedEnv.DB_QUEUE_LIMIT,
    enableKeepAlive: validatedEnv.DB_ENABLE_KEEP_ALIVE,
    keepAliveInitialDelay: validatedEnv.DB_KEEP_ALIVE_INITIAL_DELAY,
  },
  email: {
    client_id: validatedEnv.EMAIL_CLIENT_ID,
    client_secret: validatedEnv.EMAIL_CLIENT_SECRET,
    redirect_uris: validatedEnv.EMAIL_REDIRECT_URIS,
    refresh_token: validatedEnv.EMAIL_REFRESH_TOKEN,
  },
};

  // email: {
  //   smtp: {
  //     host: validatedEnv.SMTP_HOST,
  //     port: validatedEnv.SMTP_PORT,
  //     auth: {
  //       username: validatedEnv.SMTP_USERNAME,
  //       password: validatedEnv.SMTP_PASSWORD
  //     }
  //   },
  //   from: validatedEnv.EMAIL_FROM
  // },
  // cors: {
  //   cors_origin: validatedEnv.CORS_ORIGIN
  // },

console.log(appConfig);
export { appConfig };


