import dayjs, { Dayjs } from 'dayjs';
import { MySQL2 } from '../../database/mysql';
import { RowDataPacket } from 'mysql2';

export enum PaginationAction {
  Next = 'next',
  Prev = 'prev',
  Lim = 'lim',
  Init = 'init',
}

export enum RegisterType {
  Acceso = 'acceso',
  Energia = 'energia',
  Entrada = 'entrada',
  EstadoCamara = 'estadocamara',
  MicroSD = 'microsd',
  Peticion = 'peticion',
  Salida = 'salida',
  Seguridad = 'seguridad',
  Temperatura = 'temperatura',
  Ticket = 'ticket',
}

interface ConfigProps {
  has_partition: boolean;
  table_name: string;
  table_name_alias: string;
  table_columns: string[];
  result_columns?: string[];
  order_by: string;
  cursor_by: string;
  datetime_field_filter: string;
  query: {
    select_clause: string;
    from_clause: (ctrl_id: number, partitioning?: string) => string;
    join_clause: (ctrl_id: number) => string;
    // where_clause: (relational_operator: string, start_date: string, end_date: string, cursor?: number) => string;
    // orderby_clause: (ordenation: string, cursor?: number) => string;
  };
}

// reemplazar algunos metodos
export const RegisterConfigOptions: { [key in RegisterType]: ConfigProps } = {
  acceso: {
    has_partition: false,
    table_name: 'registroacceso',
    table_name_alias: 'ra',
    table_columns: ['ra_id', 'serie', 'administrador', 'autorizacion', 'fecha', 'p_id', 'ea_id', 'tipo', 'sn_id'],
    result_columns: ['id', 'serie', 'administrador', 'autorizacion', 'fecha', 'personal', 'equipoacceso', 'tipo'],
    order_by: 'ra_id',
    cursor_by: 'ra_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT ra.ra_id AS id, ra.serie, CASE ra.administrador WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS administrador, CASE ra.autorizacion WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS autorizacion, ra.fecha, IFNULL(CONCAT(p.nombre, ' ', p.apellido), 'No identificado') AS personal, IFNULL(ea.nombre, 'No identificado') AS equipoacceso, CASE ra.tipo WHEN 1 THEN 'Entrada' WHEN 0 THEN 'Salida' ELSE 'Desconocido' END AS tipo`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroacceso ${partitioning} ra`;
        }
        return `FROM nodo${ctrl_id}.registroacceso ra`;
      },
      join_clause: () => `LEFT JOIN general.personal p ON ra.p_id = p.p_id LEFT JOIN general.equipoacceso ea ON ra.ea_id = ea.ea_id`,
      // where_clause: function (relational_operator: string, start_date: string, end_date: string, cursor?: number): string {
      //   if (cursor) {
      //     return `WHERE ra.ra_id ${relational_operator} ${cursor} AND ra.fecha BETWEEN '${start_date}' AND '${end_date}'`;
      //   }

      //   return `WHERE ra.fecha BETWEEN '${start_date}' AND '${end_date}'`;
      // },
      // orderby_clause: function (ordenation: string, cursor?: number): string {
      //   return `ORDER BY ra.ra_id ${cursor === undefined ? 'DESC' : ordenation}`;
      // },
    },
  },
  energia: {
    has_partition: true,
    table_name: 'registroenergia',
    table_name_alias: 're',
    table_columns: ['re_id', 'me_id', 'voltaje', 'amperaje', 'fdp', 'frecuencia', 'potenciaw', 'potenciakwh', 'fecha'],
    result_columns: ['id', 'medidor', 'voltaje', 'amperaje', 'fdp', 'frecuencia', 'potenciaw', 'potenciakwh', 'fecha'],
    order_by: 're_id',
    cursor_by: 're_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT re.re_id AS id, IFNULL( me.descripcion , 'No identificado') AS medidor, re.voltaje, re.amperaje, re.fdp, re.frecuencia, re.potenciaw, re.potenciakwh, re.fecha`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroenergia ${partitioning} re`;
        }
        return `FROM nodo${ctrl_id}.registroenergia re`;
      },
      join_clause: (ctrl_id: number) => {
        return `LEFT JOIN nodo${ctrl_id}.medidorenergia me ON re.me_id = me.me_id`;
      },
    },
  },
  entrada: {
    has_partition: true,
    table_name: 'registroentrada',
    table_name_alias: 're',
    table_columns: ['rentd_id', 'pin', 'estado', 'fecha', 'ee_id'],
    result_columns: ['id', 'pin', 'estado', 'fecha', 'detector'],
    order_by: 'rentd_id',
    cursor_by: 'rentd_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT re.rentd_id AS id, re.pin, CASE re.estado WHEN 1 THEN 'Activado' WHEN 0 THEN 'Desactivado' ELSE 'Desconocido' END AS estado, re.fecha, IFNULL( ee.detector , 'No identificado') AS detector`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroentrada ${partitioning} re`;
        }
        return `FROM nodo${ctrl_id}.registroentrada re`;
      },
      join_clause: () => `LEFT JOIN general.equipoentrada ee ON re.ee_id = ee.ee_id`,
    },
  },
  estadocamara: {
    has_partition: false,
    table_name: 'registroestadocamara',
    table_name_alias: 'rec',
    table_columns: ['rec_id', 'cmr_id', 'fecha', 'conectado'],
    result_columns: ['id', 'camara', 'fecha', 'conectado'],
    order_by: 'rec_id',
    cursor_by: 'rec_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rec.rec_id AS id, c.descripcion AS camara, rec.fecha, CASE rec.conectado WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS conectado`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroestadocamara ${partitioning} rec`;
        }
        return `FROM nodo${ctrl_id}.registroestadocamara rec`;
      },
      join_clause: (ctrl_id: number) => {
        return `INNER JOIN nodo${ctrl_id}.camara c ON rec.cmr_id = c.cmr_id`;
      },
    },
  },
  microsd: {
    has_partition: false,
    table_name: 'registromicrosd',
    table_name_alias: 'rmsd',
    table_columns: ['rmsd_id', 'fecha', 'estd_id'],
    result_columns: ['id', 'fecha', 'estado'],
    order_by: 'rmsd_id',
    cursor_by: 'rmsd_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rmsd.rmsd_id AS id, rmsd.fecha, e.estado AS estado`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registromicrosd ${partitioning} rmsd`;
        }
        return `FROM nodo${ctrl_id}.registromicrosd rmsd`;
      },
      join_clause: () => `INNER JOIN general.estado e ON rmsd.estd_id = e.estd_id`,
    },
  },
  peticion: {
    has_partition: false,
    table_name: 'registropeticion',
    table_name_alias: 'rp',
    table_columns: ['rp_id', 'pin', 'orden', 'fecha', 'estd_id'],
    result_columns: ['id', 'pin', 'orden', 'fecha', 'estado'],
    order_by: 'rp_id',
    cursor_by: 'rp_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rp.rp_id AS id, rp.pin, CASE rp.orden WHEN 1 THEN 'Activar' WHEN 0 THEN 'Automático' WHEN -1 THEN 'Desactivar' ELSE 'Desconocido' END AS orden, rp.fecha, e.estado AS estado`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registropeticion ${partitioning} rp`;
        }
        return `FROM nodo${ctrl_id}.registropeticion rp`;
      },
      join_clause: () => `INNER JOIN general.estado e ON rp.estd_id = e.estd_id`,
    },
  },
  salida: {
    has_partition: true,
    table_name: 'registrosalida',
    table_name_alias: 'rs',
    table_columns: ['rs_id', 'pin', 'estado', 'fecha', 'es_id', 'alarma'],
    result_columns: ['id', 'pin', 'estado', 'fecha', 'actuador', 'alarma'],
    order_by: 'rs_id',
    cursor_by: 'rs_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rs.rs_id AS id, rs.pin, CASE rs.estado WHEN 1 THEN 'Activado' WHEN 0 THEN 'Desactivado' ELSE 'Desconocido' END AS estado, rs.fecha, IFNULL( es.actuador , 'No identificado') AS actuador ,  CASE rs.alarma WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS alarma`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registrosalida ${partitioning} rs`;
        }
        return `FROM nodo${ctrl_id}.registrosalida rs`;
      },
      join_clause: () => `LEFT JOIN general.equiposalida es ON rs.es_id = es.es_id`,
    },
  },
  seguridad: {
    has_partition: false,
    table_name: 'registroseguridad',
    table_name_alias: 'rsg',
    table_columns: ['rsg_id', 'estado', 'fecha'],
    result_columns: ['id', 'estado', 'fecha'],
    order_by: 'rsg_id',
    cursor_by: 'rsg_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rsg.rsg_id AS id, CASE rsg.estado WHEN 1 THEN 'Armado' WHEN 0 THEN 'Desarmado' ELSE 'Desconocido' END AS estado, rsg.fecha`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroseguridad ${partitioning} rsg`;
        }
        return `FROM nodo${ctrl_id}.registroseguridad rsg`;
      },
      join_clause: () => ``,
    },
  },
  temperatura: {
    has_partition: true,
    table_name: 'registrotemperatura',
    table_name_alias: 'rtmp',
    table_columns: ['rtmp_id', 'st_id', 'valor', 'fecha'],
    result_columns: ['id', 'sensor', 'valor', 'fecha'],
    order_by: 'rtmp_id',
    cursor_by: 'rtmp_id',
    datetime_field_filter: 'fecha',
    query: {
      select_clause: `SELECT rtmp.rtmp_id AS id, IFNULL( st.ubicacion , 'No identificado') AS sensor, rtmp.valor, rtmp.fecha`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registrotemperatura ${partitioning} rtmp`;
        }
        return `FROM nodo${ctrl_id}.registrotemperatura rtmp`;
      },
      join_clause: (ctrl_id: number) => `LEFT JOIN nodo${ctrl_id}.sensortemperatura st ON rtmp.st_id = st.st_id`,
    },
  },
  ticket: {
    has_partition: false,
    table_name: 'registroticket',
    table_name_alias: 'rt',
    table_columns: ['rt_id', 'telefono', 'correo', 'descripcion', 'fechacomienzo', 'fechatermino', 'estd_id', 'fechaestadofinal', 'fechacreacion', 'prioridad', 'p_id', 'tt_id', 'enviado', 'co_id', 'asistencia'],
    result_columns: ['id', 'telefono', 'correo', 'descripcion', 'fechacomienzo', 'fechatermino', 'estado', 'fechaestadofinal', 'fechacreacion', 'prioridad', 'solicitante', 'tipotrabajo', 'enviado', 'contrata', 'asistencia'],
    order_by: 'rt_id',
    cursor_by: 'rt_id',
    datetime_field_filter: 'fechacomienzo',
    query: {
      select_clause: `SELECT rt.rt_id AS id, rt.telefono, rt.correo, rt.descripcion, rt.fechacomienzo, rt.fechatermino, e.estado AS estado, rt.fechaestadofinal, rt.fechacreacion, CASE rt.prioridad WHEN 3 THEN 'Baja' WHEN 2 THEN 'Media' WHEN 1 THEN 'Alta' ELSE 'Desconocido' END AS prioridad, CONCAT(p.nombre, ' ', p.apellido) AS solicitante, tt.nombre AS tipotrabajo, CASE rt.enviado WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS enviado, co.contrata AS contrata, CASE rt.asistencia WHEN 1 THEN 'Sí' WHEN 0 THEN 'No' ELSE 'Desconocido' END AS asistencia`,
      from_clause: (ctrl_id: number, partitioning?: string) => {
        if (partitioning) {
          return `FROM nodo${ctrl_id}.registroticket ${partitioning} rt`;
        }
        return `FROM nodo${ctrl_id}.registroticket rt`;
      },
      join_clause: () => `INNER JOIN general.estado e ON rt.estd_id = e.estd_id INNER JOIN general.personal p ON rt.p_id = p.p_id INNER JOIN general.tipotrabajo tt ON rt.tt_id = tt.tt_id INNER JOIN general.contrata co ON rt.co_id = co.co_id`,
    },
  },
};

interface CursorRegisterSearchParams {
  paginationAction: PaginationAction;
  registerType: RegisterType;
  ctrl_id: number;
  start_date: string;
  end_date: string;
  // is_next: string;
  cursor?: number;
  limit?: number;
}

export class Register {
  static #NUM_PARTITION: number = 50;
  // static #MAX_REGISTER_DOWNLOAD: number = 50000;

  static async getRegisterCursor(params: CursorRegisterSearchParams) {
    const { paginationAction, registerType, start_date, end_date, ctrl_id, cursor, limit } = params;
    const registerOption = RegisterConfigOptions[registerType];
    const { ordenation, relational } = Register.getRelationalOperatorAndOrdenation(paginationAction);

    const startDate = dayjs(start_date, 'YYYY-MM-DD HH:mm:ss');
    const endDate = dayjs(end_date, 'YYYY-MM-DD HH:mm:ss');

    const selectClause = registerOption.query.select_clause;
    const fromClause = registerOption.query.from_clause(ctrl_id, registerOption.has_partition ? Register.getPartition(startDate, endDate) : undefined);
    const joinClause = registerOption.query.join_clause(ctrl_id);
    const whereClause = Register.getWhereClause(registerOption, relational, start_date, end_date, cursor);
    const orderbyClause: string = Register.getOrderbyClause(registerOption, ordenation, cursor);
    const limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`;

    const fullQuery = [selectClause, fromClause, joinClause, whereClause, orderbyClause, limit_clause].join(' ');
    const registros = await MySQL2.executeQuery<RowDataPacket[]>({ sql: fullQuery });

    return { data: paginationAction === PaginationAction.Prev ? registros.reverse() : registros, order_by: registerOption.order_by };
    // return fullQuery;
  }

  private static adjustLimitRange(limit?: number) {
    if (limit === undefined) return 10; // default value
    return Math.min(Math.max(Number(limit), 0), 100);
  }

  private static getWhereClause(config: ConfigProps, relational_operator: string, start_date: string, end_date: string, cursor?: number) {
    if (cursor) {
      return `WHERE ${config.table_name_alias}.${config.cursor_by} ${relational_operator} ${cursor} AND ${config.table_name_alias}.${config.datetime_field_filter} BETWEEN '${start_date}' AND '${end_date}'`;
    }

    return `WHERE ${config.table_name_alias}.${config.datetime_field_filter} BETWEEN '${start_date}' AND '${end_date}'`;
  }

  private static getOrderbyClause(config: ConfigProps, ordenation: string, cursor?: number) {
    return `ORDER BY ${config.table_name_alias}.${config.order_by} ${cursor === undefined ? 'DESC' : ordenation}`;
  }

  private static getPartition(start_date: Dayjs, end_date: Dayjs): string {
    return `PARTITION ( p${start_date.year() % Register.#NUM_PARTITION} , p${end_date.year() % Register.#NUM_PARTITION} )`;
  }

  private static getRelationalOperatorAndOrdenation(paginationAction: PaginationAction): { relational: string; ordenation: string } {
    switch (paginationAction) {
      case PaginationAction.Init:
        return { relational: '<', ordenation: 'DESC' };
      case PaginationAction.Lim:
        return { relational: '<=', ordenation: 'DESC' };
      case PaginationAction.Next:
        return { relational: '<', ordenation: 'DESC' };
      case PaginationAction.Prev:
        return { relational: '>', ordenation: 'ASC' };
      default:
        return { relational: '<', ordenation: 'DESC' };
    }
  }
}

// const query = Register.getRegisterCursor({
//   registerType: RegisterType.Ticket,
//   paginationAction: PaginationAction.Init,
//   ctrl_id: 1,
//   start_date: '2025-02-01 00:00:00',
//   end_date: '2025-04-16 00:00:00',
//   // cursor: 102,
//   // limit: 20,
// });

// console.log(query); // Esto imprime la SQL armada dinámicamente
