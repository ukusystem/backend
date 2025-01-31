export interface Personal {
  p_id: number;
  p_uuid: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dni: string;
  c_id: number;
  co_id: number;
  foto: string;
  correo: string;
  activo: number;
  representante: 1 | 0;
}
