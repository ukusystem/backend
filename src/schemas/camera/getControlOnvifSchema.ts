import z from 'zod'

export const getControlOnvifSchema = z.object({
    action: z.union([z.literal("start"),z.literal("stop")],{errorMap:()=>{return {message: "La acción especificada no es válida. Solo se permiten los valores 'start' o 'stop'."}}}),
    movement: z.union([z.literal("Right"), z.literal("RightDown"), z.literal("Down"), z.literal("LeftDown"), z.literal("Left"), z.literal("LeftUp"), z.literal("Up"), z.literal("RightUp"),z.literal("ZoomTele"),
    z.literal("ZoomWide")],{errorMap:()=>{return {message:"El tipo de movimiento proporcionado no es válido. Asegúrese de ingresar uno correcto."}}}),
    velocity: z.number({required_error:"'velocity' es requerido",invalid_type_error:"'velocity' debe ser un numero"}).gte(0, "'velocity' debe ser mayor o igual a 0").lte(1,"'velocity' deber ser menor o igual a 1"),
    ip: z.string({required_error: "'ip' es requerido",invalid_type_error: "'ip' debe ser un string",}).ip({message:"'ip' invalido"}),
    ctrl_id: z.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero",}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")
})
 
