import { z } from "zod";

export const updateControlSchema = z.object({
action: z.number({required_error:"'action' es requerido",invalid_type_error:"'action' debe ser un numero"}).int("'action' debe ser un numero entero").gte(-1,"'action' debe ser mayor o igual a -1").lte(1,"'action' debe ser menor o igual a 1"),
ctrl_id: z.number({required_error:"'ctrl_id' es requerido",invalid_type_error:"'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' deber ser mayor o igual a 0"),
pin: z.number({required_error:"'pin' es requerido",invalid_type_error:"'pin' debe ser un numero"}).int("'pin' debe ser un numero entero").gte(0, "'pin' deber ser mayor o igual a 0"),
},{required_error:"Es necesario proporcionar un cuerpo en la solicitud HTTP" , invalid_type_error: "El formato del cuerpo de la solicitud HTTP no es válido."});
