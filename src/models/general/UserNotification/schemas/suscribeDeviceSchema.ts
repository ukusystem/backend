import z from 'zod';

export const suscribeDeviceSchema = z.object({
  fcmToken: z.string({
    required_error: "'fcmToken' es obligatorio",
    invalid_type_error: "'fcmToken' debe ser una cadena de texto",
  }),
});
