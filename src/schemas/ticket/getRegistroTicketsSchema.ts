import z from 'zod'

export const getRegistroTicketsSchema = z.object({
    ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
    limit: z.optional(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero",}).int("'limit' debe ser un numero entero").gte(0, "'limit' debe ser mayor o igual a 0").lte(100,"'limit' debe ser menor o igual a 100")),
    offset:z.optional( z.coerce.number({required_error: "'offset' es requerido",invalid_type_error: "'offset' debe ser un numero",}).int("'offset' debe ser un numero entero").gte(0, "'offset' debe ser mayor o igual a 0")),
},{required_error:"Se requiere incluir el campo 'ctrl_id' en los query params de la consulta"})