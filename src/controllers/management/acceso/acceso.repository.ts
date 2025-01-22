import { Acceso } from './acceso.entity';
import { CreateAccesoDTO } from './dtos/create.acceso.dto';
import { UpdateAccesoDTO } from './dtos/update.acceso.dto';

export interface AccesoRepository {
  findById(a_id: number): Promise<Acceso | undefined>;
  findBySerie(serie: number): Promise<Acceso | undefined>;
  findByContrataId(co_id: number): Promise<Array<Acceso>>;
  create(data: CreateAccesoDTO): Promise<number>;
  update(a_id: number, fieldsUpdate: UpdateAccesoDTO): Promise<void>;
  softDelete(a_id: number): Promise<void>;
  softDeleteByContrataId(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number): Promise<Acceso[]>;
  countTotal(filters?: any): Promise<number>;
}
