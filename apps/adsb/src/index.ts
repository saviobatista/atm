import { error } from "console";
import parser from "./parser";
import filterPipe from "./services/filter-pipe";
import goaround from "./services/thread-goaround";
import heatmap from "./services/thread-heatmap";
export default {};

const DIR = "/data/log";

const runner = async () => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case "parse":
      parser(DIR, args[1]);
      break;
    case "heatmap":
      heatmap(DIR, args[1]);
      break;
    case "goaround":
      goaround(DIR, args[1]);
      break;
    case "reduce":
      filterPipe(DIR);
      break;
    default:
      error("Comando inválido", args);
      break;
  }
};
runner();
