import { Router } from "express";
import { getCamerasInfo, getControladorInfo, getEquipoEntradaDisponible, getEquipoSalidaDisponible, getEquiposEntrada, getEquiposSalida } from "../controllers/smartmap";
import { validateRequestData } from "../middlewares/validator.middleware";
import { getCamarasInfoSchema, getControladorInfoSchema, getEquipoEntradaDisponibleSchema, getEquipoEntradaSchema, getEquipoSalidaDisponibleSchema, getEquipoSalidaSchema } from "../schemas/smartmap";

export const smartMapRoutes = Router();

// ControladorInfo GET "/smartmap/controladorinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/controladorinfo/:xctrl_id", validateRequestData(getControladorInfoSchema,{hasParam:true}), getControladorInfo);

// CamarasInfo GET "/smartmap/camarasinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/camarasinfo/:xctrl_id", validateRequestData(getCamarasInfoSchema,{hasParam:true}),getCamerasInfo)

// EquiposEntradaDisponible GET "/smartmap/equiposentrada/:xctrl_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id", validateRequestData(getEquipoEntradaDisponibleSchema,{hasParam:true}), getEquipoEntradaDisponible)

// EquiposEntrada GET "/smartmap/equiposentrada/:xctrl_id/:xee_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id/:xee_id",validateRequestData(getEquipoEntradaSchema,{hasParam:true}), getEquiposEntrada)

// EquiposSalidaDisponible GET "/smartmap/equipossalida/:xctrl_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id", validateRequestData(getEquipoSalidaDisponibleSchema,{hasParam:true}), getEquipoSalidaDisponible)

// EquiposSalida GET "/smartmap/equipossalida/:xctrl_id/:xes_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id/:xes_id",validateRequestData(getEquipoSalidaSchema,{hasParam:true}), getEquiposSalida)