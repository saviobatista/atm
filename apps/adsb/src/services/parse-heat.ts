import { buffer, inside, point, polygon } from "@turf/turf";
import { log } from "console";
import { createReadStream, writeFileSync } from "fs";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { intData } from "../util";

const PRECISION = 5;
type Coordinate = {
  longitude: number;
  latitude: number;
  altitude?: number;
  date: number;
};
type Flight = {
  first: number;
  last: number;
  path: Coordinate[];
};
type Aircraft = {
  flights: Flight[];
};
type Database = Map<string, Aircraft>;
type HeatMap = Map<string, number>;
const range = buffer(point([-47.134495535004085, -23.007423050106198]), 20, {
  units: "nauticalmiles",
});
const out = polygon([
  [
    [-47.14717986998959, -22.998629623249226],
    [-47.14841712141666, -22.9998693623439],
    [-47.12321493636139, -23.017988925787563],
    [-47.12205442406751, -23.01662609513338],
    [-47.14717986998959, -22.998629623249226],
  ],
]);
const rwy = polygon([
  [
    [-47.146876, -22.998268],
    [-47.147161, -22.99861],
    [-47.122126, -23.016567],
    [-47.121822, -23.016202],
    [-47.146876, -22.998268],
  ],
]);
const z15 = polygon([
  [
    [-47.122124637880184, -23.01656718344833],
    [-47.12744930456177, -23.02358422024569],
    [-47.11687387122577, -23.03483054085688],
    [-47.09685275354766, -23.011844909374442],
    [-47.121821647754636, -23.016199435589993],
    [-47.122124637880184, -23.01656718344833],
  ],
]);
const z33 = polygon([
  [
    [-47.14687218052257, -22.99827014010319],
    [-47.14718146356129, -22.998632426690868],
    [-47.15259779407874, -23.004475158351553],
    [-47.17298922950659, -22.997908916737693],
    [-47.154229197182595, -22.979413517248016],
    [-47.14687218052257, -22.99827014010319],
  ],
]);
const parseHeat = async (
  file: string,
  dir: string,
  aerodrome: string
): Promise<[Map<string, number>, Map<string, number>]> => {
  const database: Database = new Map<string, Aircraft>();
  const data15: string[] = [];
  const data33 = [];
  const path = dir + "/" + file;
  const iface = createInterface({
    input: createReadStream(path).pipe(createGunzip()),
  });
  for await (const line of iface) {
    const data = line.split(",");
    if (data.length >= 21) {
      // Extract data from line string
      const hex = data[4],
        date = new Date(
          data[6].replaceAll("/", "-") + " " + data[7] //Future use with map for date half second: .substring(0, 8) + "." + (parseInt(data[7].substring(9,10))>=5?"5":"0")
        ).getTime(),
        altitude = intData(data[11]),
        latitude = parseFloat(data[14]),
        longitude = parseFloat(data[15]),
        type = data[1];
      //Initialize
      if (!database.get(hex)) {
        database.set(hex, {
          flights: [],
        });
      }
      const aircraft = database.get(hex)!;
      //If more than X minutes since last position report, It's a new flight
      if (
        aircraft.flights.length === 0 ||
        (aircraft.flights.at(-1)!.path.length > 0 &&
          Math.abs(aircraft.flights.at(-1)!.last! - date) > 1_200_000)
      ) {
        aircraft.flights.push({
          first: date,
          last: date,
          path: [],
        });
      }
      if (
        ["2", "3"].includes(type) &&
        latitude &&
        longitude &&
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude) &&
        // (!altitude || altitude < 8000) &&
        inside(point([longitude, latitude]), range)
      ) {
        aircraft.flights.at(-1)!.last = date;
        aircraft.flights.at(-1)!.path.push({
          altitude,
          latitude,
          longitude,
          date,
        });
      }
      database.set(hex, aircraft);
    }
  }
  log("Terminou parse das linhas");
  log("Processando heatmap", new Date());
  const heatmap15 = new Map<string, number>();
  const heatmap33 = new Map<string, number>();
  database.forEach((aircraft) => {
    aircraft.flights.forEach((flight) => {
      if (flight.path.length > 0) {
        // Define if flight is dep and which thr it is
        let wasOut = false;
        let wasIn = false;
        let wasIn15 = false;
        let wasIn33 = false;
        for (const { longitude, latitude } of flight.path) {
          if (longitude && latitude) {
            const p = point([
              parseFloat(longitude.toFixed(3)),
              parseFloat(latitude.toFixed(3)),
            ]);
            if (!wasOut && inside(p, out)) wasOut = true;
            else if (wasOut && !wasIn && inside(p, rwy)) wasIn = true;
            else if (wasOut && wasIn && !wasIn33 && inside(p, z15))
              wasIn15 = true;
            else if (wasOut && wasIn && !wasIn15 && inside(p, z33))
              wasIn33 = true;
          }
        }
        if (wasIn15 || wasIn33) {
          for (const { longitude, latitude } of flight.path) {
            const hash = `${latitude.toFixed(PRECISION)},${longitude.toFixed(
              PRECISION
            )}`;
            if (wasIn15) {
              heatmap15.set(hash, (heatmap15.get(hash) ?? 0) + 1);
              data15.push(`new google.maps.LatLng(${hash}),`);
            } else if (wasIn33) {
              heatmap33.set(hash, (heatmap33.get(hash) ?? 0) + 1);
              data33.push(`new google.maps.LatLng(${hash}),`);
            }
          }
        }
      }
    });
  });
  log("Terminou processamento de heatmap!", new Date());
  writeFileSync(
    "heatmap-data-15.json",
    JSON.stringify(Array.from(heatmap15.entries()))
  );
  writeFileSync(
    "heatmap-data-33.json",
    JSON.stringify(Array.from(heatmap33.entries()))
  );
  // writeFileSync("data-15.json", data15.join("\n"));
  return [heatmap15, heatmap33];
};
export default parseHeat;
