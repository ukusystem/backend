import { IntTuple } from './intTuple';
import { ParseType } from './enums';
import * as Codes from './codes';
import { TableTuple } from './tableTuple';
import * as queries from './queries';

/**
 * Append a {@linkcode tuplePassword} to the provided list of
 * {@linkcode IntTuple}. Used to build a list of parameters that expect a password
 * at the end.
 *
 * @param parseList List of current tuples.
 * @return The complete list of tuples
 */
export function addPasswordTuple(parseList: IntTuple[]): IntTuple[] {
  const newList: IntTuple[] = [];
  for (const item of parseList) {
    newList.push(item);
  }
  newList.push(queries.tuplePassword);
  return newList;
}

export const DEFAULT_DATE = '2000-01-01 00:00:00';

/* Constants for parsing commands */

export const tupleInt = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_INT);
export const tupleBig = new IntTuple(ParseType.TYPE_BIG, Codes.ERR_NO_BIG);
export const tupleLong = new IntTuple(ParseType.TYPE_LONG, Codes.ERR_NO_LONG);
export const tupleFloat = new IntTuple(ParseType.TYPE_FLOAT, Codes.ERR_NO_FLOAT);
export const tupleUser = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_USER);
export const tuplePassword = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_PASSWORD);
export const tupleCmd = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_CMD);
export const tupleID = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_ID);
export const tupleValue = new IntTuple(ParseType.TYPE_INT, Codes.ERR_NO_VALUE);
export const tupleTxt = new IntTuple(ParseType.TYPE_STR, Codes.ERR_NO_TXT);

export const loginParse = [tupleUser, tuplePassword, tupleInt, tupleInt, tupleInt];
export const valueDateParse = [tupleValue, tupleLong];
export const cmdAndIDParse = [tupleInt, tupleCmd];
export const tempParse = [tupleID, tupleFloat];
export const IDTextParse = [tupleValue, tupleTxt];
export const valueParse = [tupleValue];
export const bigParse = [tupleBig];
export const longParse = [tupleLong];
export const idParse = [tupleID];
export const pinStateParse = [tupleID, tupleInt];
export const enablesParse = [tupleInt, tupleBig, tupleInt, tupleBig, tupleInt, tupleBig, tupleInt, tupleBig, tupleBig, tupleBig];

export const pinParse = [tupleInt, tupleInt, tupleLong, tupleInt];
export const cardReadParse = [tupleInt, tupleBig, tupleInt, tupleInt, tupleInt, tupleLong];
export const powerParse = [tupleLong, tupleID, tupleFloat, tupleFloat, tupleFloat, tupleFloat, tupleFloat, tupleFloat];
export const orderParse = [tupleInt, tupleInt, tupleLong];
export const securityStateParse = [tupleInt, tupleInt, tupleInt, tupleLong];
export const sdStateParse = [tupleInt, tupleInt, tupleInt, tupleLong];
export const authParse = [tupleInt, tupleInt, tupleLong];
export const alarmParse = [tupleInt, tupleFloat, tupleLong];

/* Manage tables */

export const createDatabase = `
				CREATE DATABASE IF NOT EXISTS %s
			`;

/* Create tables. These scripts are the output of 'SHOW CREATE TABLE nodo.%s' with format specifiers. */

/**
 * @deprecated
 */
export const createTemperatureTable = `
				CREATE TABLE IF NOT EXISTS %s.registrotemperatura%s (
	rtmp_id bigint NOT NULL AUTO_INCREMENT,
	st_id int NOT NULL,
	valor float NOT NULL,
	fecha timestamp NOT NULL,
   PRIMARY KEY (rtmp_id),
   KEY fk_registrotemperatura_sensortemperatura_st_id_idx (st_id),
   CONSTRAINT fk_registrotemperatura_sensortemperatura_st_id%s FOREIGN KEY (st_id) REFERENCES %s.sensortemperatura (st_id)
 ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
  
			`;

/**
 * @deprecated
 */
