import { PrismaClient } from "@prisma/client";
import axios from "axios";

type GetAircraftResponse = {
  type: string;
  registration: string;
};
type getAircraftFromResponse = Promise<GetAircraftResponse | undefined>;
export const getAircraft = async (
  client: PrismaClient,
  modes: string
): Promise<GetAircraftResponse> =>
  (await getFromDatabase(client, modes)) ||
  (await getFromFlightRadar24(client, modes)) ||
  (await getFromRadarBox(client, modes)) ||
  (await registerNotFoundAndReturnDefault(client, modes));

const setDatabase = async (
  client: PrismaClient,
  modes: string,
  type: string,
  registration: string
): Promise<void> => {
  await client.aircraft.upsert({
    create: {
      modes,
      type,
      registration,
    },
    update: {
      modes,
      type,
      registration,
    },
    where: {
      modes,
    },
  });
  // await client.unknowAircraft.delete({
  //   where: { modes },
  // });
};

const getFromDatabase = async (
  client: PrismaClient,
  modes: string
): Promise<getAircraftFromResponse> => {
  const response = await client.aircraft.findFirst({
    where: {
      modes: {
        contains: modes,
      },
    },
  });
  if (response !== null) {
    return {
      type: response.type,
      registration: response.registration,
    };
  }
  const query = await client.$queryRaw<
    { qty: number }[]
  >`SELECT COUNT(*) AS qty FROM [adsb].[unknowAircraft] WHERE [modes] LIKE ${modes}`;
  if (query[0]?.qty > 0) {
    console.log("UNKNOWN", modes);
    return { type: "0000", registration: "" };
  }
  console.log(`SEARCHING ${modes}`);
  await timeout();
  return undefined;
};

const registerNotFoundAndReturnDefault = async (
  client: PrismaClient,
  modes: string
): Promise<GetAircraftResponse> => {
  await client.unknowAircraft.upsert({
    create: { lastUpdate: new Date(), modes },
    update: { lastUpdate: new Date(), modes },
    where: { modes },
  });
  return { type: "0000", registration: "" };
};
/**
 * 
 * @param modes 
 * @sample
 * GET https://www.flightradar24.com/v1/search/web/find?query=E48D4A&limit=50
 * 200:
 {
   "results":[
      {
         "id":"PR-AQB",
         "label":"PR-AQB (AT76)",
         "detail":{
            "equip":"AT76",
            "hex":"E48D4A"
         },
         "type":"aircraft",
         "match":"begins"
      }
   ],
   "stats":{
      "total":{
         "all":1,
         "airport":0,
         "operator":0,
         "live":0,
         "schedule":0,
         "aircraft":1
      },
      "count":{
         "airport":0,
         "operator":0,
         "live":0,
         "schedule":0,
         "aircraft":1
      }
   }
}
 */
