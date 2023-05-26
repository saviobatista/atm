import { buffer, inside, lineString, point, polygon } from "@turf/turf";
import { log } from "console";
import { createReadStream, writeFileSync } from "fs";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { intData } from "../util";

const PRECISION = 5;
const KEY_MOMENT = 3;
type Coordinate = {
  lon: number;
  lat: number;
  alt: number;
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
type HeatMap = Point[];
const range = buffer(point([-47.134495535004085, -23.007423050106198]), 30, {
  units: "nauticalmiles",
});
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
type RuleTester = (lat: number, lon: number, alt?: number) => boolean;
type Rules = RuleTester[];
const rules: Rules = [
  // I - Pass FAF (5nm) MULTIPOINT ((-22.947277778 -47.218416667))
  (lat, lon) =>
    inside(
      point([lon, lat]),
      buffer(point([-47.218416667, -22.947277778]), 500, { units: "meters" })
    ),
  // II - Pass between 3 nm and THR 33 AND below 3000FT
  (lat, lon, alt) =>
    inside(
      point([lon, lat]),
      buffer(
        lineString([
          [-47.189671, -22.967757],
          [-47.12196619898169, -23.016386535516077],
        ]),
        25,
        { units: "meters" }
      )
    ) &&
    alt !== undefined &&
    alt < 3000,
  // III - Turn right at go around area
  (lat, lon, alt) =>
    inside(
      point([lon, lat]),
      polygon([
        [
          [-47.07930622337879, -23.047369846520844],
          [-47.21856125067573, -22.94746213723932],
          [-47.25807012067936, -22.976864030788075],
          [-47.08997097089766, -23.06360778081483],
          [-47.07930622337879, -23.047369846520844],
        ],
      ])
    ) &&
    alt !== undefined &&
    alt > 2500,
  // IV - Holding on KP104 MULTIPOINT ((-22.975577777999998 -47.356083333))
  (lat, lon) =>
    inside(
      point([lon, lat]),
      buffer(point([-47.356083333, -22.975577777999998]), 3, {
        units: "nauticalmiles",
      })
    ),
];
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
): Promise<[Point[][], Mark[]]> => {
  const database: Database = new Map<string, Aircraft>();
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
        alt = intData(data[11]),
        lat = parseFloat(data[14]),
        lon = parseFloat(data[15]),
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
        lat &&
        lon &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lon) &&
        alt &&
        alt < 8000 &&
        inside(point([lon, lat]), range)
      ) {
        aircraft.flights.at(-1)!.last = date;
        aircraft.flights.at(-1)!.path.push({
          alt,
          lat,
          lon,
          date,
        });
      }
      database.set(hex, aircraft);
    }
  }
  log("Terminou parse das linhas");
  log("Processando heatmap", new Date());
  const heatmap: Point[][] = [];
  const marks: Mark[] = [];
  database.forEach((aircraft, hex) => {
    aircraft.flights.forEach((flight) => {
      const passed: number[] = [];
      let moment: Mark;
      const points: Point[] = [];
      for (const { lon, lat, alt, date } of flight.path) {
        if (
          passed.length < rules.length &&
          rules[passed.length](lat, lon, alt)
        ) {
          passed.push(date);
          if (passed.length === KEY_MOMENT) {
            moment = { hex, lon, lat, alt, date: new Date(date) };
          }
        }
      }
      // if accomplished every rule
      if (passed.length == rules.length) {
        marks.push(moment!);
        heatmap.push([
          ...flight.path
            .filter(({ lat, lon }) =>
              inside(
                point([lon, lat]),
                buffer(point([-47.134495535004085, -23.007423050106198]), 25, {
                  units: "nauticalmiles",
                })
              )
            )
            .map(({ lat, lon, alt }) => ({
              lat,
              lon,
              alt,
            })),
        ]);
      }
    });
  });
  log("Terminou processamento de heatmap!", new Date());
  // writeFileSync(
  //   "heatmap-goaround-15.json",
  //   JSON.stringify(Array.from(heatmap.entries()))
  // );
  // writeFileSync("marker-goaround-15.json", JSON.stringify(marks));
  // writeFileSync("data-15.json", data15.join("\n"));
  return [heatmap, marks];
};
export default parseHeat;
