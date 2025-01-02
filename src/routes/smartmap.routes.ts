import { Router } from 'express';
import { getCamerasInfo, getItemContoller, getEquipoEntradaDisponible, getEquipoSalidaDisponible, getEquiposEntrada, getEquiposSalida } from '../controllers/smartmap';
import { requestDataValidator, requestValidator } from '../middlewares/validator.middleware';
import { getCamarasInfoSchema, getEquipoEntradaDisponibleSchema, getEquipoEntradaSchema, getEquipoSalidaDisponibleSchema, getEquipoSalidaSchema, smartmapCtrlParamSchema } from '../schemas/smartmap';
import { authenticate } from '../middlewares/auth.middleware';
import { getListControllers } from '../controllers/smartmap/getListControladores';

export const smartMapRoutes = Router();

// List Controllers GET "/smartmap/controladores"
smartMapRoutes.get('/smartmap/controladores', authenticate, getListControllers);
// Item Controllere GET "/smartmap/controladores/:ctrl_id"
smartMapRoutes.get('/smartmap/controladores/:ctrl_id', authenticate, requestValidator({ params: smartmapCtrlParamSchema }), getItemContoller);

// CamarasInfo GET "/smartmap/camarasinfo/:xctrl_id"
smartMapRoutes.get('/smartmap/camarasinfo/:xctrl_id', authenticate, requestDataValidator({ paramSchema: getCamarasInfoSchema }, { hasParam: true }), getCamerasInfo);

// EquiposEntradaDisponible GET "/smartmap/equiposentrada/:xctrl_id"
smartMapRoutes.get('/smartmap/equiposentrada/:xctrl_id', authenticate, requestDataValidator({ paramSchema: getEquipoEntradaDisponibleSchema }, { hasParam: true }), getEquipoEntradaDisponible);

// EquiposEntrada GET "/smartmap/equiposentrada/:xctrl_id/:xee_id"
smartMapRoutes.get('/smartmap/equiposentrada/:xctrl_id/:xee_id', authenticate, requestDataValidator({ paramSchema: getEquipoEntradaSchema }, { hasParam: true }), getEquiposEntrada);

// EquiposSalidaDisponible GET "/smartmap/equipossalida/:xctrl_id"
smartMapRoutes.get('/smartmap/equipossalida/:xctrl_id', authenticate, requestDataValidator({ paramSchema: getEquipoSalidaDisponibleSchema }, { hasParam: true }), getEquipoSalidaDisponible);

// EquiposSalida GET "/smartmap/equipossalida/:xctrl_id/:xes_id"
smartMapRoutes.get('/smartmap/equipossalida/:xctrl_id/:xes_id', authenticate, requestDataValidator({ paramSchema: getEquipoSalidaSchema }, { hasParam: true }), getEquiposSalida);
