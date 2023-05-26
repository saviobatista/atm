import { log, error } from "console";
import { readdirSync, writeFileSync } from "fs";
import { cpus } from "os";
import { Worker } from "worker_threads";
type Mark = {
  hex: string;
  lat: number;
  lon: number;
  alt: number;
  date: Date;
};
type Point = {
  lat: number;
  lon: number;
  alt: number;
};
const queue: { file: string; dir: string; aerodrome: string }[] = [];
var runners: number = 0;
const cpuCounter: number = cpus().length - 1;
const heatmap15: Point[][] = [];
const marks: Mark[] = [];
const next = () => {
  if (queue.length === 0 && runners === 0) {
    log("Finalizou fila");
    onFinish();
  }
  if (queue.length === 0 || runners >= cpuCounter) {
    return;
  }
  const data = queue.pop();
  new Worker("./src/services/goaround.ts", {
    workerData: data,
  })
    .on("message", onMessage)
    .on("error", onError)
    .on("exit", onExit);
  runners++;
  next();
};
const onMessage = (data: [Point[][], Mark[]]) => {
  heatmap15.push(...data[0]);
  marks.push(...data[1]);
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
  writeFileSync("../web/public/heatmap-ga15.json", JSON.stringify(heatmap15));
  writeFileSync("../web/public/markers-ga15.json", JSON.stringify(marks));
};
const goaround = async (dir: string, aerodrome: string) => {
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

export default goaround;
