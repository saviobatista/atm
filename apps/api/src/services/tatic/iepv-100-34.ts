import { connect, DateTime, Request } from "mssql";
import config from "../../util/config";

export default async (inicio: Date) => {
  const sql = `SELECT
	CONCAT(
		LEFT([LocalityStrip]+'          ',10)
		,LEFT([MovType]+'         ',9) 
		,LEFT([CallSign]+'              ',14) 
		,LEFT([RegistrationMark]+'          ',10)
		,LEFT([AcftType]+'     ',5) 
		,LEFT([FlightType]+'   ',3) 
		,LEFT(CASE [aDep] WHEN [LocalityStrip] THEN '-' ELSE [aDep] END+'      ',7)
		,LEFT(CASE [aDes] WHEN [LocalityStrip] THEN '-' ELSE [aDes] END+'     ',5)
		,LEFT(CONCAT(SUBSTRING( convert(varchar, [DTEvent],108),1,2),SUBSTRING( convert(varchar, [DTEvent],108),4,2))+'          ',10)
		,LEFT([RunWay]+'    ',4)
		,LEFT([RV]+'     ',5)
		,LEFT([UserEvent]+'           ',11)
		,FORMAT(DTEvent,'dd/MM/yyyy 00:00:00 ')
	) AS [row]
FROM [TaticHis].[dbo].[vwDataMov]
WHERE [MovState] = 'HIS'
    AND [MovType] IN ('DEP', 'ARR', 'LOW', 'TGL', 'ABA', 'QAF', 'QAY', 'QSO', 'ABD', 'ACD')
    AND [DTEvent] BETWEEN DATEADD(DAY, -1, @begin) AND DATEADD(SECOND, -1, DATEADD(DAY, 1, DATEADD(DAY, -1, @begin)))
ORDER BY [DTEvent] ASC`;
  try {
    await connect(config);
    const result = await new Request()
      .input("begin", DateTime, inicio)
      .query(sql);
    return result.recordset;
  } catch (e: any) {
    console.error(e.code, e.message);
  }
};
