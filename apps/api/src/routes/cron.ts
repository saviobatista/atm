import { Router } from "express";
import { log } from "console";
import info from "../services/tatic/info";
import iepv10034 from "../services/tatic/iepv-100-34";
import contagem from "../services/tatic/contagem";

export default Router()
  .use(async (req, res, next) => {
    log("Serviço de rotina chamado");
    next();
  })
  .get("/daily", async (req, res) => {
    const lastUpdate = await info();
    if (
      lastUpdate.substring(0, 10) !== new Date().toISOString().substring(0, 10)
    ) {
      return res
        .status(500)
        .send("Banco de dados desatualizado! Ultimo update: " + lastUpdate);
    } else {
      const iepv = await iepv10034(new Date(lastUpdate.substring(0, 10)));
      const contagem0 = await contagem(0, 1);
      const contagem14 = await contagem(14, 1);

      return res.json("ok");
    }
  });
