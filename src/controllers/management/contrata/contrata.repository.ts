import { Contrata } from './contrata.entity';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';

export interface ContrataRepository {
  findById(co_id: number): Promise<Contrata | undefined>;
  create(data: CreateContrataDTO): Promise<number>;
  update(co_id: number, fieldsUpdate: UpdateContrataDTO): Promise<void>;
  softDelete(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number): Promise<Contrata[]>;
  countTotal(filters?: any): Promise<number>;
}
