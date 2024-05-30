import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Camera } from "../../models/camera/";


// PresetFunction GET /camera/preset/:xctrl_id/:xip/:xnum_preset
export const getPresetOnvif = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { xctrl_id, xip, xnum_preset } = req.params;
    await Camera.gotoPresetPTZByNumPresetAndNodoAndIp({
      n_preset: xnum_preset,
      ctrl_id: Number(xctrl_id),
      ip: xip,
    });
    res.json({ message: "Movimiento exitoso" });
  }
);
