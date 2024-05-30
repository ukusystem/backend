import { Router } from "express";
import { getControladores} from "../controllers/init";


export const initRoutes = Router();

//Controladores GET /api/v1/app/controlador
initRoutes.get("/app/controlador", getControladores);
