import { connect, query } from "mssql";
import config from "../../util/config";

export default async () => {
  await connect(config);
  const result = await query(
    "SELECT MAX([DTEvent]) AS lastEvent FROM [TaticHis].[dbo].[vwDataMov]"
  );
  if (result.recordset[0]) {
    return result.recordset[0].lastEvent.toISOString();
  }
  return undefined;
};
