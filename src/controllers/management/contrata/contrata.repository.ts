import { Contrata } from './contrata.entity';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';

export interface ContrataWithRubro {
  co_id: number;
  contrata: string;
  descripcion: string;
  activo: number;
  rubro: {
    r_id: number;
    rubro: string;
  };
}

export interface ContrataRepository {
  findById(co_id: number): Promise<Contrata | undefined>;
  findWithRubroById(co_id: number): Promise<ContrataWithRubro | undefined>;
  create(data: CreateContrataDTO): Promise<number>;
  update(co_id: number, fieldsUpdate: UpdateContrataDTO): Promise<void>;
  softDelete(co_id: number): Promise<void>;
  findByOffsetPagination(limit: number, offset: number, filters?: { rubros?: (string | number)[] }): Promise<ContrataWithRubro[]>;
  countTotal(filters?: any): Promise<number>;
}
