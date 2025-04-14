import { GeneralMulterMiddlewareArgs } from '../../middlewares/multer.middleware';

export const multerCreatePersonalArgs: GeneralMulterMiddlewareArgs = {
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  bodyFields: ['form'],
  fields: [{ name: 'files', maxCount: 1 }],
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5MB
    fieldSize: 5 * 1024 * 1024, // 5MB
  },
};
