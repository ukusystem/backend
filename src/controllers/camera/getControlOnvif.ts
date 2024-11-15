import { Request, Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Camera } from '../../models/camera/';
import type { ControlPTZProps, CamMovements } from '../../models/camera/CamOnvif';

// Control  GET /camera/control?ctrl_id=number&cmr_id=number&action=start&movement=Right&velocity=0.5
export const getControlOnvif = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { action, cmr_id, ctrl_id, movement, velocity } = req.query as { ctrl_id: string; cmr_id: string; action: string; movement: string; velocity: string };

  await Camera.controlPTZ({
    action: action as ControlPTZProps['action'],
    cmr_id: Number(cmr_id),
    ctrl_id: Number(ctrl_id),
    velocity: Number(velocity),
    movement: movement as CamMovements,
  });

  res.json({ message: 'Movimiento exitoso' });
});
