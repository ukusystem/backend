import { NextFunction,Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Vms } from "../../models/vms";
import type { RequestWithUser } from "../../types/requests";

export const getPreferencias = asyncErrorHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user!; // ! -> anteponer middleware auth
    const preferencias = await Vms.getPreferencias({ u_id: user.u_id });
    res.json(preferencias)
  }
);
