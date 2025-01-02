/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from 'dayjs';
import { MySQL2 } from '../../database/mysql';
import { ResultSetHeader } from 'mysql2';
import { genericLogger } from '../../services/loggers';

type FieldName = any;

type FieldValue = {
  old_value: any;
  new_value: any;
};

export type RecordAudit = Record<FieldName, FieldValue>; // key : field_name

export class AuditManager {
  static insert(db_name: string, audit_table_name: string, table_name: string, data: RecordAudit, personal: string) {
    const dateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const queryListValues = Object.entries(data).map(([field_name, { old_value, new_value }]) => {
      return [field_name, old_value, new_value];
    });

    queryListValues.forEach(async (queryValue) => {
      try {
        await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO ${db_name}.${audit_table_name} ( table_name , field_name , old_value , new_value , personal , datetime ) VALUES ( ? , ? , ? , ? , ? , ? )`, values: [table_name, ...queryValue, personal, dateTime] });
      } catch (error) {
        genericLogger.error(`AuditManager | Error al insertar registro en la tabla ${table_name}`, error);
        console.log(error);
      }
    });
  }
}

export function filterFieldUpdate<T extends Record<any, any>>(current: T, update: Partial<T>): Partial<T> {
  const fieldsValid = Object.entries(update).filter(([key, value]) => {
    if (value !== undefined && value !== current[key]) {
      return true;
    }

    return false;
  });

  const result = fieldsValid.reduce<Partial<T>>((prev, curr) => {
    const result = prev;
    const [key, value] = curr;
    const keyAssert = key as keyof T;
    result[keyAssert] = value;

    return result;
  }, {});

  return result;
}

export function getRecordAudit<T>(current: T, update: Partial<T>): RecordAudit {
  const records: RecordAudit = Object.entries(update).reduce<RecordAudit>((prev, curr) => {
    const result = prev;
    const [key, value] = curr;
    const keyAssert = key as keyof T;
    result[key] = {
      old_value: current[keyAssert],
      new_value: value,
    };

    return result;
  }, {});
  return records;
}
