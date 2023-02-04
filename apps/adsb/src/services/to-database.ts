import { Database } from "../types";
import { PrismaClient } from "@prisma/client";

const toDatabase = async (
  client: PrismaClient,
  database: Database
): Promise<void> => {
  for (const [modes, { flights, registration, type, aerodrome }] of database) {
    for (const {
      id,
      callsign,
      date,
      destination,
      origin,
      time,
      path,
      rwy,
      geo,
    } of flights) {
      if (id !== "" && geo.get("15-33")) {
        // // Only those registered on TATIC
        // const geoPath = `MULTILINESTRING ((${path
        //   .map(
        //     (v) => v.latitude && v.latitude && `${v.longitude} ${v.latitude}`
        //   )
        //   .filter((v) => v !== undefined)
        //   .join(", ")}))`;
        try {
          await client.$queryRaw`DELETE FROM [adsb].[Flight] WHERE [id] LIKE ${id}`;
          await client.$queryRaw`DELETE FROM [adsb].[FlightLog] WHERE [flight] LIKE ${id}`;
          // await client.$queryRaw`INSERT INTO [adsb].[Flight] ([id],[aerodrome],[modes],[type],[registration],[callsign],[origin],[destination],[date],[time],[path]) VALUES(${id},${aerodrome},${modes},${type},${registration},${callsign},${origin},${destination},${date},${time},GEOGRAPHY::STMLineFromText(${geoPath},4326))`;
          await client.$queryRaw`INSERT INTO [adsb].[Flight] ([id],[aerodrome],[modes],[type],[registration],[callsign],[origin],[destination],[date],[time],[rwy]) VALUES(${id},${aerodrome},${modes},${type},${registration},${callsign},${origin},${destination},${date},${time},${rwy})`;
        } catch (e) {
          console.error("ERRO NA QUERY", e);
        }
        for (const [
          label,
          { date, longitude, latitude, altitude, leaving, speed, out },
        ] of geo) {
          try {
            if (leaving) {
              await client.$queryRaw`INSERT INTO [adsb].[FlightLog] ([flight],[waypoint],[date],[position],[speed],[altitude],[last],[out]) VALUES (${id},${label},${date},geography::Point(${latitude}, ${longitude}, 4326),${speed},${altitude},${leaving},${out})`;
            } else {
              await client.$queryRaw`INSERT INTO [adsb].[FlightLog] ([flight],[waypoint],[date],[position],[speed],[altitude],[out]) VALUES (${id},${label},${date},geography::Point(${latitude}, ${longitude}, 4326),${speed},${altitude},${out})`;
            }
          } catch (e) {
            console.error("ERRO NA QUERY", e);
          }
        }
      }
    }
  }
};

export default toDatabase;
