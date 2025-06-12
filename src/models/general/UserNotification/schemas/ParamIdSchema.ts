import z from 'zod';

export const userNotificationParamIdSchema = z.object({
  n_uuid: z
    .string({
      required_error: "'n_uuid' es obligatorio",
      invalid_type_error: "'n_uuid' debe ser una cadena de texto",
    })
    .uuid({ message: "'n_uuid' no es un identificador válido" }),
});
