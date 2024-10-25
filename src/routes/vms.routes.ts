import { Router } from "express";
import { userRolCheck,authenticate } from "../middlewares/auth.middleware";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { getPreferencias, createPreferencia,updatePreferencia, deletePreferencia, trimRecordNvr, getPlayListNvr, getSegmentNvr} from "../controllers/vms";
import { createPreferenciaSchema, updatePreferenciaSchema,deletePreferenciaSchema, trimRecordSchema, nvrSchema} from "../schemas/vms";

export const vmsRoutes = Router();

// getPreferencias GET "/vms/preferencia"
vmsRoutes.get("/vms/preferencia",authenticate,userRolCheck(["Administrador","Usuario"]),getPreferencias)

// CrearPreferencia POST "/vms/preferencia"
vmsRoutes.post("/vms/preferencia",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({bodySchema:createPreferenciaSchema},{hasBody:true}),createPreferencia)

// UpdatePreferencia PUT "/vms/preferencia"
vmsRoutes.put("/vms/preferencia",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({bodySchema:updatePreferenciaSchema},{hasBody:true}), updatePreferencia)

// DeletePreferencia DELETE "/vms/preferencia/:xprfvms_id"
vmsRoutes.delete("/vms/preferencia/:xprfvms_id",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({paramSchema:deletePreferenciaSchema},{hasParam:true}),deletePreferencia)

// TrimRecordNvr GET /vms/trimrecord?ctrl_id=number&cmr_id=number&date=string&startTime=string&endTime=string
vmsRoutes.get("/vms/trimrecord",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({querySchema:trimRecordSchema},{hasQuery:true}),trimRecordNvr)

// PlayList GET /vms/:ctrl_id/:cmr_id/:date/index.m3u8
vmsRoutes.get("/vms/:ctrl_id/:cmr_id/:date/index.m3u8",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({paramSchema:nvrSchema},{hasParam:true}),getPlayListNvr);

// Segment GET /vms/:ctrl_id/:cmr_id/:date/record/:segment_name
vmsRoutes.get("/vms/:ctrl_id/:cmr_id/:date/record/:segment_name",authenticate,userRolCheck(["Administrador","Usuario"]),requestDataValidator({paramSchema:nvrSchema},{hasParam:true}),getSegmentNvr);
