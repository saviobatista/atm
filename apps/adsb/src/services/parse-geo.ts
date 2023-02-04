import { inside, point } from "@turf/turf";
import { PrismaClient } from "database";
import { Database, Place } from "../types";
import getPlaces from "./get-places";

const parseGeo = async (
  client: PrismaClient,
  database: Database,
  aerodrome: string
): Promise<Database> => {
  //Grab valid targets from database aerodrome
  const places: Place[] = await getPlaces(client, aerodrome);
  // Cross paths with relevant points (rwys, twys, wp)
  for (const [hex, aircraft] of database) {
    for (const idx in aircraft.flights) {
      const flight = aircraft.flights[idx];
      for (const idx2 in flight.path) {
        const { latitude, longitude, date, speed, altitude } =
          flight.path[idx2];
        if (
          longitude &&
          latitude &&
          !Number.isNaN(latitude) &&
          !Number.isNaN(longitude)
        ) {
          const position = point([longitude, latitude]);
          for (const place of places) {
            if (inside(position, place.polygon)) {
              const current = flight.geo.get(place.label);
              if (!current) {
                flight.geo.set(place.label, {
                  latitude,
                  longitude,
                  date,
                  speed,
                  altitude,
                });
              } else {
                flight.geo.set(place.label, { ...current, leaving: date });
              }
            } else if (
              place.label === "15-33" &&
              flight.geo.get(place.label) &&
              !flight.geo.get(place.label)?.out
            ) {
              flight.geo.set(place.label, {
                ...flight.geo.get(place.label)!,
                out: date,
              });
            }
          }
        }
      }
      aircraft.flights[idx] = flight;
    }
    database.set(hex, aircraft);
  }
  return database;
};

export default parseGeo;
