import { PrismaClient } from "@prisma/client";
import { log } from "console";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { createGunzip } from "zlib";
import { GeoPosition, Aircraft, Database } from "../types";
import { intData, toPosition } from "../util";
import { getAircraft } from "./get-aircraft";
import {
  getFlightFromDatabase,
  getFlightFromDatabaseWithCallsign,
} from "./get-flight";

const parseSBS = async (
  client: PrismaClient,
  file: string,
  dir: string,
  aerodrome: string
): Promise<Database> => {
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
        ),
        callsign = data[10].trim(),
        altitude = intData(data[11]),
        speed = intData(data[12]),
        track = intData(data[13]),
        position = toPosition(data[14], data[15]),
        latitude = parseFloat(data[14]),
        longitude = parseFloat(data[15]),
        vertical = intData(data[16]),
        ground = data[21] === "-1",
        type = data[1];
      //Initialize
      if (database.get(hex) === undefined) {
        database.set(hex, {
          aerodrome,
          modes: hex,
          flights: [],
          ...(await getAircraft(client, hex)),
        });
      }
      const aircraft = database.get(hex)!;
      //If more than X minutes since last position report, It's a new flight
      if (
        aircraft.flights.length === 0 ||
        // aircraft.flights.at(-1)!.path.length === 0 ||
        (aircraft.flights.at(-1)!.path.length > 0 &&
          Math.abs(
            aircraft.flights.at(-1)!.path.at(-1)!.date!.getTime() -
              date.getTime()
          ) > 1_200_000)
      ) {
        // const { id, callsign, origin, destination, time, rwy } =
        //   await getFlightFromDatabase(client, aircraft.registration, date);
        aircraft.flights.push({
          id: aircraft.registration,
          callsign,
          origin:"",
          destination:"",
          time:new Date(),
          rwy:"",
          path: [],
          geo: new Map<string, GeoPosition>(),
          date: new Date(data[6].replaceAll("/", "-")),
        });
      }
      // Register position
      switch (type) {
        // case "1": // ES Identification and Category, fields: CallSign
        //   if (callsign !== "") {
        //     const newFlightData = await getFlightFromDatabaseWithCallsign(
        //       client,
        //       callsign,
        //       date
        //     );
        //     if (newFlightData) {
        //       aircraft.flights.at(-1)!.id = newFlightData.id!;
        //       aircraft.flights.at(-1)!.callsign = newFlightData.callsign;
        //       aircraft.flights.at(-1)!.origin = newFlightData.origin;
        //       aircraft.flights.at(-1)!.destination = newFlightData.destination;
        //       aircraft.flights.at(-1)!.time = newFlightData.time;
        //       aircraft.flights.at(-1)!.rwy = newFlightData.rwy;
        //       aircraft.flights.at(-1)!.time = newFlightData.time;
        //     }
        //   }
        //   break;
        case "2": // ES Surface Position Message, fields: Alt, GS, Trk, Lat, Lng, Gnd
          if (
            latitude &&
            longitude &&
            !Number.isNaN(latitude) &&
            !Number.isNaN(longitude)
          ) {
            aircraft.flights.at(-1)!.path.push({
              date,
              altitude,
              latitude,
              longitude,
              speed,
              track,
              ground,
            });
          }
          break;
        case "3": // ES Airborne Position Message, fields: Alt, Lat, Lng, Alrt, Emer, SPI, Gng
          if (
            latitude &&
            longitude &&
            !Number.isNaN(latitude) &&
            !Number.isNaN(longitude)
          ) {
            aircraft.flights.at(-1)!.path.push({
              date,
              altitude,
              latitude,
              longitude,
              ground,
            });
          }
          break;
        case "4": // ES Airborne Velocity Message, fields: GS, Trk, VR
          if (aircraft.flights.at(-1) && aircraft.flights.at(-1)!.path.at(-1)) {
            aircraft.flights[aircraft.flights.length - 1].path[
              aircraft.flights[aircraft.flights.length - 1].path.length - 1
            ] = {
              ...aircraft.flights.at(-1)!.path.at(-1)!,
              speed,
              vertical,
              track,
            };
          }
        default:
          break;
      }

      database.set(hex, aircraft);
    }
  }
  return database;
};
export default parseSBS;
