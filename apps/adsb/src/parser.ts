import { log, error } from "console";
import { createWriteStream, readdirSync, readFile } from "fs";
import { cpus } from "os";
import { Worker } from "worker_threads";

const queue: { file: string; dir: string; aerodrome: string }[] = [];
var runners: number = 0;
const cpuCounter: number = cpus().length - 1;

class MultiThread {
  max: number;
  runners: number = 0;
  queue: { file: string; dir: string }[] = [];

  constructor() {
    this.max = cpus().length;
  }

  addQueue() {}
}
const next = () => {
  if (queue.length === 0 && runners === 0) {
    // log("Finalizou fila");
  }
  if (queue.length === 0 || runners >= cpuCounter) {
    return;
  }
  const data = queue.pop();
  new Worker("./src/worker.ts", {
    workerData: data,
  })
    .on("message", onMessage)
    .on("error", onError)
    .on("exit", onExit);
  runners++;
  next();
};
const onMessage = (message: any) => {
  // log(`Recebeu mensagem do worker: ${message}`);
  log(message);
};
const onError = (info: any) => {
  error(info);
};
const onExit = (code: any) => {
  runners--;
  if (code !== 0) {
    error(`Worker stopped with exit code ${code}`);
  }
  next();
};

const parser = async (dir: string, aerodrome: string) => {
  log(`${aerodrome} - ${new Date().toISOString()}`);
  // log("Varrendo pasta do ADSB...");
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex > -1 ? process.argv[patternIndex + 1] : "";
  const regex = new RegExp(`${pattern}.csv.gz$`, "g");
  for (const file of readdirSync(dir)) {
    if (regex.test(file)) {
      queue.push({ file, dir, aerodrome });
    }
  }
  // log("Pasta do ADSB varrida");
  next();
};

export default parser;
