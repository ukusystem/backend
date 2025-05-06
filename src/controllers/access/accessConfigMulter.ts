import { GeneralMulterMiddlewareArgs } from '../../middlewares/multer.middleware';

export const multerAccessImportArgs: GeneralMulterMiddlewareArgs = {
  allowedMimeTypes: ['application/json'],
  bodyFields: ['form'],
  fields: [{ name: 'files', maxCount: 1 }],
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 5 * 1024 * 1024, // 5MB
  },
};