export const createEnergyTable = `
				CREATE TABLE IF NOT EXISTS %s.registroenergia%s (
		re_id bigint NOT NULL AUTO_INCREMENT,
		me_id int NOT NULL,
		voltaje float NOT NULL,
		amperaje float NOT NULL,
		fdp float NOT NULL,
		frecuencia float unsigned NOT NULL,
		potenciaw float NOT NULL,
		potenciakwh double unsigned NOT NULL,
		fecha timestamp NOT NULL,
   PRIMARY KEY (re_id),
   KEY fk_registroenergia_medidorenergia_me_id_idx (me_id),
   CONSTRAINT fk_registroenergia_medidorenergia_me_id%s FOREIGN KEY (me_id) REFERENCES %s.medidorenergia (me_id)
 ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
			`;

/**
 * @deprecated
 */
export const createInputRegistreTable = `
				CREATE TABLE IF NOT EXISTS %s.registroentrada%s (
   rentd_id bigint NOT NULL AUTO_INCREMENT,
   pin tinyint NOT NULL,
   estado tinyint NOT NULL,
   fecha timestamp NOT NULL,
   ee_id int NOT NULL,
   PRIMARY KEY (rentd_id),
   KEY fk_registroentrada_equipoentrada_ee_id_idx (ee_id),
   CONSTRAINT fk_registroentrada_equipoentrada_ee_id%s FOREIGN KEY (ee_id) REFERENCES general.equipoentrada (ee_id) ON DELETE RESTRICT ON UPDATE RESTRICT
 ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
			`;

/**
 * @deprecated
 */
export const createOutputRegistreTable = `
CREATE TABLE IF NOT EXISTS %s.registrosalida%s (
   rs_id bigint NOT NULL AUTO_INCREMENT,
   pin tinyint NOT NULL,
   estado tinyint NOT NULL,
   fecha timestamp NOT NULL,
   es_id int NOT NULL,
   alarma tinyint NOT NULL,
   PRIMARY KEY (rs_id),
   KEY fk_registrosalida_equiopsalida_es_id_idx (es_id),
   CONSTRAINT fk_registrosalida_equiopsalida_es_id%s FOREIGN KEY (es_id) REFERENCES general.equiposalida (es_id) ON DELETE RESTRICT ON UPDATE RESTRICT
 ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb3;
			`;

/* Events */

export const insertPower = `
                INSERT INTO %s.registroenergia (me_id, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, fecha) 
                VALUES (?,?,?,?,?,?,?,?);
            `;

export const updatePower = `
				UPDATE %s.medidorenergia
				SET voltaje=?, amperaje=?, fdp=?, frecuencia=?, potenciaw=?, potenciakwh=?
				WHERE me_id = ?;
			`;

export const updateEnergyEnable = `
				UPDATE %s.medidorenergia
				SET activo = ?
				WHERE me_id = ?;
			`;

export const updateInputEnable = `
				UPDATE %s.pinesentrada
				SET activo = ?
				WHERE pin = ?;
			`;

export const updateOutputEnable = `
				UPDATE %s.pinessalida
				SET activo = ?
				WHERE pin = ?
			`;

export const updateTemperatureSensorEnable = `
				UPDATE %s.sensortemperatura
				SET activo =?
				WHERE st_id = ?
			`;

/**
 * This sets all rows with one query. Currently not defined, maybe not possible?
 */
export const updateAllInputsEnables = `

			`;

export const insertCard = `
				INSERT INTO %s.registroacceso (serie, administrador, autorizacion, fecha, p_id, ea_id, tipo, sn_id)
				VALUES (?,?,?,?,?,?,?,?);
			`;

export const getCardInfo = `
				SELECT A.p_id, A.ea_id
				FROM general.acceso A
				JOIN general.personal P
				ON A.p_id = P.p_id
				WHERE A.serie = ?
				AND P.co_id = ?;
			`;

export const insertCtrlState = `
				UPDATE general.controlador
				SET conectado = ?
				WHERE ctrl_id=?;
			`;

export const insertNet = `
				INSERT INTO general.registrored ( ctrl_id, fecha, estado )
				VALUE (?, ?, ?);
			`;

