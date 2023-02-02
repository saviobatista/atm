import { Feature, Point, point } from "@turf/turf";

export const intData = (value: string): number | undefined =>
  value !== "" ? parseInt(value) : undefined;

export const toDate = (data: Date): string =>
  data.toISOString().substring(0, 19).replace("T", " ");

export const toPosition = (
  latitude: string,
  longitude: string
): Feature<Point> =>
  [latitude, longitude].includes("")
    ? point([0, 0])
    : point([parseFloat(latitude), parseFloat(longitude)]);
