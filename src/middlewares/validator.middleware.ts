import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const requestDataValidator =
  (validatorSchema: { bodySchema?: AnyZodObject; querySchema?: AnyZodObject; paramSchema?: AnyZodObject }, requestDataTypes: { hasBody?: boolean; hasQuery?: boolean; hasParam?: boolean } = { hasBody: false, hasParam: false, hasQuery: false }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hasBody, hasParam, hasQuery } = requestDataTypes;
      const { bodySchema, paramSchema, querySchema } = validatorSchema;
      // Validate  requests
      if (hasBody && bodySchema) await bodySchema.parseAsync(Object.keys(req.body).length === 0 ? undefined : req.body);
      if (hasParam && paramSchema) await paramSchema.parseAsync(Object.keys(req.params).length === 0 ? undefined : req.params);
      if (hasQuery && querySchema) await querySchema.parseAsync(Object.keys(req.query).length === 0 ? undefined : req.query);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // return res.status(400).send({ msg: error.issues[0].message } );
        return res.status(400).json(error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
      }
      // If error is not from zod then return generic error message
      return res.status(500).send('Error making request, contact support');
    }
  };
