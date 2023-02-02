import { log } from "console";
import { Bit, DateTime, Float, Int, NVarChar, Request } from "mssql";
import { Message } from "./message";
export const update = async (data: Message[]) => {
  if (data.length === 0) return;

  const cleanResult = await new Request()
    .input("moment", DateTime, data[0].moment)
    .query(
      "DELETE FROM [adsb].[dbo].[adsb] WHERE [moment] BETWEEN @moment AND DATEADD(SECOND, +1, @moment)"
    );
  const request = new Request();
  for (const i in data) {
    request
      .input(`aircraft${i}`, NVarChar, data[i].aircraft)
      .input(`moment${i}`, DateTime, data[i].moment)
      .input(`callsign${i}`, NVarChar, data[i].callsign)
      .input(`altitude${i}`, Int, data[i].altitude)
      .input(`ground${i}`, Bit, data[i].ground === "-1" ? 1 : 0)
      .input(`speed${i}`, Int, data[i].speed)
      .input(`track${i}`, Int, data[i].track)
      .input(`vertical${i}`, Int, data[i].vertical)
      .input(`latitude${i}`, data[i].latitude)
      .input(`longitude${i}`, data[i].latitude);
  }
  const result = await request.query(
    `INSERT INTO [adsb].[dbo].[adsb] ([aircraft], [moment], [callsign], [altitude], [ground], [position], [speed], [track], [vertical]) VALUES ${data
      .map<string>(
        (v, idx) =>
          `(@aircraft${idx}, @moment${idx}, @callsign${idx}, @altitude${idx}, @ground${idx}, ${
            v.latitude !== "" && v.longitude !== ""
              ? `geography::Point(@latitude${idx}, @longitude${idx}, 4326)`
              : "NULL"
          }, @speed${idx}, @track${idx}, @vertical${idx})`
      )
      .join(", ")}`
  );
};
