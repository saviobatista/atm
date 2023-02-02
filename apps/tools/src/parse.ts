import { Message } from "./message";

export const parse = (line: string): Message | undefined => {
  const data = line.split(",");
  if (data.length < 21) return;
  return {
    aircraft: data[4],
    moment: new Date(data[6].replace("/", "-") + " " + data[7].substring(0, 8)),
    callsign: data[10].trim(),
    altitude: data[11],
    speed: data[12],
    track: data[13],
    latitude: data[14],
    longitude: data[15],
    vertical: data[16],
    ground: data[21],
  };
};
