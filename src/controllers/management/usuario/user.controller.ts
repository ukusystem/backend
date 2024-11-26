import { NextFunction, Request, Response } from 'express';
import { PasswordHasher } from './security/passwod.hasher';
import { UserRepository } from './user.repository';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { CreateUserDTO } from './dtos/create.user.dto';

export class UserController {
  constructor(
    private readonly repository: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      //
      const userDTO: CreateUserDTO = req.body;
      //   userDTO.

      const isUsernameAvailable = await this.repository.isUsernameAvailable(userDTO.usuario);
      if (!isUsernameAvailable) {
        return res.status(409).json({ message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
      }
    });
  }

  get listUsers() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { cursor, page_size } = req.query as { page_size: string | undefined; cursor: string | undefined };

      const final_page_size: number = page_size !== undefined ? Math.min(Math.max(Number(page_size), 0), 100) : 10; // default page size : 10 ,  max page size : 100

      const final_cursor: number | undefined = cursor !== undefined ? Number(cursor) : undefined;
      const users = await this.repository.findByCursorPagination(final_page_size, final_cursor);
      return res.json({
        data: users,
        meta_data: {
          next_cursor: 0,
          prev_cursor: 0,
        },
      });
    });
  }
}
