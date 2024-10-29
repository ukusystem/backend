import { Router } from "express";
import { getCamerasInfo, getControladorInfo, getEquipoEntradaDisponible, getEquipoSalidaDisponible, getEquiposEntrada, getEquiposSalida } from "../controllers/smartmap";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { getCamarasInfoSchema, getControladorInfoSchema, getEquipoEntradaDisponibleSchema, getEquipoEntradaSchema, getEquipoSalidaDisponibleSchema, getEquipoSalidaSchema } from "../schemas/smartmap";
import { authenticate } from "../middlewares/auth.middleware";

export const smartMapRoutes = Router();

// ControladorInfo GET "/smartmap/controladorinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/controladorinfo/:xctrl_id",authenticate, requestDataValidator({paramSchema:getControladorInfoSchema},{hasParam:true}), getControladorInfo);

// CamarasInfo GET "/smartmap/camarasinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/camarasinfo/:xctrl_id",authenticate, requestDataValidator({paramSchema:getCamarasInfoSchema},{hasParam:true}),getCamerasInfo)

// EquiposEntradaDisponible GET "/smartmap/equiposentrada/:xctrl_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id",authenticate, requestDataValidator({paramSchema:getEquipoEntradaDisponibleSchema},{hasParam:true}), getEquipoEntradaDisponible)

// EquiposEntrada GET "/smartmap/equiposentrada/:xctrl_id/:xee_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id/:xee_id",authenticate,requestDataValidator({paramSchema:getEquipoEntradaSchema},{hasParam:true}), getEquiposEntrada)

// EquiposSalidaDisponible GET "/smartmap/equipossalida/:xctrl_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id",authenticate, requestDataValidator({paramSchema:getEquipoSalidaDisponibleSchema},{hasParam:true}), getEquipoSalidaDisponible)

// EquiposSalida GET "/smartmap/equipossalida/:xctrl_id/:xes_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id/:xes_id",authenticate,requestDataValidator({paramSchema:getEquipoSalidaSchema},{hasParam:true}), getEquiposSalida)