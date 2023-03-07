import { log, error } from "console";
import { createWriteStream, readdirSync, readFile, writeFileSync } from "fs";
import { cpus } from "os";
import { Worker } from "worker_threads";

const queue: { file: string; dir: string; aerodrome: string }[] = [];
var runners: number = 0;
const cpuCounter: number = cpus().length - 1;
const heatmap15: Map<string, number> = new Map<string, number>();
const heatmap33: Map<string, number> = new Map<string, number>();
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
    log("Finalizou fila");
    onFinish();
  }
  if (queue.length === 0 || runners >= cpuCounter) {
    return;
  }
  const data = queue.pop();
  new Worker("./src/services/heatmap.ts", {
    workerData: data,
  })
    .on("message", onMessage)
    .on("error", onError)
    .on("exit", onExit);
  runners++;
  next();
};
const onMessage = (data: [Map<string, number>, Map<string, number>]) => {
  for (const [key, amount] of data[0]) {
    heatmap15.set(key, (heatmap15.get(key) ?? 0) + amount);
  }
  for (const [key, amount] of data[1]) {
    heatmap33.set(key, (heatmap33.get(key) ?? 0) + amount);
  }
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
const onFinish = () => {
  console.log("Finalizou tudo mesmo");
  writeFileSync(
    "heatmap15.json",
    JSON.stringify(Array.from(heatmap15.entries()))
  );
  writeFileSync(
    "heatmap33.json",
    JSON.stringify(Array.from(heatmap33.entries()))
  );
};
const heatmap = async (dir: string, aerodrome: string) => {
  log(`${aerodrome} - ${new Date().toISOString()}`);
  log("Varrendo pasta do ADSB...");
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex > -1 ? process.argv[patternIndex + 1] : "";
  const regex = new RegExp(`${pattern}.csv.gz$`, "g");
  for (const file of readdirSync(dir)) {
    if (regex.test(file)) {
      queue.push({ file, dir, aerodrome });
    }
  }
  log("Pasta do ADSB varrida");
  next();
};

export default heatmap;
