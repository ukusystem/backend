import { Router } from "express";
import { getCamerasInfo, getControladorInfo, getEquipoEntradaDisponible, getEquipoSalidaDisponible, getEquiposEntrada, getEquiposSalida } from "../controllers/smartmap";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { getCamarasInfoSchema, getControladorInfoSchema, getEquipoEntradaDisponibleSchema, getEquipoEntradaSchema, getEquipoSalidaDisponibleSchema, getEquipoSalidaSchema } from "../schemas/smartmap";

export const smartMapRoutes = Router();

// ControladorInfo GET "/smartmap/controladorinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/controladorinfo/:xctrl_id", requestDataValidator({paramSchema:getControladorInfoSchema},{hasParam:true}), getControladorInfo);

// CamarasInfo GET "/smartmap/camarasinfo/:xctrl_id"
smartMapRoutes.get("/smartmap/camarasinfo/:xctrl_id", requestDataValidator({paramSchema:getCamarasInfoSchema},{hasParam:true}),getCamerasInfo)

// EquiposEntradaDisponible GET "/smartmap/equiposentrada/:xctrl_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id", requestDataValidator({paramSchema:getEquipoEntradaDisponibleSchema},{hasParam:true}), getEquipoEntradaDisponible)

// EquiposEntrada GET "/smartmap/equiposentrada/:xctrl_id/:xee_id"
smartMapRoutes.get("/smartmap/equiposentrada/:xctrl_id/:xee_id",requestDataValidator({paramSchema:getEquipoEntradaSchema},{hasParam:true}), getEquiposEntrada)

// EquiposSalidaDisponible GET "/smartmap/equipossalida/:xctrl_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id", requestDataValidator({paramSchema:getEquipoSalidaDisponibleSchema},{hasParam:true}), getEquipoSalidaDisponible)

// EquiposSalida GET "/smartmap/equipossalida/:xctrl_id/:xes_id"
smartMapRoutes.get("/smartmap/equipossalida/:xctrl_id/:xes_id",requestDataValidator({paramSchema:getEquipoSalidaSchema},{hasParam:true}), getEquiposSalida)