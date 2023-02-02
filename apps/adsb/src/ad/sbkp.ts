import { buffer, lineString, point, polygon } from "@turf/turf";
import { Aerodrome } from "../types";

export const SBKP: Aerodrome = {
  icao: "SBKP",
  elevation: 2175,
  margin: 0.009,
  runway: polygon([
    [
      [-22.998268, -47.146876],
      [-22.99861, -47.147161],
      [-23.016567, -47.122126],
      [-23.016202, -47.121822],
      [-22.998268, -47.146876],
    ],
  ]),
  taxiways: new Map([
    [
      "D",
      polygon([
        [
          [-22.999056, -47.147631],
          [-22.99928, -47.147869],
          [-22.999437, -47.147629],
          [-22.99929, -47.147479],
          [-22.999056, -47.147631],
        ],
      ]),
    ],
    [
      "B",
      polygon([
        [
          [-23.007338, -47.136063],
          [-23.007262, -47.136437],
          [-23.007674, -47.136274],
          [-23.007581, -47.136085],
          [-23.007338, -47.136063],
        ],
      ]),
    ],
    [
      "A",
      polygon([
        [
          [-23.006869, -47.137023],
          [-23.007121, -47.136926],
          [-23.007053, -47.136716],
          [-23.006801, -47.136813],
          [-23.006869, -47.137023],
        ],
      ]),
    ],
    [
      "E",
      polygon([
        [
          [-23.016891, -47.122735],
          [-23.017187, -47.122991],
          [-23.017325, -47.122794],
          [-23.017027, -47.12255],
          [-23.016891, -47.122735],
        ],
      ]),
    ],
    [
      "F",
      polygon([
        [
          [-23.013203, -47.128261],
          [-23.013571, -47.128222],
          [-23.01398, -47.127611],
          [-23.013101, -47.127999],
          [-23.013203, -47.128261],
        ],
      ]),
    ],
    [
      "H",
      polygon([
        [
          [-22.999766, -47.146633],
          [-23.000177, -47.147025],
          [-23.000326, -47.146733],
          [-23.0, -47.146482],
          [-22.999766, -47.146633],
        ],
      ]),
    ],
  ]),
  points: [
    {
      runway: 15,
      label: "15: 1nm",
      position: "-47.161189,-22.988327,0",
      point: buffer(point([-22.988327, -47.161189]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 2nm",
      position: " -47.175431,-22.978043,0",
      point: buffer(point([-22.978043, -47.175431]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 3nm",
      position: " -47.189671,-22.967757,0",
      point: buffer(point([-22.967757, -47.189671]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 4nm",
      position: " -47.203909,-22.957469,0",
      point: buffer(point([-22.957469, -47.203909]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 5nm",

      position: " -47.218145,-22.94718,0",
      point: buffer(point([-22.94718, -47.218145]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 6nm",

      position: " -47.232379,-22.936891,0",
      point: buffer(point([-22.936891, -47.232379]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 7nm",

      position: " -47.246611,-22.926599,0",
      point: buffer(point([-22.926599, -47.246611]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 8nm",

      position: " -47.260841,-22.916307,0",
      point: buffer(point([-22.916307, -47.260841]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 9nm",

      position: " -47.275068,-22.906013,0",
      point: buffer(point([-22.906013, -47.275068]), 100, { units: "meters" }),
    },
    {
      runway: 15,
      label: "15: 10nm",

      position: " -47.289293,-22.895718,0",
      point: buffer(point([-22.895718, -47.289293]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 1nm",

      position: " -47.107684,-23.026658,0",
      point: buffer(point([-23.026658, -47.107684]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 2nm",

      position: " -47.093422,-23.036926,0",
      point: buffer(point([-23.036926, -47.093422]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 3nm",

      position: " -47.079158,-23.047192,0",
      point: buffer(point([-23.047192, -47.079158]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 4nm",

      position: " -47.064892,-23.057457,0",
      point: buffer(point([-23.057457, -47.064892]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 5nm",

      position: " -47.050624,-23.067721,0",
      point: buffer(point([-23.067721, -47.050624]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 6nm",

      position: " -47.036353,-23.077984,0",
      point: buffer(point([-23.077984, -47.036353]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 7nm",

      position: " -47.02208,-23.088245,0",
      point: buffer(point([-23.088245, -47.02208]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 8nm",

      position: " -47.007806,-23.098505,0",
      point: buffer(point([-23.098505, -47.007806]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 9nm",

      position: " -46.993529,-23.108763,0",
      point: buffer(point([-23.108763, -46.993529]), 100, { units: "meters" }),
    },
    {
      runway: 33,
      label: "33: 10nm",

      position: " -46.979249,-23.119021,0",
      point: buffer(point([-23.119021, -46.979249]), 100, { units: "meters" }),
    },
  ],
};
