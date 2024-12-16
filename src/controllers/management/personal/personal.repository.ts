import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';
import { Personal } from './personal.entity';

export interface PersonalRepository {
  findById(p_id: number): Promise<Personal | undefined>;
  findByDni(dni: string): Promise<Personal | undefined>;
  findByContrataId(co_id: number): Promise<Personal[]>;
  create(data: CreatePersonalDTO): Promise<number>;
  update(p_id: number, fieldsUpdate: UpdatePersonalDTO): Promise<void>;
  softDelete(p_id: number): Promise<void>;
  softDeleteByContrata(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number): Promise<Personal[]>;
  countTotal(filters?: any): Promise<number>;
  countTotalByCotrataId(co_id: number): Promise<number>;
}