const getFromFlightRadar24 = async (
  client: PrismaClient,
  modes: string
): Promise<getAircraftFromResponse> => {
  type FlightRadarResponse = {
    results: [
      {
        id: string; // Registration
        label: string; // Registration (Type)
        detail: {
          equip: string; // Type
          hex: string; // Mode-S
        };
        type: string; // "aircraft" is what we want
      }
    ];
  };
  const response = await axios.get<FlightRadarResponse>(
    `https://www.flightradar24.com/v1/search/web/find?query=${modes}&limit=2`,
    {
      responseType: "json",
    }
  );
  if (
    response.status === 200 &&
    response.data.results.length > 0 &&
    response.data.results[0].type == "aircraft"
  ) {
    const data = response.data.results[0];
    await setDatabase(client, modes, data.detail.equip, data.id);
    return {
      type: data.detail.equip,
      registration: data.id,
    };
  }
  return undefined;
};
/**
 * RadaxBox flight data grabber
 * @param modes 
 * @sample Request
 * GET 
 * 200:
  {
   "airports":[
      
   ],
   "airlines":[
      
   ],
   "aircraft":[
      
   ],
   "flights":[
      
   ],
   "registrations":[
      {
         "bl":false,
         "aplngst":"S\u00e3o Paulo",
         "aptkona":"Gale\u00e3o - Ant\u00f4nio Carlos Jobim International Airport",
         "acsn":"BB-1279",
         "aptkoco":"Brazil",
         "lastlalot":1659553182000,
         "st":"EXTRPI014901",
         "aplngci":"S\u00e3o Paulo",
         "la":"-23.508787",
         "firstlaloco":"Brazil",
         "aptkoic":"SBGL",
         "aplngna":"Campo de Marte Airport",
         "lastla":-23.5087869935116,
         "onflights":true,
         "act":"BE20",
         "hd":100,
         "aptkola":-22.81,
         "aplngia":"RTE",
         "accl":"G",
         "lastlo":-46.6396077473958,
         "lngtc":1659553162,
         "lo":"-46.639608",
         "mrgdepu":1659549113,
         "firstlalot":1659549113000,
         "aptkost":"Rio de Janeiro",
         "firstlalost":null,
         "lngrw":"12",
         "aptkoia":"GIG",
         "lastlaloci":"S\u00e3o Paulo",
         "lastlalost":"SP",
         "aptkoci":"Rio De Janeiro",
         "firstlo":-43.2537605979226,
         "acr":"N800TP",
         "ground":false,
         "oid":"62eab720771910bd39eaa284",
         "aplngtznl":"Brasilia Standard Time",
         "aplngtz":-3,
         "firstla":-22.8031425476074,
         "ms":"AAE394",
         "mrgarrs":1659554384,
         "tkosrc":"detected",
         "aplnglo":-46.6378,
         "aplngco":"Brazil",
         "fid":1825653865,
         "alt":2400,
         "so":"ADSB",
         "accountry":"US",
         "acd":"Beech B200 Super King Air",
         "svd":1659554384529,
         "mrgarru":1659553162,
         "mrgdeps":1659554384,
         "aptkotzns":"BRT",
         "cs":"N800TP",
         "tkorw":"10",
         "tkotc":1659549186,
         "lastlaloco":"Brazil",
         "pcnt":422,
         "firstlaloci":"Rio De Janeiro",
         "aptkolo":-43.2506,
         "aptkotznl":"Brasilia Standard Time",
         "aptkotz":-3,
         "aplngtzns":"BRT",
         "aplngla":-23.5091,
         "lngsrc":"detected",
         "aplngic":"SBMT",
         "_key":"acr",
         "_esid":"N800TP",
         "aporgci":"Rio De Janeiro, RJ",
         "aporgia":"GIG",
         "aporgic":"SBGL",
         "aporgtzns":"BRT",
         "aporgtz":-3,
         "aporgtznl":"Brasilia Standard Time",
         "aporgla":-22.81,
         "aporglo":-43.2506,
         "aporgco":"Brazil",
         "aporgst":"Rio de Janeiro",
         "aporgna":"Gale\u00e3o - Ant\u00f4nio Carlos Jobim International Airport",
         "apdstci":"S\u00e3o Paulo, SP",
         "apdstia":"RTE",
         "apdstic":"SBMT",
         "apdsttzns":"BRT",
         "apdsttz":-3,
         "apdsttznl":"Brasilia Standard Time",
         "apdstla":-23.5091,
         "apdstlo":-46.6378,
         "apdstco":"Brazil",
         "apdstst":"S\u00e3o Paulo",
         "apdstna":"Campo de Marte Airport",
         "departure":"14:53",
         "departure_meta":"tkotc",
         "arrival":"15:59",
         "arrival_meta":"lngtc",
         "status":"landed",
         "progress":100,
         "duration":"01h06m",
         "durationTs":3976,
         "durationType":"actual",
         "distance":354994,
         "lastlalotRelative":"5 months ago",
         "departureRelative":"5 months ago",
         "ete":"01:06",
         "rem":"00:00",
         "arrivalRelative":"5 months ago",
         "statusLabel":{
            "text":"LANDED 5M 23d AGO",
            "bg":"#0e7677",
            "label":"#FFFFFF"
         },
         "depsts":1659549113,
         "depc":1659538313,
         "arrsts":1659553162,
         "arrc":1659542362,
         "year":"2022",
         "day":"Aug 3",
         "depdate":"Wednesday, August 3 2022",
         "arrdate":"Wednesday, August 3 2022",
         "arrdateShort":"Wed, Aug 3 2022",
         "replay":true,
         "isFuture":false,
         "aclastlaloci":"S\u00e3o Paulo",
         "aclastlalost":"SP",
         "aclastlaloco":"Brazil",
         "aclastlalotRelative":"5 months ago",
         "acstatus":"landed",
         "countryName":"United States",
         "rankingAct":1009,
         "rankingActCountry":529,
         "rankingClassCountry":20508,
         "rankingAlic":"",
         "phs":[
            
         ],
         "alic":"{PVT}",
         "alia":"{PVT}",
         "alna":"Private"
      }
   ]
}
 * @returns 
 */
const getFromRadarBox = async (
  client: PrismaClient,
  modes: string
): Promise<getAircraftFromResponse> => {
  type RadaxBoxResponse = {
    registrations: [
      {
        acr: string; // Registration
        act: string; // Type
      }
    ];
  };

  const response = await axios.get<RadaxBoxResponse>(
    `https://www.radarbox.com/search/advanced?q=${modes}`,
    {
      responseType: "json",
    }
  );
  if (response.status === 200 && response.data.registrations.length > 0) {
    const data = response.data.registrations[0];
    await setDatabase(client, modes, data.acr, data.act);
    return {
      type: data.act,
      registration: data.acr,
    };
  }
  return undefined;
};
const timeout = (): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
