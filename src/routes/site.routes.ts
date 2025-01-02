import {Router} from 'express'
import { requestDataValidator} from '../middlewares/validator.middleware'

import { downloadArchivoCamara, getArchivoCamara } from '../controllers/site/multimedia'
import { getRegistroTemperartura } from '../controllers/site/temperatura'
import { getRegistroTemperaturaSchema } from '../schemas/site/temperatura'
import { getArchivoCamaraSchema } from '../schemas/site/multimedia'
import { authenticate } from '../middlewares/auth.middleware'

export const siteRoutes = Router()

// ====================== CONTROLES ======================

// ====================== TEMPERATURA ======================
siteRoutes.get("/site/sensortemperatura/registros",authenticate,requestDataValidator({querySchema: getRegistroTemperaturaSchema},{hasQuery:true})  , getRegistroTemperartura)

// ====================== MULTIMEDIA ======================

// ArchivoCamaraPaths GET "/site/multimedia?ctrl_id=1&date='2024-02-13'&hour=10&tipo=0"
siteRoutes.get("/site/multimedia",authenticate,requestDataValidator({querySchema: getArchivoCamaraSchema},{hasQuery:true}),getArchivoCamara) 
// DownloadArchivoCamara GET "/site/multimedia/download?filePath=encodeURIComponent"
siteRoutes.get("/site/multimedia/download",authenticate,downloadArchivoCamara)
