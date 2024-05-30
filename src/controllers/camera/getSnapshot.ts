import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Camera } from "../../models/camera/";


//Snapshot GET /camera/snapshot/:xctrl_id/:xip
export const getSnapshot= asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { xctrl_id, xip } = req.params;
    const imgBuffer = await Camera.getSnapshotByCtrlIdAndIp({
      ctrl_id: parseInt(xctrl_id, 10),
      ip: xip,
    });
    res.set("Content-Type", "image/jpeg");
    res.send(imgBuffer);
  }
);
