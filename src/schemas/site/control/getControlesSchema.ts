import { z } from "zod";

export const getControlesSchema = z.object({
    xctrl_id: z.coerce.number({required_error: "El controlador ID es requerido",invalid_type_error: "El controlador ID debe ser un numero",}).int("El controlador ID debe ser un numero entero").gte(0, "El controlador ID debe ser mayor o igual a 0"),
    xes_id: z.coerce.number({required_error: "El equipo de salida ID es requerido",invalid_type_error: "El equipo de salida ID debe ser un numero",}).int("El equipo de salida ID debe ser un numero entero").gte(0, "El equipo de salida ID debe ser mayor o igual a 0"), 
});

