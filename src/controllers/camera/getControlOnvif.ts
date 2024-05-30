import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Camera } from "../../models/camera/";
import type { ControlPTZProps , CamMovements } from "../../models/camera/CamOnvif";


// Control  GET /camera/control/:xctrl_id/:xip/:xaction/:xmovement/:xvelocity
export const getControlOnvif = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { xaction, xmovement, xvelocity, xip, xctrl_id } = req.params;
          
    await Camera.controlPTZByActionAndVelocityAndMovementAndNodoAndIp({
      action: xaction as ControlPTZProps["action"],
      velocity: Number(xvelocity),
      movement: xmovement as CamMovements,
      ctrl_id: Number(xctrl_id),
      ip: xip,
    });

    res.json({ message: "Movimiento exitoso" });
  }
);

