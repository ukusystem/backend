import { Router } from "express";
import { resolve } from "path";
export const frontEndRoutes = Router();

const allFrontEndPaths = [
"/",
"/auth/login",
"/auth/forgot-password",
"/dashboard",
"/vms",
"/tickets",
"/tickets/historial",
"/smartmap",
"/logs",
"/invitado/tickets",
"/invitado/tickets/historial",
"/site/:ctrl_id",
];

frontEndRoutes.get(allFrontEndPaths, (req, res) => {
  res.sendFile(resolve(__dirname, "../../public/index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});
