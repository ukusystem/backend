import { Request, Response, NextFunction } from "express";
import multer, { Options ,Field } from "multer";
import { join } from "path";
import fs from "fs";
import { CustomError } from "../utils/CustomError";

// import mime from 'mime';
// import filetype from 'file-type'

export interface GeneralMulterMiddlewareArgs {
  allowedMimeTypes: string[];
  limits: Options["limits"];
  fields: Field[]
  bodyFields?: string[]
}

export interface RequestMulterMiddleware extends Request {
  [key : string] : any 
}


export const GeneralMulterMiddleware = (args: GeneralMulterMiddlewareArgs) => {
  const {allowedMimeTypes,bodyFields,fields ,limits} = args

  // Validar los MimeTypes:
  
  // allowedMimeTypes.forEach((mimeItem)=>{
  //   const extFile = mime.getExtension(mimeItem)
  //   if(!extFile){
  //     throw new Error("Se produjo un error al configurar GeneralMulterMiddleware. Asegurese de ingresar los mimetypes correctos.")
  //   }
  // })

  // Configurar el lugar de almacenamiento temporal y el nombre de archivo:
  const storageMulter = multer.diskStorage({
    destination: async (_req, _file, cb) => {
      const dirDestination = join(__dirname, `../../archivos/temporal`);

      if (!fs.existsSync(dirDestination)) {
        fs.mkdirSync(dirDestination, { recursive: true });
      }

      cb(null, dirDestination);
    },
    filename: (_req, file, cb) => {
      const fileName = Date.now() + "-" + file.originalname;
      cb(null, fileName);
    },
  });
  
  // Configurar los limits:
  const limitsMulter = limits;

  //Configurar file filter:
  const fileFilterMulter: Options["fileFilter"] = (req, file, cb) => {
    // Tipos permitidos
    const allowedTypes = allowedMimeTypes;
    // Verificar tipos 
    if (allowedTypes.includes(file.mimetype)) {
      // Aceptar archivo:
      cb(null, true);
    } else {
      //Rechazar archivo:
      // cb(null, false);
      
      // Error customizado

      // const test = allowedMimeTypes.map((type)=>{
      //   const extensionFile = mime.getExtension(type);
      // })

      const errType = new CustomError(`Los tipos de archivo admitidos son: ${allowedMimeTypes.join(" , ")}`,400,"Tipo de archivo no permitido.");
      cb(errType);
    }
  };

  // Crear un instancia de multer:
  const upload = multer({ storage: storageMulter, limits: limitsMulter, fileFilter: fileFilterMulter}).fields(fields);

 
  return (req: RequestMulterMiddleware , res: Response, next: NextFunction) => {

    // Usar instancia de multer
    upload(req, res, (err) => {

      // Manejar errores de multer:
      if (err instanceof multer.MulterError) {
        if (err.code == "LIMIT_FILE_COUNT") {
          let filesPermitedCount = limitsMulter?.files ?? 'no_especificado';
          if(req.files) deleteTemporalFiles(req.files) // limpiar
          return res.status(400).json({error: "Límite maximo archivos",message: `El límite máximo de archivos permitidos son: ${filesPermitedCount}`,});
        } else if (err.code == "LIMIT_UNEXPECTED_FILE") {
          let formDataFieldPermited = fields.map((fieldItem)=>(fieldItem.name))
          if(req.files) deleteTemporalFiles(req.files) // limpiar
          return res.status(400).json({error: `Campo '${err.field}' inesperado.`,message: `Los keys permitidos para cargar archivos en el form-data son: ${formDataFieldPermited.join(' , ')}`,});
        } else if (err.code == "LIMIT_FILE_SIZE") {
          let limitFileSizePermited = limitsMulter?.fileSize ?? 'no_especificado'
          if(req.files) deleteTemporalFiles(req.files) // limpiar
          return res.status(400).json({  error: "Límite tamaño de archivo",  message: `El tamaño máximo permitido por archivo es: ${limitFileSizePermited}`,});
        }
        if(req.files) deleteTemporalFiles(req.files) // limpiar
        return res.status(400).json({ error: err.code, message: err.message });
      } else if (err instanceof CustomError) {
        // Manejar un error customizado durante la carga.
        if(req.files) deleteTemporalFiles(req.files) // limpiar
        return res.status(err.statusCode).json({ error: err.errorType, message: err.message });
      } else if (err instanceof Error) {
        // Manejar un error desconocido durante la carga.
        if(req.files) deleteTemporalFiles(req.files) // limpiar
        return res.status(400).json({ error: "No conocido", message: err.message });
      } else if (err) {
        // Manejar un error desconocido durante la carga.
        if(req.files) deleteTemporalFiles(req.files) // limpiar
        return res.status(400).json({ error: "No conocido", message: "Ocurrio un error insperado.",});
      }

      //Comprobar los fields del req.body:
      if(bodyFields){
        const reqKeys = Object.keys(req.body)
        const includeAllBodyKeys = bodyFields.every(elemento => reqKeys.includes(elemento))

        if(!includeAllBodyKeys){
          if(req.files) deleteTemporalFiles(req.files) // limpiar
          return res.status(400).json({ error: "No se han proporcionado los campos requeridos.", message: `Los campos válidos para enviar datos que no sean archivos en el formulario son:${bodyFields.join(" , ")}`,});
        }
      }

      req.body = req.body // para req.body( text, json) al siguiente controlador
      req.files = req.files // pasar files(archivos cargados) al siguiente controlador

      next()

    });

  }
};


export const deleteTemporalFiles =  (files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]) => {
  try {
    if (Array.isArray(files)) {
      for (const file of files) {
        fs.unlinkSync(file.path);
        console.log(`Archivo temporal ${file.filename} eliminado`);
      }
      console.log("Todos los archivos temporales han sido eliminados correctamente");
    } else {
      for (const fieldname in files) {
        for (const file of files[fieldname]) {
          fs.unlinkSync(file.path);
          console.log(`Archivo temporal ${file.filename} eliminado`);
        }
      }
      console.log("Todos los archivos temporales han sido eliminados correctamente");
    }
  } catch (error) {
    console.error("Error al eliminar archivos temporales:", error);
  }
};

