import { error } from "console";
import parser from "./parser";
export default {};

const runner = async () => {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case "parse":
      parser("/home/savio/adsb-data", args[1]);
      break;
    default:
      error("Comando inválido", args);
      break;
  }
};
runner();
