import { Int, NVarChar, Request } from "mssql";

export default async (hora: number, dias: number) => {
  const sql = `SELECT
	  DATEADD(HOUR, @time, DATEADD(DAY, CASE WHEN DATEPART(HOUR, [DTEvent]) >= @time THEN 1 ELSE 0 END, DATEDIFF(DAY, 0, [DTEvent]))) AS [data]
    ,COUNT([FKStripMov]) AS [contagem]
  FROM [TaticHis].[dbo].[vwDataMov]
  WHERE [MovState] = 'HIS' 
    AND [MovType] IN ('DEP', 'ARR', 'LOW', 'TGL', 'ABA', 'QAF', 'QAY', 'QSO', 'ABD', 'ACD')
    AND DATEADD(HOUR, @time, DATEADD(DAY, CASE WHEN DATEPART(HOUR, [DTEvent]) >= @time THEN 1 ELSE 0 END, DATEDIFF(DAY, 0, [DTEvent]))) 
      BETWEEN DATEADD(HOUR, @time, DATEADD(DAY, @days * -1, DATEDIFF(DAY, 0, DATEADD(DAY, -1, DATEDIFF(DAY, 0, GETDATE())))))
        AND DATEADD(HOUR, @time, DATEADD(DAY, -1, DATEDIFF(DAY, 0, GETDATE())))
  GROUP BY DATEADD(HOUR, @time, DATEADD(DAY, CASE WHEN DATEPART(HOUR, [DTEvent]) >= @time THEN 1 ELSE 0 END, DATEDIFF(DAY, 0, [DTEvent])))
  ORDER BY DATEADD(HOUR, @time, DATEADD(DAY, CASE WHEN DATEPART(HOUR, [DTEvent]) >= @time THEN 1 ELSE 0 END, DATEDIFF(DAY, 0, [DTEvent]))) ASC`;
  const result = await new Request()
    .input("time", Int, hora)
    .input("days", Int, dias)
    .query(sql);
  return result.recordset;
};
