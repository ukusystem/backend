import { z } from "zod";
// "/site/sensortemperatura/registros/:xctrl_id/:xst_id/:xdate"
export const getRegistroTemperaturaSchema = z.object({
    xctrl_id: z.coerce.number({required_error: "El controlador ID es requerido",invalid_type_error: "El controlador ID debe ser un numero",}).int("El controlador ID debe ser un numero entero").gte(0, "El controlador ID debe ser mayor o igual a 0"),
    xst_id: z.coerce.number({required_error: "El sensor temperatura ID es requerido",invalid_type_error: "El sensor temperatura ID debe ser un numero",}).int("El sensor temperatura ID debe ser un numero entero").gte(0, "El sensor temperatura ID debe ser mayor o igual a 0"),
    xdate: z.coerce.date({required_error:"Fecha es requerido", invalid_type_error:"No es un tipo fecha"})
});
