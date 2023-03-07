import { Feature, Point, Polygon } from "@turf/turf";

export type Database = Map<string, Aircraft>;
export type Taxiway = {
  label: string;
  polygon: Feature<Polygon>;
};
type Interest = {
  runway: number;
  label: string;
  position: string;
  point: Feature<Polygon>;
};
export type Aerodrome = {
  icao: string;
  elevation: number;
  margin: number;
  runway: Feature<Polygon>;
  taxiways: Map<string, Feature<Polygon>>;
  points: Interest[];
};

type MessageType = "MSG" | "SGA" | "ID" | "AIR" | "SEL" | "CLK";

export type Message = {
  type?: MessageType;
  hex: string;
  date: Date;
  callsign?: string;
  altitude?: number;
  speed?: string;
  track?: number;
  position?: Feature<Point>;
  vertical?: number;
  ground?: boolean;
};

export type FlightMoment = {
  date: Date;
  position?: Feature<Point>;
  speed?: string;
  altitude?: number;
  track?: number;
  vertical?: number;
  ground?: boolean;
};
type Position = Map<string, FlightMoment>;
export type Record = {
  hex: string;
  callsign?: string;
  matricula?: string;
  tipo?: string;
  rwy?: number;
  points: Position;
  last?: string;
};
export type Path = {
  date: Date;
  altitude?: number;
  vertical?: number;
  track?: number;
  longitude?: number;
  latitude?: number;
  speed?: number;
  ground?: boolean;
};
export type Flight = {
  id: string;
  callsign: string;
  origin: string;
  destination: string;
  time: Date;
  rwy: string;
  path: Path[];
  geo: Map<string, GeoPosition>;
  date: Date;
};
export type Aircraft = {
  modes: string;
  type: string;
  registration: string;
  aerodrome: string;
  flights: Flight[];
};
export type GeoPosition = {
  date: Date;
  speed?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  leaving?: Date;
  out?: Date;
};

export type Place = {
  label: string;
  type: "RWY" | "TWY" | "WAY";
  threshold?: string;
  polygon: Feature<Polygon>;
};

export type QueueItem = {
  file: string;
  dir: string;
  aerodrome: string;
};
