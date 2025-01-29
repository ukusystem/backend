import z from 'zod';

export const updateAccesoBodySchema = z.object({
  serie: z.optional(z.number({ required_error: "'serie' es requerido", invalid_type_error: "'serie' debe ser un numero" }).int("'serie' debe ser un numero entero").gt(0, "'serie' deber ser mayor a 0")),
  administrador: z.optional(z.number({ required_error: "'administrador' es requerido", invalid_type_error: "'administrador' debe ser un numero" }).int("'administrador' debe ser un numero entero").min(0, "'administrador' minimo valor es 0").max(1, "'administrador' maximo valor es 1")),
  p_id: z.optional(z.number({ required_error: "'p_id' es requerido", invalid_type_error: "'p_id' debe ser un numero" }).int("'p_id' debe ser un numero entero").gt(0, "'p_id' deber ser mayor a 0")),
  ea_id: z.optional(z.number({ required_error: "'ea_id' es requerido", invalid_type_error: "'ea_id' debe ser un numero" }).int("'ea_id' debe ser un numero entero").gt(0, "'ea_id' deber ser mayor a 0")),
});

export const updateAccesoParamSchema = z.object({
  a_id: z.coerce.number({ required_error: "'a_id' es requerido", invalid_type_error: "'a_id' debe ser un numero" }).int("'a_id' debe ser un numero entero").gt(0, "'a_id' deber ser mayor a 0"),
});
