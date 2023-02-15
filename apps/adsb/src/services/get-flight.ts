import { PrismaClient } from "@prisma/client";

type GetFlightFromDatabaseResponse = {
  id?: string;
  callsign: string;
  origin: string;
  destination: string;
  time: Date;
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
const getTime = (data: GetFlightQueryResult): Date | undefined => {
  return data.EOBT ? new Date(data.EOBT) : data.DTEvent || data.DHEvent;
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
      time: getTime(response[0]) || date,
      rwy: response[0].RunWay,
    };
  }
  return {
    callsign: registration,
    origin: "ZZZZ",
    destination: "ZZZZ",
    time: date,
    rwy: "",
  };
};

export const getFlightFromDatabaseWithCallsign = async (
  client: PrismaClient,
  callsign: string,
  date: Date
): Promise<GetFlightFromDatabaseResponse | undefined> => {
  const response = await client.$queryRawUnsafe<
    GetFlightQueryResult[]
  >(`SELECT TOP (1) [PKMov],[DHEvent],[CallSign],[MovType],[aDep],[aDes],[EOBT],[DTEvent],[FL],[Route],[CondMet],[FlightRule],[RunWay],[Sid],[Siap] \
    FROM [TaticHis].[dbo].[hisMovement] \
    WHERE [CallSign] LIKE \'${callsign}\' \
    AND [MovType] IN ('ARR','DEP') ORDER BY ABS(DATEDIFF(MINUTE,\'${date.toISOString()}\',[DHMov])) ASC`);
  if (response.length > 0) {
    return {
      id: response[0].PKMov,
      callsign: response[0].CallSign,
      origin: response[0].aDep,
      destination: response[0].aDes,
      time: getTime(response[0]) || date,
      rwy: response[0].RunWay,
    };
  }
  return undefined;
};
