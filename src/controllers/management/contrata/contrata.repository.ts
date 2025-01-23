import { Rubro } from '../rubro/rubro.entity';
import { Contrata } from './contrata.entity';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';
import { PaginationContrata } from './schemas/pagination.contrata.schema';

export interface ContrataWithRubro extends Contrata {
  // co_id: number;
  // contrata: string;
  // descripcion: string;
  // activo: number;
  // r_id: number;
  rubro: Rubro;
  total_personal: number;
}

export interface ContrataRepository {
  findById(co_id: number): Promise<Contrata | undefined>;
  findWithRubroById(co_id: number): Promise<ContrataWithRubro | undefined>;
  create(data: CreateContrataDTO): Promise<Contrata>;
  update(co_id: number, fieldsUpdate: UpdateContrataDTO): Promise<void>;
  softDelete(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number, filters?: PaginationContrata['filters']): Promise<ContrataWithRubro[]>;
  countTotal(filters?: PaginationContrata['filters']): Promise<number>;
}
