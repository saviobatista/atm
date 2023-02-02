import { error, log } from "console";
import { createReadStream, readdirSync } from "fs";
import { connect } from "mssql";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { parse } from "./parse";
import { update } from "./update";

export default {};

const runner = async () => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case "import":
      // Ideia:
      // HASHMAP de cada segundo
      // 00:00:00 cria um array com todos os sinais recebidos naquele delta de segundo
      // Insere todos de uma vez quando mudar o segundo, e antes de inserir apagar todos os dados que estiverem naquele momento
      log("Importando ADSB para banco de dados");
      log("Conectando...");
      await connect({
        //TODO: Fix this using process.env or something else
        server: "localhost",
        user: "sa",
        password: "NavTakp190!",
        connectionTimeout: 120000000,
        options: {
          trustedConnection: true,
          trustServerCertificate: true,
        },
        requestTimeout: 120000000,
        pool: {
          max: 1000,
          min: 1,
          idleTimeoutMillis: 120000000,
          acquireTimeoutMillis: 120000000,
          createTimeoutMillis: 120000000,
          destroyTimeoutMillis: 120000000,
          reapIntervalMillis: 120000000,
          createRetryIntervalMillis: 120000000,
        },
      });
      log("Varrendo pasta do ADSB...");
      for (const file of readdirSync("/home/savio/adsb-data")) {
        if (/\.csv\.gz$/g.test(file)) {
          log(file);
          const path = "/home/savio/adsb-data/" + file;
          const iface = createInterface({
            input: createReadStream(path).pipe(createGunzip()),
            crlfDelay: Infinity,
          });
          let moment: Date | undefined;
          const flights: [] = [];
          for await (const line of iface) {
            const data = parse(line);
            if (moment === undefined) {
              moment = data?.moment;
            }
            const flightIndex = flights.findIndex(
              (v) => v.aircraft === data?.aircraft
            );
            if (flightIndex === -1) {
              flights.push(data);
            } else {
              for (const key in data) {
                if (!["aircraft", "moment"].includes(key) && data[key] !== "") {
                  flights[flightIndex][key] = data[key];
                }
              }
            }
            if (data?.moment.toISOString() !== moment?.toISOString()) {
              // log(flights);
              // log(
              //   data?.moment,
              //   moment,
              //   data?.moment.toISOString() !== moment?.toISOString(),
              //   data?.moment !== undefined,
              //   flights?.length
              // );
              await update(flights);
              moment = data?.moment;
              flights.length = 0;
            }
          }

          // } catch (e: any) {
          //   log(e);
          //   log(data);
          //   throw new Error();
          // }
          log(`Arquivo ${file} finalizado`);
        }
      }

      break;
    default:
      error("Comando inválido", args);
      break;
  }
};
runner();
