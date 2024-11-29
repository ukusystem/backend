import z from 'zod';

export const paginationContrataSchema = z.object({
  limit: z.optional(z.coerce.number({ required_error: "'limit' es requerido", invalid_type_error: "'limit' debe ser un numero" }).int("'limit' debe ser un numero entero").nonnegative("'limit' debe ser un numero no negativo")),
  offset: z.optional(z.coerce.number({ required_error: "'offset' es requerido", invalid_type_error: "'offset' debe ser un numero" }).int("'offset' debe ser un numero entero").nonnegative("'limit' debe ser un numero no negativo")),
});