export const securityUpdate = `
				UPDATE general.controlador
				SET seguridad=?
				WHERE ctrl_id=?;
			`;

export const modeUpdate = `
				UPDATE general.controlador
				SET modo=?
				WHERE ctrl_id=?;
			`;

export const insertSecurity = `
				INSERT INTO %s.registroseguridad ( estado, fecha) VALUE (?, ?);
			`;

export const insertTemperature = `
				INSERT INTO %s.registrotemperatura (st_id, valor, fecha)
				VALUES (?, ?, ?);
			`;

export const updateAddress = `
				UPDATE %s.sensortemperatura
				SET serie = ?
				WHERE st_id = ?;
			`;

export const updateAlarmThreshold = `
				UPDATE %s.sensortemperatura
				SET umbral_alarma = ?
				WHERE st_id = ?;
			`;

export const insertInputChanged = `
				INSERT INTO %s.registroentrada (pin, estado, fecha, ee_id)
				VALUES (?, ?, ?, (SELECT ee_id FROM %s.pinesentrada WHERE pin=?));
			`;

export const insertOutputChanged = `
				INSERT INTO %s.registrosalida (pin, estado, fecha, es_id, alarma)
				VALUES (?, ?, ?, (SELECT es_id FROM %s.pinessalida WHERE pin=?), ?);
			`;

export const updateInputState = `
				UPDATE %s.pinesentrada
				SET estado=?
				WHERE pe_id = ?;
			`;

export const updateOutputState = `
				UPDATE %s.pinessalida
				SET estado=?
				WHERE ps_id = ?;
			`;

export const getDetectorID = `
				SELECT ee_id AS device_id
				FROM %s.pinesentrada
				WHERE pin=?;
			`;

export const getActuatorID = `
				SELECT es_id AS device_id
				FROM %s.pinessalida
				WHERE pin=?;
			`;

export const insertSD = `
				INSERT INTO %s.registromicrosd (fecha, estd_id)
				VALUE (?, ?);
			`;

export const insertCameraState = `
				INSERT INTO %s.registroestadocamara (cmr_id, fecha, conectado)
				VALUE (?,?,?)
			`;

/* Tickets and requests */

/**
 * rt_id, telefono, correo, descripcion, fechacomienzo, fechatermino, estd_id, fechaestadofinal, fechacreacion,
 * prioridad, p_id, tt_id, sn_id, enviado, co_id, asistencia
 * @deprecated
 */
export const selectUnattendedTicket = `
				SELECT rt_id AS entero FROM %s.registroticket
				WHERE co_id = ? AND fechacomienzo < ? AND fechatermino > ? AND enviado = 1 AND asistencia = 0;
`;

/**
 * Update the ticket as attended
 */
export const updateTicketAttended = `
				UPDATE %s.registroticket
				SET asistencia = 1
				WHERE rt_id = ?;
`;

/**
 * Select the ticket that is being attended
 */
export const selectTicketToAttend = `
				SELECT rt_id FROM %s.registroticket
				WHERE co_id = ? AND fechacomienzo < ? AND fechatermino > ? AND enviado = 1;
`;

export const insertRequest = `
				INSERT INTO %s.registropeticion ( pin, orden, fecha, estd_id)
				VALUE (?, ?, ?, ?);
			`;

export const insertTicket = `
				INSERT INTO %s.registroticket
				(telefono, correo, descripcion, fechacomienzo, fechatermino,
				estd_id, fechacreacion, prioridad, p_id, tt_id,
				sn_id, co_id, enviado, asistencia)
				VALUE
				(?, ?, ?, ?, ?,
				?, ?, ?, ?,	?,
				?, ?, 0 , 0);
			`;

export const getCompanyID = `
				SELECT contrata_id FROM %s.registroticket
				WHERE id=?;
			`;

export const finishTicket = `
				UPDATE %s.registroticket
				SET estd_id=?, fechaestadofinal=?
				WHERE rt_id=?;
			`;

export const ticketSetSent = `
				UPDATE %s.registroticket
				SET enviado = 1
				WHERE rt_id = ?;
			`;

