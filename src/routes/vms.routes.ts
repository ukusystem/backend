import { Router } from "express";
import { auth, userRolCheck } from "../middlewares/auth.middleware";
import { validateRequestData } from "../middlewares/validator.middleware";
import { getPreferencias, createPreferencia,updatePreferencia, deletePreferencia} from "../controllers/vms";
import { createPreferenciaSchema, updatePreferenciaSchema,deletePreferenciaSchema} from "../schemas/vms";

export const vmsRoutes = Router();

// getPreferencias GET "/vms/preferencia"
vmsRoutes.get("/vms/preferencia",auth,userRolCheck(["Administrador","Usuario"]),getPreferencias)

// CrearPreferencia POST "/vms/preferencia"
vmsRoutes.post("/vms/preferencia",auth,userRolCheck(["Administrador","Usuario"]),validateRequestData(createPreferenciaSchema,{hasBody:true}),createPreferencia)

// UpdatePreferencia PUT "/vms/preferencia"
vmsRoutes.put("/vms/preferencia",auth,userRolCheck(["Administrador","Usuario"]),validateRequestData(updatePreferenciaSchema,{hasBody:true}), updatePreferencia)

// DeletePreferencia DELETE "/vms/preferencia/:xprfvms_id"
vmsRoutes.delete("/vms/preferencia/:xprfvms_id",auth,userRolCheck(["Administrador","Usuario"]),validateRequestData(deletePreferenciaSchema,{hasParam:true}),deletePreferencia)
