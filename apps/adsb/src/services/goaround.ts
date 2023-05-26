import { log } from "console";
import { workerData, parentPort } from "worker_threads";
import parseHeat from "./parse-ga15";
const worker = async () => {
  const { file, dir, aerodrome } = workerData;
  log(`Worker para ${file}`);

  log(`${new Date().toISOString()} - ${file}: Processando Basestation`);
  parentPort?.postMessage(await parseHeat(file, dir, aerodrome));
};

worker();