export const insertWorker = `
				INSERT INTO %s.actividadpersonal (nombre, apellido, telefono, dni, c_id, co_id, rt_id, foto)
				VALUE (?, ?, ?, ?, ?, ?, ?, ?);
			`;

/**
 * Removed:
 * WHERE enviado=0
 * So new controllers can be updated with valid tickets
 */
export const ticketSelectAccepted = `
				SELECT rt_id, co_id, fechacomienzo, fechatermino
				FROM %s.registroticket
				WHERE fechatermino > now()
				AND estd_id = (
					SELECT estd_id
					FROM general.estado
					WHERE estado='Aceptado'
				) ORDER BY fechacomienzo ASC;
			`;

export const ticketSelectOne = `
				SELECT co_id, fechacomienzo, fechatermino, estd_id
				FROM %s.registroticket
				WHERE rt_id=?;
			`;

export const insertDocument = `
				INSERT INTO %s.archivoticket ( ruta, nombreoriginal, tipo, rt_id) VALUE (?, ?, ?, ?);
			`;

/* Common queries */

/**
 * Get the next ID that would be used in the next row inserted in a table in the
 * 'general' database. Needs to be formated with the table's name.
 */
export const nextIDForGeneral = `
				SELECT AUTO_INCREMENT
				FROM information_schema.tables
				WHERE table_name = '%s'
				AND table_schema = 'general';
			`;

// export const nextIDForGeneral2 = `
// 				SELECT *
// 				FROM information_schema.tables
// 				;
// 			`;

/**
 * Get the next ID that would be used in the next row inserted in a table in the
 * node's database. Needs to be formated with the table's name and the node
 * database name.
 */
export const nextIDForNode = `
				SELECT AUTO_INCREMENT
				FROM information_schema.tables
				WHERE table_name = '%s'
				AND table_schema = '%s';
			`;

/*
 * Set the cache expiration delay for the current session so it updates on every
 * operation.
 */
export const setStatExpiry = `
				SET information_schema_stats_expiry = 0;
			`;

/* Login */

export const loginManager = `
				SELECT u_id, contraseña FROM general.usuario
				WHERE usuario=?
				AND activo=1
				AND rl_id=(
				SELECT rl_id FROM general.rol
				WHERE rol='Administrador');
			`;

/* Region */

export const regionSelect = `
				SELECT rgn_id, region, descripcion
				FROM general.region
				WHERE activo = 1;
			`;

export const regionInsert = `
				INSERT INTO general.region (rgn_id, region, descripcion, activo)
				VALUE (?, ?, ?, 1);
			`;

export const regionUpdate = `
				UPDATE general.region
				SET region=?, descripcion=?
				WHERE rgn_id=?;
			`;

export const regionDisable = `
				UPDATE general.region
				SET activo=0
				WHERE rgn_id=?;
			`;

export const regionParse = [tupleInt, tupleTxt, tupleTxt];

/* Node */

export const nodeGetForSocket = `
				SELECT ctrl_id, nodo, ip, puerto, usuario, contraseña
				FROM general.controlador
				WHERE activo=1;
			`;

export const nodeGetForUpdate = `
				SELECT ctrl_id, nodo, ip, puerto, usuario, contraseña
				FROM general.controlador
				WHERE ctrl_id=? AND activo=1;
			`;

/**
 * ctrl_id, nodo, rgn_id, direccion, descripcion,
 * latitud, longitud, usuario, serie,
 * ip, mascara, puertaenlace, puerto, personalgestion,
 * personalimplementador, seguridad,
 *
 * motionrecordseconds, res_id_motionrecord, motionrecordfps,
 * motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval,
 * res_id_streamprimary, streamprimaryfps,
 * res_id_streamsecondary, streamsecondaryfps,
 * res_id_streamauxiliary, streamauxiliaryfps,
 * modo,
 */

