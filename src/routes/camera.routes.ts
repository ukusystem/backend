import {Router} from 'express'
import { cameraController } from '../controllers/camera';

export const cameraRoutes = Router();

// Control  GET /camera/control/:xctrl_id/:xip/:xaction/:xmovement/:xvelocity
cameraRoutes.get("/camera/control/:xctrl_id/:xip/:xaction/:xmovement/:xvelocity", cameraController.getControlOnvif)

// PresetFunction GET /camera/preset/:xctrl_id/:xip/:xnum_preset
cameraRoutes.get("/camera/preset/:xctrl_id/:xip/:xnum_preset", cameraController.getPresetOnvif)

//Snapshot GET /camera/snapshot/:xctrl_id/:xip
cameraRoutes.get("/camera/snapshot/:xctrl_id/:xip", cameraController.getSnapshot)

// All Cameras GET /cameras
cameraRoutes.get("/cameras", cameraController.getAllCameras)

// CamarasPorCtrlID GET /camera/:xctrl_id
cameraRoutes.get("/camera/:xctrl_id", cameraController.getCameraByCtrlId)



