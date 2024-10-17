import {Router} from 'express'
import { cameraController } from '../controllers/camera';
import { authenticate } from '../middlewares/auth.middleware';
import { requestDataValidator } from '../middlewares/validator.middleware';
import { cameraControlSchema, cameraPresetSchema, cameraSnapshotSchema } from '../schemas/camera';

export const cameraRoutes = Router();

// Control  GET /camera/control/:xctrl_id/:xip/:xaction/:xmovement/:xvelocity
// cameraRoutes.get("/camera/control/:xctrl_id/:xip/:xaction/:xmovement/:xvelocity",authenticate, cameraController.getControlOnvif)

// Control  GET /camera/control?ctrl_id=number&cmr_id=number&action=start&movement=Right&velocity=0.5
cameraRoutes.get("/camera/control",authenticate,requestDataValidator({querySchema:cameraControlSchema},{hasQuery:true}), cameraController.getControlOnvif)

// PresetFunction GET /camera/preset/:xctrl_id/:xip/:xnum_preset
// cameraRoutes.get("/camera/preset/:xctrl_id/:xip/:xnum_preset",authenticate, cameraController.getPresetOnvif)

// PresetFunction GET /camera/preset?ctrl_id=number&cmr_id=number&preset=number
cameraRoutes.get("/camera/preset",authenticate,requestDataValidator({querySchema:cameraPresetSchema},{hasQuery:true}), cameraController.getPresetOnvif)

//Snapshot GET /camera/snapshot/:xctrl_id/:xip
// cameraRoutes.get("/camera/snapshot/:xctrl_id/:xip",authenticate, cameraController.getSnapshot)

//Snapshot GET /camera/snapshot?ctrl_id=number&cmr_id=number
cameraRoutes.get("/camera/snapshot",authenticate,requestDataValidator({querySchema:cameraSnapshotSchema},{hasQuery:true}), cameraController.getSnapshot)

// All Cameras GET /cameras
cameraRoutes.get("/cameras",authenticate, cameraController.getAllCameras)

// CamarasPorCtrlID GET /camera/:xctrl_id
cameraRoutes.get("/camera/:xctrl_id",authenticate,cameraController.getCameraByCtrlId)



