import { error } from "console";
import parser from "./parser";
import filterPipe from "./services/filter-pipe";
import goaround from "./services/thread-goaround";
import heatmap from "./services/thread-heatmap";
export default {};

const runner = async () => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case "parse":
      parser("/home/savio/adsb-data", args[1]);
      break;
    case "heatmap":
      heatmap("/home/savio/adsb-data", args[1]);
      break;
    case "goaround":
      goaround("/home/savio/adsb-data", args[1]);
      break;
    case "reduce":
      filterPipe("/home/savio/adsb-data");
      break;
    default:
      error("Comando inválido", args);
      break;
  }
};
runner();
