import "dotenv/config";
import z from "zod";
import { IDbEnv, dbEnv } from "./db.configs";
import { jwtEnv , IJwtEnv } from "./jwt.configs";
import { emailEnv ,IEmailEnv } from "./email.configs";
import { serverEnv , IServerEnv } from "./server.configs";

const zodEnv = z.intersection(jwtEnv,dbEnv, emailEnv).and(serverEnv)


declare global {
  namespace NodeJS {
    interface ProcessEnv extends IJwtEnv , IDbEnv , IEmailEnv , IServerEnv {}
  }
}


// try {
//   zodEnv.parse(process.env);
// } catch (err) {
//   if (err instanceof z.ZodError) {
//     const { fieldErrors } = err.flatten();
//     const errorMessage = Object.entries(fieldErrors)
//       .map(([field, errors]) =>
//         errors ? `${field}: ${errors.join(", ")}` : field
//       )
//       .join("\n  ");
//     throw new Error(`Missing environment variables:\n  ${errorMessage}`);
//     //   process.exit(1)
//   }
// }