export const nodeSelect = `
				SELECT ctrl_id, nodo, rgn_id, direccion, descripcion,
					latitud, longitud, usuario, serie,
					ip, mascara, puertaenlace, puerto, personalgestion,
					personalimplementador, seguridad,
					
					motionrecordseconds, res_id_motionrecord, motionrecordfps, 
					motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval, 
					res_id_streamprimary, streamprimaryfps, 
					res_id_streamsecondary, streamsecondaryfps, 
					res_id_streamauxiliary, streamauxiliaryfps,
					modo

				FROM general.controlador
				WHERE activo=1;
			`;

/**
 * Update the node data without modifying the password.
 */
export const nodeUpdate = `
				UPDATE general.controlador
				SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
					latitud=?, longitud=?, usuario=?,
					ip=?, mascara=?, puertaenlace=?, puerto=?, personalgestion=?,
					personalimplementador=?,

					motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
					motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
					res_id_streamprimary=?, streamprimaryfps=?, 
					res_id_streamsecondary=?, streamsecondaryfps=?, 
					res_id_streamauxiliary=?, streamauxiliaryfps=?

				WHERE ctrl_id=?;
			`;

/**
 * Update the node data modifying the password. The password must be already
 * encrypted.
 */
export const nodeUpdatePwd = `
				UPDATE general.controlador
				SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
					latitud=?, longitud=?, usuario=?,
					ip=?, mascara=?, puertaenlace=?, puerto=?, personalgestion=?,
					personalimplementador=?, 

					motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
					motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
					res_id_streamprimary=?, streamprimaryfps=?, 
					res_id_streamsecondary=?, streamsecondaryfps=?, 
					res_id_streamauxiliary=?, streamauxiliaryfps=?,

					contraseña=?
				WHERE ctrl_id=?;
			`;

export const nodeUpdateTrivial = `
			UPDATE general.controlador
			SET nodo=?, rgn_id=?, direccion=?, descripcion=?,
				latitud=?, longitud=?,
				personalgestion=?,
				personalimplementador=?,

				motionrecordseconds=?, res_id_motionrecord=?, motionrecordfps=?, 
				motionsnapshotseconds=?, res_id_motionsnapshot=?, motionsnapshotinterval=?, 
				res_id_streamprimary=?, streamprimaryfps=?, 
				res_id_streamsecondary=?, streamsecondaryfps=?, 
				res_id_streamauxiliary=?, streamauxiliaryfps=?
			WHERE ctrl_id=?;
		`;

export const nodeUpdateSerial = `
			UPDATE general.controlador
			SET serie=?
			WHERE ctrl_id=?;
`;

export const nodeInsert = `
				INSERT INTO general.controlador (
					ctrl_id, nodo, rgn_id, direccion, descripcion, latitud, longitud,
					usuario, ip, mascara, puertaenlace, puerto, personalgestion,
					personalimplementador,

					motionrecordseconds, res_id_motionrecord, motionrecordfps, 
					motionsnapshotseconds, res_id_motionsnapshot, motionsnapshotinterval, 
					res_id_streamprimary, streamprimaryfps, 
					res_id_streamsecondary, streamsecondaryfps, 
					res_id_streamauxiliary, streamauxiliaryfps,

					contraseña, modo, seguridad, conectado, activo, serie)
				VALUE (
					?, ?, ?, ?, ?, ?, ?,
					?, ?, ?, ?, ?, ?,
					?,

					?, ?, ?,
					?, ?, ?,
					?, ?,
					?, ?,
					?, ?,

					?, 0, 0, 0, 1, '-')
			`;

export const nodeDisable = `
				UPDATE general.controlador
				SET activo=0
				WHERE ctrl_id=?;
			`;

