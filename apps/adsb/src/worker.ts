import { log } from "console";
import { workerData, parentPort } from "worker_threads";
import { PrismaClient } from "@prisma/client";
import toDatabase from "./services/to-database";
import toKML from "./services/to-kml";
import parseSBS from "./services/parse-sbs";
import parseGeo from "./services/parse-geo";

const worker = async () => {
  const { file, dir, aerodrome } = workerData;
  log(`Worker para ${file}`);

  const client = new PrismaClient({
    // log: ["query"]
});
  log(`${new Date().toISOString()} - ${file}: Processando Basestation`);
  const database = await parseSBS(client, file, dir, aerodrome);
  log(
    `${new Date().toISOString()} - ${file}: Processando posições geográficas relevantes`
  );
  const database2 = await parseGeo(client, database, aerodrome);
  log(
    `${new Date().toISOString()} - ${file}: Armazenando dados no banco de dados`
  );
  await toDatabase(client, database2);
  await client.$disconnect();
  // if(process.argv.includes('--kml')){
  log(`${new Date().toISOString()} - ${file}: TO KML`);
  toKML(database2);
  // }

  parentPort?.postMessage(`Arquivo ${file} finalizado`);
};

worker();
