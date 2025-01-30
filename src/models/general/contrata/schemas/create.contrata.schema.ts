import z from 'zod';

export const createContrataSchema = z.object({
  r_id: z.number({ required_error: "'r_id' es requerido", invalid_type_error: "'r_id' debe ser un numero" }).int("'r_id' debe ser un numero entero").gt(0, "'r_id' deber ser mayor a 0"),
  contrata: z.string({ required_error: "'contrata' es requerido.", invalid_type_error: "'contrata' debe ser un texto." }).max(100, "'contrata' no puede tener más de 100 caracteres."),
  descripcion: z.string({ required_error: "'descripcion' es requerido.", invalid_type_error: "'descripcion' debe ser un texto." }).max(100, "'descripcion' no puede tener más de 100 caracteres."),
  // ctrl_id: number;
  ctrl_id: z.number({ required_error: "'ctrl_id' es requerido", invalid_type_error: "'ctrl_id' debe ser un numero" }).int("'ctrl_id' debe ser un numero entero").gt(0, "'ctrl_id' deber ser mayor a 0"),
  // direccion: string;
  direccion: z.string({ required_error: "'direccion' es requerido.", invalid_type_error: "'direccion' debe ser un texto." }).max(30, "'direccion' no puede tener más de 30 caracteres."),
  // telefono: string;
  telefono: z.string({ required_error: "'telefono' es requerido.", invalid_type_error: "'telefono' debe ser un texto." }).regex(/^\d{9,20}$/, "'telefono' incorrecto , debe tener entre 9 y 20 caracteres."),
  // correo: string;
  correo: z
    .string({ required_error: "'correo' es requerido", invalid_type_error: "'correo' debe ser un texto" })
    .regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, "'correo' incorrecto.")
    .max(100, "'correo' no puede tener mas de 100 caracteres."),
});

export type CreateContrataBody = z.infer<typeof createContrataSchema>;
