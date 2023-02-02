import { PrismaClient } from "@prisma/client";

type GetFlightFromDatabaseResponse = {
  id?: string;
  callsign: string;
  origin: string;
  destination: string;
  time: string;
  rwy: string;
};
type GetFlightQueryResult = {
  PKMov: string;
  CallSign: string;
  aDep: string;
  aDes: string;
  EOBT: string;
  RunWay: string;
  DTEvent?: Date;
  DHEvent?: Date;
};
export const getFlightFromDatabase = async (
  client: PrismaClient,
  registration: string,
  date: Date
): Promise<GetFlightFromDatabaseResponse> => {
  const response = await client.$queryRawUnsafe<
    GetFlightQueryResult[]
  >(`SELECT TOP (1) [PKMov],[DHEvent],[CallSign],[MovType],[aDep],[aDes],[EOBT],[DTEvent],[FL],[Route],[CondMet],[FlightRule],[RunWay],[Sid],[Siap] \
    FROM [TaticHis].[dbo].[hisMovement] \
    WHERE [RegistrationMark] LIKE \'${registration.replaceAll("-", "")}\' \
    AND [MovType] IN ('ARR','DEP') ORDER BY ABS(DATEDIFF(MINUTE,\'${date.toISOString()}\',[DHMov])) ASC`);
  if (response.length > 0) {
    return {
      id: response[0].PKMov,
      callsign: response[0].CallSign,
      origin: response[0].aDep,
      destination: response[0].aDes,
      time: getTime(response) || "",
      rwy: response[0].RunWay,
    };
  }
  return {
    callsign: registration,
    origin: "ZZZZ",
    destination: "ZZZZ",
    time:
      `0${date.getUTCHours().toString()}`.substring(-2) +
      `0${date.getMinutes().toString()}`.substring(-2),
    rwy: "",
  };
};

const getTime = (data: GetFlightQueryResult[]): string | undefined => {
  return (
    data[0].EOBT ||
    (data[0].DTEvent || data[0].DHEvent)
      ?.toISOString()
      .substring(11, 16)
      .replaceAll(":", "")
  );
};
