import { Router } from "express";
import { createReadStream, readFileSync } from "fs";
import { connect } from "mssql";
import { gunzipSync } from "zlib";
import info from "../services/tatic/info";
import config from "../util/config";
import parse from "../services/adsb/parse";
import update from "../services/adsb/update";
import { createInterface } from "readline";

export default Router()
  /**
   * GET /info
   * Informa última registro de movimento no banco do TATIC,
   * util para saber se o backup está atualizado e funcionando
   */
  .get("/info", async (req, res) => {
    const lastUpdate = await info();
    if (
      lastUpdate.substring(0, 10) !== new Date().toISOString().substring(0, 10)
    ) {
      return res
        .status(500)
        .send("Banco de dados desatualizado! Ultimo update: " + lastUpdate);
    } else {
      return res.json({ lastUpdate });
    }
  })
  .get("/healthz", (req, res) => {
    return res.json({ ok: true });
  })
  .get("/parse", async (req, res) => {
    console.log("Carregando csv");
    // const lines = gunzipSync(readFileSync("../../adsb_log.20221003.csv.gz"))
    const iface = createInterface({
      input: createReadStream("../../adsb_log.20221003.csv"),
      crlfDelay: Infinity,
    });

    // const lines = readFileSync("../../adsb_log.20221003.csv", "utf-8")
    //   .split("\n")
    //   .filter(Boolean);
    console.log("Conectando e enviando updates");
    let pool = await connect(config);
    var n = 0;

    // for (const line of lines) {
    for await (const line of iface) {
      // Each line in input.txt will be successively available here as `line`.
      // console.log(`Line from file: ${line}`);
      if (n % 100000 == 0) {
        // await pool.close();
        console.log(`#${n}`);
        await new Promise((r) => setTimeout(r, 2000));
        // pool = await connect(config);
      }
      const data = parse(line);
      if (data) {
        await update(pool, data);
      } else {
        console.log("nao deu parse", data, line);
      }
      n++;
    }
    await pool.close();
    console.log("finalizado");
    return res.send({ ok: true });
  });
