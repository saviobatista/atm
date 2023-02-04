import { polygon, buffer, point } from "@turf/turf";
import { PrismaClient } from "database";
import { Place } from "../types";

const getPlaces = async (
  client: PrismaClient,
  aerodrome: string
): Promise<Place[]> => {
  const places: Place[] = [];
  //Runways
  //COORDS SAMPLE: 'POLYGON ((-47.146876 -22.998268, -47.147161 -22.99861, -47.122126 -23.016567, -47.121822 -23.016202, -47.146876 -22.998268))'
  const rwyData = await client.$queryRaw<
    { runway: string; coords: string }[]
  >`SELECT [runway], [polygon].STAsText() AS 'coords' FROM [adsb].[Runway] WHERE [aerodrome] LIKE ${aerodrome}`;
  for (const { runway, coords } of rwyData) {
    const coordinates = coords
      .match(/POLYGON \(\((.*)\)\)/)?.[1]
      .split(",")
      .map((v) =>
        v
          .trim()
          .split(" ")
          .map((i) => parseFloat(i))
      );
    if (coordinates) {
      places.push({
        type: "RWY",
        label: runway,
        polygon: polygon([coordinates]),
      });
    }
  }
  //Taxiways
  const twyData = await client.$queryRaw<
    { label: string; coords: string }[]
  >`SELECT [label], [coordinates].STAsText() AS 'coords' FROM [adsb].[Taxiway] WHERE [aerodrome] LIKE ${aerodrome}`;
  for (const { label, coords } of twyData) {
    const coordinates = coords
      .match(/POLYGON \(\((.*)\)\)/)?.[1]
      .split(",")
      .map((v) =>
        v
          .trim()
          .split(" ")
          .map((i) => parseFloat(i))
      );
    if (coordinates) {
      places.push({
        label,
        type: "TWY",
        polygon: polygon([coordinates]),
      });
    }
  }
  //Waypoints
  //COORDS SAMPLE: 'POINT (-46.979249 -23.119021)'
  const wayData = await client.$queryRaw<
    { label: string; threshold: string; coords: string }[]
  >`SELECT [threshold], [label], [point].STAsText() AS 'coords' FROM [adsb].[Waypoint] WHERE [aerodrome] LIKE ${aerodrome}`;
  for (const { label, threshold, coords } of wayData) {
    const coordinates = coords
      .match(/POINT \((.*)\)/)?.[1]
      .trim()
      .split(" ")
      .map((v) => parseFloat(v));
    if (coordinates) {
      places.push({
        label: `${threshold} ${label}`,
        type: "WAY",
        polygon: buffer(point(coordinates), 60, { units: "meters" }),
      });
    }
  }
  return places;
};

export default getPlaces;
