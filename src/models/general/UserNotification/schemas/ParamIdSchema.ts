import z from 'zod';

export const userNotificationParamIdSchema = z.object({
  nu_id: z.coerce.number({ required_error: "'nu_id' es requerido", invalid_type_error: "'nu_id' debe ser un numero" }).int("'nu_id' debe ser un numero entero.").nonnegative("'nu_id' debe ser un numero no negativo"),
});
