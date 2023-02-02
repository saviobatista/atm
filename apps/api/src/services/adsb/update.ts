import { Bit, ConnectionPool, DateTime, Float, Int, NVarChar } from "mssql";
import { Message } from "./schema";

export default async (pool: ConnectionPool, data: Message) => {
  try {
    await pool
      .request()
      .input("aircraft", NVarChar, data.aircraft)
      .input("moment", DateTime, data.moment)
      .query(`IF NOT EXISTS (SELECT * FROM [adsb].[dbo].[adsb] WHERE [aircraft] = @aircraft AND moment = @moment)
    BEGIN
      INSERT INTO [adsb].[dbo].[adsb] ([aircraft], [moment]) VALUES (@aircraft, @moment)
    END`);
  } catch (e) {}
  var sql;
  var pos;
  try {
    const request = pool
      .request()
      .input("aircraft", NVarChar, data.aircraft)
      .input("moment", DateTime, data.moment);
    const fields = [];
    if (data.callsign !== "") {
      fields.push("callsign");
      request.input("callsign", NVarChar, data.callsign);
    }
    if (data.altitude !== "") {
      fields.push("altitude");
      request.input("altitude", Int, data.altitude);
    }
    if (data.ground !== "") {
      fields.push("ground");
      request.input("ground", Bit, data.ground === "-1" ? 1 : 0);
    }
    if (data.latitude !== "" && data.longitude !== "") {
      fields.push("position");
      request.input("latitude", Float, parseFloat(data.latitude));
      request.input("longitude", Float, parseFloat(data.longitude));
    }
    if (data.speed !== "") {
      fields.push("speed");
      request.input("speed", Int, data.speed);
    }
    if (data.track !== "") {
      fields.push("track");
      request.input("track", Int, data.track);
    }
    if (data.vertical !== "") {
      fields.push("vertical");
      request.input("vertical", Int, data.vertical);
    }

    if (fields.length > 0) {
      sql = `UPDATE [adsb].[dbo].[adsb]
      SET ${fields
        .map((field) =>
          field === "position"
            ? `[${field}] = geography::Point(@latitude, @longitude, 4326)`
            : `[${field}] = @${field}`
        )
        .join(", ")}
      WHERE [aircraft] = @aircraft AND [moment] = @moment`;
      await request.query(sql);
    }
  } catch (e: any) {
    console.error("########## ERRROR #############");
    console.log(e);
    console.log(data);
    console.error(e.code);
    console.error(e.message);
    console.log(sql);
    console.log(pos);
    throw new Error();
  }
};
