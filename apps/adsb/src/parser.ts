import { log, error } from "console";
import { createWriteStream, readdirSync, readFile } from "fs";
import { cpus } from "os";
import { Worker } from "worker_threads";

const toMerge: string[] = [];
const queue: { file: string; dir: string; aerodrome: string }[] = [];
var runners: number = 0;
var packing: boolean = false;
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
const pack = () => {
  packing = true;
  const stream = createWriteStream("result.csv");
  stream
    .once("open", (descriptor) => {
      stream.write(
        Buffer.from(
          "HEX,CALLSIGN,MATRICULA,TIPO,RWY,RWY DATA,RWY SPD,15: 1nm DATA,15: 1nm SPD,15: 2nm DATA,15: 2nm SPD,15: 3nm DATA,15: 3nm SPD,15: 4nm DATA,15: 4nm SPD,15: 5nm DATA,15: 5nm SPD,15: 6nm DATA,15: 6nm SPD,15: 7nm DATA,15: 7nm SPD,15: 8nm DATA,15: 8nm SPD,15: 9nm DATA,15: 9nm SPD,15: 10nm DATA,15: 10nm SPD,33: 1nm DATA,33: 1nm SPD,33: 2nm DATA,33: 2nm SPD,33: 3nm DATA,33: 3nm SPD,33: 4nm DATA,33: 4nm SPD,33: 5nm DATA,33: 5nm SPD,33: 6nm DATA,33: 6nm SPD,33: 7nm DATA,33: 7nm SPD,33: 8nm DATA,33: 8nm SPD,33: 9nm DATA,33: 9nm SPD,33: 10nm DATA,33: 10nm SPD,D DATA,D SPD,B DATA,B SPD,A DATA,A SPD,E DATA,E SPD,F DATA,F SPD,H DATA,H SPD\n"
        )
      );
      for (const file of toMerge) {
        readFile(file, (err, data) => {
          if (err) {
            return error(err);
          }
          stream.write(data);
        });
      }
    })
    .once("finish", () => {
      log("terminou o merge");
      stream.close();
    });
};
const next = () => {
  if (queue.length === 0 && runners === 0) {
    return pack();
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

const parser = async (dir: string, aerodrome: string) => {
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

export default parser;
