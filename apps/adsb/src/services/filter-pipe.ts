import { cpus } from "os";
import { log, error } from "console";
import { Worker } from "worker_threads";
import { readdirSync } from "fs";
import { QueueItem } from "../types";

const maxWorkers: number = cpus().length - 2;
const queue: QueueItem[] = [];
var runners: number = 0;

const next = () => {
  if (queue.length === 0 && runners === 0) {
    log(`${new Date().toISOString()} - Queue empty and done.`);
  }
  if (queue.length === 0 || runners >= maxWorkers) {
    return;
  }
  const workerData = queue.pop();
  if (workerData === undefined) {
    return;
  }
  new Worker("./src/services/reduce-basestation.ts", {
    workerData,
  })
    .on("message", onMessage)
    .on("error", onError)
    .on("exit", onExit);
  runners++;
  next();
};
const onMessage = (message: any) => {
  log(`Recebeu mensagem do worker: ${message}`);
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

const filterPipe = async (dir: string): Promise<void> => {
  const args = process.argv.slice(2);
  const aerodrome = args[1];

  log(`${new Date().toISOString()} - Pipe filter running`);

  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex > -1 ? process.argv[patternIndex + 1] : "";
  const regex = new RegExp(`${pattern}.csv.gz$`, "g");

  for (const file of readdirSync(dir)) {
    const t = file;
    if (regex.test(t)) {
      console.info(t, regex.test(t));
      console.log("added");
      queue.push({ file: t, dir, aerodrome });
    }
  }
  log(`Queue filled up with ${queue.length} files.`);
  next();
};

export default filterPipe;
