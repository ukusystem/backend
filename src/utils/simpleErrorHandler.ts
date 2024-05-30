import { CustomError } from "./CustomError";
export const handleErrorWithArgument = <T, U>(handler: (arg: U) => Promise<T>, logMessage?:string) => 
  async (arg: U ): Promise<T> => {
    try {
      return await handler(arg);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error en ${logMessage} : ${error.message}`);
        if("code" in error){
          if(error.code == "ER_BAD_DB_ERROR"){
            const errBadDb = new CustomError(
              `El controlador no está disponible en el servidor.`,
              404,
              "Not Found"
            );
            
            throw errBadDb

          }
        }
      } else {
        console.error(`Error inesperado en ${logMessage} : ${error}`);
      }
      throw error;
    }
  };

export const handleErrorWithoutArgument = <T>(handler: () => Promise<T>, logMessage?:string) => 
  async (): Promise<T> => {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error en ${logMessage} : ${error.message}`);
      } else {
        console.error(`Error inesperado en ${logMessage} : ${error}`);
      }
      throw error;
    }
  };

// export const combinedErrorHandler = <T, U>(
//     handler: U extends undefined ? () => Promise<T> : (arg: U) => Promise<T>,
//     logMessage?: string
//   ) => async (arg?: U): Promise<T> => {
//     try {
//       return await (arg !== undefined ? (handler as (arg: U) => Promise<T>)(arg) : (handler as () => Promise<T>)());
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error(`Error en ${logMessage} : ${error.message}`);
//       } else {
//         console.error(`Error inesperado en ${logMessage} : ${error}`);
//       }
//       throw error;
//     }
//   };


export const simpleErrorHandler = <T, U>(
  handler: (arg: U) => Promise<T>,
  logMessage?: string
) => async (arg?: U extends undefined ? undefined : U): Promise<T> => {
  try {
    return await handler(arg as U);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error en ${logMessage} : ${error.message}`);
    } else {
      console.error(`Error inesperado en ${logMessage} : ${error}`);
    }
    throw error;
  }
};
