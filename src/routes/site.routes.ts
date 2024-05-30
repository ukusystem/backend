import {Router} from 'express'
import { getControles, getEquiposSalida, updateControl } from '../controllers/site/control'
import { validateRequestData, validateRequestDataFinal} from '../middlewares/validator.middleware'

import { downloadArchivoCamara, getArchivoCamara } from '../controllers/site/multimedia'
import { getRegistroTemperartura, getSensoresTemperatura } from '../controllers/site/temperatura'
import { getControlesSchema, getEquiposSalidaSchema, updateControlSchema } from '../schemas/site/control'
import { getRegistroTemperaturaSchema, getSensoresTemperaturaSchema } from '../schemas/site/temperatura'
import { getArchivoCamaraSchema } from '../schemas/site/multimedia'

export const siteRoutes = Router()

// ====================== CONTROLES ======================

//  EquipoSalida GET "/site/control/:xctrl_id"
siteRoutes.get("/site/control/:xctrl_id",validateRequestData(getEquiposSalidaSchema,{hasParam:true}),getEquiposSalida)

//  Controles GET "/site/control/:xctrl_id/:xes_id"
siteRoutes.get("/site/control/:xctrl_id/:xes_id",validateRequestData(getControlesSchema,{hasParam:true}), getControles)

// UpadateControl PATCH "/site/control/update"
siteRoutes.patch("/site/control/update",validateRequestData(updateControlSchema,{hasBody:true}), updateControl)


// ====================== TEMPERATURA ======================
siteRoutes.get("/site/sensortemperatura/:xctrl_id",validateRequestData(getSensoresTemperaturaSchema,{hasParam:true}) , getSensoresTemperatura)
siteRoutes.get("/site/sensortemperatura/registros/:xctrl_id/:xst_id/:xdate",validateRequestData(getRegistroTemperaturaSchema,{hasParam:true})  , getRegistroTemperartura) // se puede mejorar date --> POST

// ====================== MULTIMEDIA ======================

// ArchivoCamaraPaths GET "/site/multimedia?ctrl_id=1&date='2024-02-13'&hour=10&tipo=0"
siteRoutes.get("/site/multimedia",validateRequestDataFinal({querySchema: getArchivoCamaraSchema},{hasQuery:true}),getArchivoCamara) 
// DownloadArchivoCamara GET "/site/multimedia/download?filePath=encodeURIComponent"
siteRoutes.get("/site/multimedia/download",downloadArchivoCamara)
