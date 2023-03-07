import {
  buffer,
  Feature,
  inside,
  Point,
  point,
  polygon,
  Polygon,
  Properties,
} from "@turf/turf";
import { log } from "console";
import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";
import { workerData, parentPort } from "worker_threads";
import { createGunzip } from "zlib";

interface Aerodrome {
  icao: string;
  range: Feature<Polygon>;
  runways: { label: string; polygon: Feature<Polygon> }[];
  taxiways: { label: string; polygon: Feature<Polygon>; runways: string[] }[];
  waypoints: { label: string; polygon: Feature<Polygon>; runways: string[] }[];
}

class SBKP implements Aerodrome {
  icao = "SBKP";
  range = buffer(point([-47.134495535004085, -23.007423050106198]), 20, {
    units: "nauticalmiles",
  });
  runways = [
    {
      label: "15",
      polygon: polygon([[]]),
    },
    {
      label: "33",
      polygon: polygon([[]]),
    },
  ];
  taxiways = [
    {
      label: "A",
      polygon: polygon([[]]),
      runways: ["15", "33"],
    },
    {
      label: "B",
      polygon: polygon([[]]),
      runways: ["15", "33"],
    },
    {
      label: "D",
      polygon: polygon([[]]),
      runways: ["15"],
    },
    {
      label: "H",
      polygon: polygon([[]]),
      runways: ["15"],
    },
    {
      label: "E",
      polygon: polygon([[]]),
      runways: ["33"],
    },
    {
      label: "F",
      polygon: polygon([[]]),
      runways: ["33"],
    },
  ];
  waypoints = [
    {
      label: "15 1",
      polygon: polygon([[]]),
      runways: ["15"],
    },
  ];
}

type CallSigns = Map<
  string,
  {
    date: Date;
    callsign: string;
  }
>;

type FlightData = {
  date: string;
  hex: string;
  latitude: string;
  longitude: string;
  callsign: string;
  altitude: string;
  speed: string;
  track: string;
  vertical: string;
  ground: string;
};

type Path = {
  altitude: string;
  longitude: string;
  latitude: string;
  point: Point;
};

type Flight = {
  origin: string;
  destination: string;
  date: string;
  time: string;
  path: Path[];
  waypoints: Waypoint[];
};

type Aircraft = {
  hex: string;
  flights: Flight[];
};

type Database = Map<string, Aircraft>;

type AircraftMap = Map<string, FlightData>;

const reducer = async (): Promise<void> => {
  const range = buffer(point([-23.007423050106198, -47.134495535004085]), 20, {
    units: "nauticalmiles",
  });
  const db: AircraftMap = new Map<string, FlightData>();
  const callsigns: CallSigns = new Map();
  const { file, dir, aerodrome } = workerData;

  log(`${new Date().toISOString()} - Working on ${file}`);

  const iface = createInterface({
    input: createReadStream(dir + "/" + file).pipe(createGunzip()),
  });
  const writer = createWriteStream(
    `tmp/${aerodrome}_${file.replace("adsb_log.", "").replace(".gz", "")}`
  );
  var currentDate: string = "";

  for await (const line of iface) {
    if (line.length === 0) continue;
    const [
      msg,
      type,
      sessionId,
      aircraftId,
      hex,
      flightId,
      dateGenerated,
      timeGenerated,
      dateLogged,
      timeLogged,
      callsign,
      altitude,
      speed,
      track,
      latitude,
      longitude,
      vertical,
      squawk,
      alert,
      emergency,
      spi,
      onGround,
    ] = line.split(",");
    const date =
        dateGenerated.replaceAll("/", "-") +
        " " +
        timeGenerated.substring(0, 8),
      ground = onGround === "-1" ? "true" : "false",
      data = new Date(dateGenerated + " " + timeGenerated.substring(0, 8));
    if (currentDate !== date) {
      if (currentDate !== "") {
        for (const {
          date,
          hex,
          latitude,
          longitude,
          callsign,
          altitude,
          speed,
          track,
          vertical,
          ground,
        } of db.values()) {
          if (
            (altitude === "" || parseInt(altitude) < 10000) &&
            latitude !== "" &&
            longitude !== "" &&
            inside(point([parseFloat(latitude), parseFloat(longitude)]), range)
          ) {
            writer.write(
              `${date},${hex},${latitude},${longitude},${callsign},${altitude},${speed},${track},${vertical},${ground}\r\n`
            );
          }
        }
      }
      db.clear();
      currentDate = date;
    }
    const flight = db.get(hex) || {
      hex,
      date,
      altitude: "",
      latitude: "",
      longitude: "",
      callsign: "",
      ground: "",
      speed: "",
      track: "",
      vertical: "",
    };
    if (callsign !== "") {
      flight.callsign = callsign.trim();
      callsigns.set(hex, {
        date: data,
        callsign: callsign.trim(),
      });
    } else if (
      callsigns.get(hex) &&
      data.getTime() - callsigns.get(hex)!.date.getTime() < 600_000
    ) {
      flight.callsign = callsigns.get(hex)!.callsign;
    }
    if (altitude !== "") flight.altitude = altitude;
    if (latitude !== "") flight.latitude = latitude;
    if (longitude !== "") flight.longitude = longitude;
    if (onGround !== "") flight.ground = onGround;
    if (speed !== "") flight.speed = speed;
    if (track !== "") flight.track = track;
    if (vertical !== "") flight.vertical = vertical;

    db.set(hex, flight);
  }
  writer.close();
  parentPort?.postMessage(`${new Date().toISOString()} - ${file} reduzido`);
};
reducer();
