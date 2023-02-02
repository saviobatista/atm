import { log } from "console";
import { createWriteStream } from "fs";
import { SBKP } from "../ad/sbkp";
import { Aircraft } from "../types";
const desired: string[] = [
  "A339",
  "B763",
  "A332",
  "B744",
  "MD11",
  "B748",
  "B77L",
  "B762",
  "A333",
  "A359",
  "B77W",
  "B767",
  "AT76",
  "A20N",
  "A320",
  "B38M",
  "B738",
  "B733",
  "B737",
  "B734",
  "B788",
  "E195",
  "E190",
  "E295",
  "A321",
  "A21N",
];
const deltaT = (a: Date, b: Date): number =>
  Math.round(Math.abs(a.getTime() - b.getTime()) / 1_000);
const toCSV = async (
  file: string,
  database: Map<string, Aircraft>
): Promise<void> => {
  log(`Parsing done. Writing to CSV file...`);
  const stream = createWriteStream(`resultado-${file.replace(".gz", "")}`);

  const keys = [
    "HEX",
    "CALLSIGN",
    "MATRICULA",
    "TIPO",
    "RWY",
    "RWY DATA",
    "RWY HORA",
    "RWY ΔT",
    "RWY SPD",
  ];

  for (const point of SBKP.points) {
    keys.push(`${point.label} ΔT`, `${point.label} SPD`);
  }
  for (const point of SBKP.taxiways) {
    keys.push(`${point[0]} ΔT`, `${point[0]} SPD`);
  }
  const printHeaders = true;
  if (printHeaders) {
    stream.write(keys.join(",") + "\r\n");
  }
  for (const [hex, aircraft] of database) {
    for (const flight of aircraft.flights) {
      const csv = [
        aircraft.modes,
        flight.callsign,
        aircraft.registration,
        aircraft.type,
        flight.rwy,
        flight.geo.get("RWY")?.date.toISOString().substring(0, 10) ?? "",
        flight.geo.get("RWY")?.date.toISOString().substring(11, 19) ?? "",
        flight.geo.get("RWY") && flight.geo.get("OCUPYRWY")
          ? deltaT(
              flight.geo.get("RWY")!.date,
              flight.geo.get("OCUPYRWY")!.date
            )
          : "",
        flight.geo.get("RWY")?.speed ?? "",
      ];
      if (hex === "E4910B") {
        console.log({ ...flight.geo });
      }
      for (const { label } of SBKP.points) {
        if (hex === "E4910B") {
          console.log(label, flight.geo.get(label));
        }
        csv.push(
          flight.geo.get(label) && flight.geo.get("RWY")
            ? deltaT(flight.geo.get("RWY")!.date, flight.geo.get(label)!.date)
            : "",
          flight.geo.get(label)?.speed ?? ""
        );
      }
      for (const [label, point] of SBKP.taxiways) {
        csv.push(
          flight.geo.get(label) && flight.geo.get("RWY")
            ? deltaT(flight.geo.get("RWY")!.date, flight.geo.get(label)!.date)
            : "",
          flight.geo.get(label)?.speed ?? ""
        );
      }
      if (
        flight.geo.get("RWY") &&
        desired.includes(aircraft.type) &&
        flight.rwy === "15"
      ) {
        stream.write(csv.join(",") + "\r\n");
      }
    }
  }
  stream.close();
};
export default toCSV;
