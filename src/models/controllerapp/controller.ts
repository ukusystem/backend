import { Ticket } from './src/ticket';
import { Main } from './src/main';
import { FinishTicket } from './src/finishTicket';
import { PinOrder } from './src/types';
import { RequestResult } from './src/requestResult';
import { Camara } from '../../types/db';
import { ResultSetHeader } from 'mysql2';
import { executeQuery } from './src/dbManager';
import * as useful from './src/useful';
import util from 'util';

let mainService: Main | null = null;

export async function main() {
  // Usar esta instancia para tickets y ordenes
  mainService = new Main();
  await mainService.run();
}

export async function onTicket(newTicket: Ticket) {
  return await mainService?.onTicket(newTicket);
}

export async function onFinishTicket(ticket: FinishTicket) {
  return await mainService?.onFinishTicket(ticket);
}

export async function onOrder(pinOrder: PinOrder) {
  return await mainService?.onOrder(pinOrder);
}

export async function sendSecurity(controllerID: number, security: boolean): Promise<RequestResult | undefined> {
  return await mainService?.sendSecurity(controllerID, security);
}

export function notifyCamDisconnect(ctrl_id: number, cam: Camara): void {
  mainService?.addDisconnectedCamera(ctrl_id, cam);
}

/**
 * FOR DEVELOPMENT ONLY
 * Delete tickets from nodes except node1
 * Deprecated for safety :)
 * @deprecated
 */
export async function test_deleteTickets() {
  const q_conf_actividad = `
    ALTER TABLE nodo%s.actividadpersonal
    DROP FOREIGN KEY fk_actividadpersonal_registroticket_rt_id;
    ALTER TABLE nodo%s.actividadpersonal 
    ADD CONSTRAINT fk_actividadpersonal_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE CASCADE
      ON UPDATE RESTRICT;
  `;
  const q_conf_actividad_revert = `
    ALTER TABLE nodo%s.actividadpersonal 
    DROP FOREIGN KEY fk_actividadpersonal_registroticket_rt_id;
    ALTER TABLE nodo%s.actividadpersonal 
    ADD CONSTRAINT fk_actividadpersonal_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE RESTRICT
      ON UPDATE RESTRICT;
  `;
  const q_conf_archivo = `
    ALTER TABLE nodo%s.archivoticket 
    DROP FOREIGN KEY fk_archivoticket_registroticket_rt_id;
    ALTER TABLE nodo%s.archivoticket 
    ADD CONSTRAINT fk_archivoticket_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE CASCADE
      ON UPDATE RESTRICT;
  `;
  const q_conf_archivo_revert = `
    ALTER TABLE nodo%s.archivoticket 
    DROP FOREIGN KEY fk_archivoticket_registroticket_rt_id;
    ALTER TABLE nodo%s.archivoticket 
    ADD CONSTRAINT fk_archivoticket_registroticket_rt_id
      FOREIGN KEY (rt_id)
      REFERENCES nodo%s.registroticket (rt_id)
      ON DELETE RESTRICT
      ON UPDATE RESTRICT;
  `;
  const q_delete = `
    DELETE FROM nodo%s.registroticket WHERE rt_id>0;
  `;
  let counter = 1;
  const nodeStart = 2;
  const nodeEnd = 104;
  let currNode = nodeStart;
  while (currNode < nodeEnd) {
    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad, currNode, currNode, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo, currNode, currNode, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_delete, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_actividad_revert, currNode, currNode, currNode));
    await executeQuery<ResultSetHeader>(util.format(q_conf_archivo_revert, currNode, currNode, currNode));
    currNode = currNode + 1;
    counter = counter + 1;
    if (counter % 50 === 0) {
      console.log(`Deleted from ${counter} tables`);
    }
  }
  console.log(`Finished`);
}

/**
 * FOR DEVELOPMENT ONLY
 * Insert fake tickets to 'node1'.
 * Deprecated for safety :)
 * @deprecated
 */
export async function test_insertFakeTickets() {
  let counter = 1;
  const q = `
    INSERT INTO nodo1.registroticket (telefono, correo, descripcion, fechacomienzo, fechatermino, estd_id, fechaestadofinal, 
    fechacreacion, prioridad, p_id, tt_id, sn_id, enviado, co_id, asistencia) 
    VALUE (?,?,?,?,?,?,?,?,?,?,?,1,1,?,?);
  `;
  const startDate = 1735707600;
  let currStart = startDate;
  const ticketSpan = 3600 * 2;
  const startStep = 3600 * 5;
  const endDate = 1742792400;
  const emails = ['mortizc@hotmail.com', 'evelyndc_10@hotndjd.com', 'antony@pruebas.com', 'miguel@pruebas.com', 'mig_1294@hotmail.com', 'hans.gutierrez.davila@uni.pe', 'darlynnn@hotmail.com'];
  const states0 = [4, 18, 2, 3];
  const states1 = [16, 2, 3];
  const contrataPersonal = [
    {
      id: 2,
      p_id: [3],
    },
    {
      id: 3,
      p_id: [1, 2],
    },
    {
      id: 4,
      p_id: [4],
    },
    {
      id: 5,
      p_id: [5],
    },
  ];
  const tipoDesc = [
    {
      id: 1,
      desc: ['Instalación de switch', 'Instalación de rack', 'Medición de potencia', 'Reinicio de servidor', 'Desconectar cliente', 'Conectar puerto', 'Verificar conexión', 'Medición de ancho de banda'],
    },
    {
      id: 2,
      desc: ['Instalación de UPS', 'Medición de consumo', 'Instalación de interruptor termomagnético', 'Control de consumo eléctrico', 'Instalación de luminarias', 'Instalación de Janox sistema de seguridad', 'Encendido de grupo electrógeno', 'Instalación de piso antiestático'],
    },
    {
      id: 3,
      desc: ['Proyección de instalación de rack', 'Visita guiada a un cliente', 'Visita técnica', 'Instrucción a nuevo personal', 'Proyección del recorrido de fibra', 'Proyeccion para instalación de Janox'],
    },
    {
      id: 4,
      desc: ['Mantenimiento preventivo', 'Mantenimiento correctivo', 'Limpieza del site', 'Pintura de paredes', 'Cambio de chapa', 'Instalación de rejas metálicas', 'Cambio de puerta', 'Reparacion de grietas'],
    },
  ];

  const getRandItem = (a: any[], r: number) => {
    return a[Math.floor(r * a.length)];
  };

  while (currStart < endDate) {
    const r1 = Math.random();
    const b = r1 > 0.5;
    const r2 = Math.random();
    const c = getRandItem(contrataPersonal, r1);
    const t = getRandItem(tipoDesc, r1);
    await executeQuery<ResultSetHeader>(q, [
      Math.floor(r1 * 99999999 + 900000000),
      getRandItem(emails, r1),
      getRandItem(t.desc, r2),
      useful.formatTimestamp(currStart),
      useful.formatTimestamp(currStart + ticketSpan),
      getRandItem(b ? states1 : states0, r2),
      useful.formatTimestamp(currStart + ticketSpan),
      useful.formatTimestamp(currStart - 3600 * 8),
      Math.floor(r1 * 3) + 1,
      getRandItem(c.p_id, r1),
      t.id,
      c.id,
      b ? 1 : 0,
    ]);
    currStart = currStart + startStep;
    counter = counter + 1;
    if (counter % 50 === 0) {
      console.log(`Inserted ${counter} tickets`);
    }
  }
  console.log(`Finished`);
}