export const indexForTrivial = [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

export const nodeSelectID = `
				SELECT ctrl_id AS entero FROM general.controlador
				WHERE activo=1;
			`;

/**
 * Tuples to parse the node data without a password.
 */
export const nodeParse = [
  tupleID,
  tupleTxt,
  tupleID,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  tupleTxt,
  //   tupleTxt,
  tupleInt,
  tupleTxt,
  tupleTxt,
  tupleInt,
  tupleID,
  tupleInt,
  tupleInt,
  tupleID,
  tupleInt,
  tupleID,
  tupleInt,
  tupleID,
  tupleInt,
  tupleID,
  tupleInt,
  // tupleInt
];

/**
 * Tuples to parse the node data expecting a password as the last item.
 */
export const nodeParsePwd = addPasswordTuple(nodeParse);

export const nodePasswordIndex = nodeParsePwd.length - 1;

export const nodeNameIndex = 2;

/* Company */

export const companySelect = `
				SELECT co_id, contrata, r_id, descripcion
				FROM general.contrata
				WHERE activo = 1;
			`;

export const companyInsert = `
				INSERT INTO general.contrata (co_id, contrata, r_id, descripcion, activo)
				VALUE (?, ?, ?, ?, 1);
			`;

export const companyUpdate = `
				UPDATE general.contrata
				SET contrata=?, r_id=?, descripcion=?
				WHERE co_id=?;
			`;

export const companyDisable = `
				UPDATE general.contrata
				SET activo=0
				WHERE co_id=?;
			`;

export const companyParse = [tupleInt, tupleTxt, tupleInt, tupleTxt];

/* User */

export const userSelect = `
				SELECT u_id, usuario, rl_id, fecha, p_id
				FROM general.usuario
				WHERE activo=1;
			`;

export const userInsert = `
				INSERT INTO general.usuario (u_id, usuario, rl_id, fecha, p_id, contraseña, activo)
				VALUE (?, ?, ?, ?, ?, ?, 1);
			`;

/*
 * Update the user without changing the password.
 */
export const userUpdate = `
				UPDATE general.usuario
				SET usuario=?, rl_id=?, p_id=?
				WHERE u_id=?;
			`;

/*
 * Update the user changing the password
 */
export const userUpdatePwd = `
				UPDATE general.usuario
				SET usuario=?, rl_id=?, p_id=?,
				contraseña=?
				WHERE u_id=?;
			`;

export const userDisable = `
				UPDATE general.usuario
				SET activo=0
				WHERE u_id=?;
			`;

export const userParse = [tupleID, tupleUser, tupleID, tupleTxt, tupleID];
export const userParsePwd = addPasswordTuple(userParse);

export const userPasswordIndex = userParsePwd.length - 1;
export const userDateIndex = 3;

/* Worker */

export const selectWorkerCompany = `
	SELECT co_id AS entero FROM general.personal
	WHERE p_id = ?;
`;

export const workersSelect = `
				SELECT p_id, nombre, apellido, telefono, dni, c_id, co_id, foto, correo
				FROM general.personal
				WHERE activo=1;
			`;

export const workerInsert = `
				INSERT INTO general.personal (p_id, nombre, apellido, telefono, dni, c_id, co_id, correo, foto, activo)
				VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
			`;

export const workerUpdate = `
				UPDATE general.personal
				SET nombre=?, apellido=?, telefono=?, dni=?, c_id=?, co_id=?, correo=?, foto=?
				WHERE p_id=?;
			`;

export const workerDisable = `
				UPDATE general.personal
				SET activo=0
				WHERE p_id=?;
			`;

export const workerParse = [tupleID, tupleTxt, tupleTxt, tupleTxt, tupleTxt, tupleInt, tupleInt, tupleTxt, tupleTxt];

export const workerPhotoIndex = 8;
export const workerIDIndex = 0;

/* Card */

/**
 * All cards must be downloaded since this table is of a fixed size and all
 * items should be displayed in their original order.
 */
export const cardSelect = `
				SELECT a_id, serie, administrador, p_id, ea_id, activo
				FROM general.acceso;
			`;

export const cardUpdate = `
				UPDATE general.acceso
				SET serie=?, administrador=?, p_id=?, ea_id=?, activo=?
				WHERE a_id=?;
			`;

export const cardDisable = `
				UPDATE general.acceso
				SET activo=0
				WHERE a_id=?;
			`;

export const cardParse = [tupleInt, tupleBig, tupleInt, tupleInt, tupleInt, tupleInt];

export const cardSelectForController = `
				SELECT A.a_id, A.serie, A.administrador, P.co_id, A.activo
				FROM general.acceso A
				JOIN general.personal P
				ON A.p_id = P.p_id;
			`;

/* Energy */

export const energySelect = `
			SELECT me_id, descripcion
			FROM %s.medidorenergia;
			`;

export const energyUpdate = `
			UPDATE %s.medidorenergia
			SET descripcion =?
			WHERE me_id = ?;
			`;

export const energyParse = [tupleInt, tupleTxt];

/* Fixed lists (edition is not allowed by manager) */

export const accessSelect = `
				SELECT ea_id, nombre FROM general.equipoacceso;
			`;

export const sectorSelect = `
				SELECT r_id, rubro FROM general.rubro;
			`;

export const roleSelect = `
				SELECT rl_id, rol, descripcion FROM general.rol WHERE activo = 1;
			`;

export const postSelect = `
				SELECT c_id, cargo FROM general.cargo;
			`;

export const actuatorSelect = `
				SELECT es_id, actuador, descripcion FROM general.equiposalida WHERE activo=1;
			`;

export const detectorSelect = `
				SELECT ee_id, detector, descripcion FROM general.equipoentrada WHERE activo=1;
			`;

export const cameraTypeSelect = `
				SELECT tc_id, tipo FROM general.tipocamara;
			`;

export const camBrandSelect = `
				SELECT m_id, marca FROM general.marca;
			`;

export const selectResolutions = `
				SELECT res_id, nombre FROM general.resolucion;
			`;

/* Input pins */

export const inputsSelect = `
				SELECT pe_id, pin, ee_id, descripcion
				FROM %s.pinesentrada;
			`;

export const inputUpdate = `
				UPDATE %s.pinesentrada
				SET pin=?, ee_id=?, descripcion=?
				WHERE pe_id=?;
			`;

export const inputParse = [tupleInt, tupleInt, tupleInt, tupleTxt];

/* Output pins */

export const outputsSelect = `
				SELECT ps_id, pin, es_id, descripcion
				FROM %s.pinessalida;
			`;

export const outputUpdate = `
				UPDATE %s.pinessalida
				SET pin=?, es_id=?, descripcion=?
				WHERE ps_id=?;
			`;

export const outputParse = [tupleInt, tupleInt, tupleInt, tupleTxt];

/* Cameras */

export const camerasSelect = `
				SELECT cmr_id, serie, tc_id, m_id, usuario, ip, puerto, descripcion, puertows, mascara, puertaenlace
				FROM %s.camara
				WHERE activo=1;
			`;

export const nodeSelectForCameraCheck = `
				SELECT ctrl_id AS entero
				FROM general.controlador
				WHERE activo=1
			`;

export const cameraSelectForConnection = `
				SELECT cmr_id, ip
				FROM %s.camara
				WHERE activo=1;
			`;

export const cameraSelectOneForConnection = `
				SELECT ip
				FROM %s.camara
				WHERE activo=1 and cmr_id=?;
			`;

export const cameraUpdate = `
				UPDATE %s.camara
				SET serie=?, tc_id=?, m_id=?, usuario=?, ip=?, puerto=?, descripcion=?, puertows=?, mascara=?, puertaenlace=?
				WHERE cmr_id=?;
			`;

export const cameraUpdatePwd = `
				UPDATE %s.camara
				SET serie=?, tc_id=?, m_id=?, usuario=?, ip=?, puerto=?, descripcion=?, puertows=?, mascara=?, puertaenlace=?, contraseña=?
				WHERE cmr_id=?;
			`;

export const cameraInsert = `
				INSERT INTO %s.camara (cmr_id, serie, tc_id, m_id, usuario, ip, puerto, descripcion, puertows, mascara, puertaenlace, contraseña, conectado, activo)
				VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1);
			`;

export const cameraDisable = `
				UPDATE %s.camara
				SET activo=0
				WHERE cmr_id=?;
			`;

export const cameraSetNet = `
				UPDATE %s.camara
				SET conectado=?
				WHERE cmr_id=?;
			`;

/**
 * Tuples to parse the camera data without password.
 */
export const cameraParse = [tupleInt, tupleTxt, tupleInt, tupleInt, tupleTxt, tupleTxt, tupleInt, tupleTxt, tupleInt, tupleTxt, tupleTxt];

/**
 * Tuples to parse the camera data with password.
 */
export const cameraParsePwd = addPasswordTuple(cameraParse);

export const cameraPasswordIndex = cameraParsePwd.length - 1;
export const cameraIDIndex = 0;
export const cameraIPIndex = 5;

/* Temperature sensors */

export const tempSensorsSelect = `
				SELECT st_id, serie, ubicacion
				FROM %s.sensortemperatura;
			`;

export const tempSensorUpdate = `
				UPDATE %s.sensortemperatura
				SET serie=?, ubicacion=?
				WHERE st_id=?;
			`;

export const tempSensorParse = [tupleInt, tupleTxt, tupleTxt];

/* Card reader */

export const cardReaderSelect = `
				SELECT lt_id, descripcion
				FROM %s.lectortarjeta;
			`;

export const cardReaderUpdate = `
				UPDATE %s.lectortarjeta
				SET descripcion =?
				WHERE lt_id =?;
			`;

export const cardReaderParse = [tupleInt, tupleTxt];

/**
 * Operations with the database that only require to select and send with no
 * further processing and no node dependent.
 */
export const tableTuples = [
  new TableTuple(Codes.VALUE_GROUP, Codes.VALUE_GROUPS_END, queries.regionSelect, 'region', false),
  new TableTuple(Codes.VALUE_USER, Codes.VALUE_USER_END, queries.userSelect, 'usuario', false),
  new TableTuple(Codes.VALUE_COMPANY, Codes.VALUE_COMPANY_END, queries.companySelect, 'contrata', false),

  new TableTuple(Codes.VALUE_ACCESS_TYPE, Codes.VALUE_ACCESS_TYPE_END, queries.accessSelect, 'equipoacceso', false),
  new TableTuple(Codes.VALUE_SECTOR, Codes.VALUE_SECTOR_END, queries.sectorSelect, 'rubro', false),
  new TableTuple(Codes.VALUE_ROLE, Codes.VALUE_ROLE_END, queries.roleSelect, 'rol', false),
  new TableTuple(Codes.VALUE_POST, Codes.VALUE_POST_END, queries.postSelect, 'cargo', false),

  new TableTuple(Codes.VALUE_CARD, Codes.VALUE_CARD_END, queries.cardSelect, 'acceso', false),

  new TableTuple(Codes.VALUE_DETECTOR, Codes.VALUE_DETECTOR_END, queries.detectorSelect, 'equipoentrada', false),
  new TableTuple(Codes.VALUE_ACTUATOR, Codes.VALUE_ACTUATOR_END, queries.actuatorSelect, 'equiposalida', false),
  new TableTuple(Codes.VALUE_CAMERA_TYPE, Codes.VALUE_CAMERA_TYPE_END, queries.cameraTypeSelect, 'tipocamara', false),
  new TableTuple(Codes.VALUE_CAMERA_BRAND, Codes.VALUE_CAMERA_BRAND_END, queries.camBrandSelect, 'marca', false),
  new TableTuple(Codes.VALUE_RESOLUTION, Codes.VALUE_RESOLUTION_END, queries.selectResolutions, 'resolucion', false),
];

/**
 * General configuration
 */

export const generalSelect = `
				SELECT nombreempresa, correoadministrador FROM general.configuracion LIMIT 1;
`;

export const generalUpdate = `
				UPDATE general.configuracion
				SET nombreempresa=?, correoadministrador=? WHERE conf_id >0;
`;

export const generalParse = [tupleTxt, tupleTxt];

/* Firmwares */

export const firmwareInsert = `
	INSERT INTO general.firmware (archivo, mayor, menor, parche)
	VALUE (?,?,?,?);
`;

// export const firmwareSetAvailability = `
// 	UPDATE general.firmware
// 	SET disponible = ?
// 	WHERE f_id = ?;
// `;

export const firmwareOrderSelect = `
	SELECT * FROM general.firmware ORDER BY mayor DESC, menor DESC, parche DESC;
`;
