import { log } from "console";
import { workerData, parentPort } from "worker_threads";
import { PrismaClient } from "@prisma/client";
import toDatabase from "./services/to-database";
import toKML from "./services/to-kml";
import parseSBS from "./services/parse-sbs";
import parseGeo from "./services/parse-geo";
import { SBKP } from "./ad/sbkp";
import { inside, point } from "@turf/turf";

const worker = async () => {
  const { file, dir, aerodrome } = workerData;
  // log(`Worker para ${file}`);

  const client = new PrismaClient({
    // log: ["query"]
  });
  // log(`${new Date().toISOString()} - ${file}: Processando Basestation`);
  const database = await parseSBS(client, file, dir, aerodrome);
  // log(
  //   `${new Date().toISOString()} - ${file}: Processando posições geográficas relevantes`
  // );
  // const database2 = await parseGeo(client, database, aerodrome);
  // log(
  //   `${new Date().toISOString()} - ${file}: Armazenando dados no banco de dados`
  // );
  // await toDatabase(client, database2);
  await client.$disconnect();
  // if(process.argv.includes('--kml')){
  // log(`${new Date().toISOString()} - ${file}: TO KML`);
  // toKML(database2);
  // }
  let total = 0, sbkp = 0, dep = 0, arr = 0
  database.forEach((aircraft)=>{
    aircraft.flights.forEach((flight)=>{
      const data = new Map<string,Date>();
      // Map each point of data
      flight.path.forEach((path)=>{
        if(path.latitude&&path.longitude){
          const p = point([path.latitude,path.longitude])
          if(!data.get('RWY')&&inside(p,SBKP.runway)
            // && path.ground//maybe?
          ){
            data.set('RWY',path.date)
          }else{
            for(const mark of SBKP.points) {
              if(!data.get(mark.label)&&inside(p,mark.point)) {
                data.set(mark.label,path.date)
              }
            }
            for(const [twy, twy_point] of SBKP.taxiways) {
              if(!data.get(twy)&&inside(p,twy_point)){
                data.set(twy,path.date)
              }
            }
          }
        }
      })
      // Analyse data and define if is DEP or ARR
      total++
      if(data.get('RWY')){
        sbkp++
        let added = false
        for(const mark of SBKP.points) {
          if(!added && data.get(mark.label)){
            if(data.get(mark.label)! > data.get('RWY')!)
              arr++
            else
              dep++
            added = true
          }
        }
      }



    })
  })


  parentPort?.postMessage(`${file.replace('adsb_log.','').replace('.csv.gz','')},${total},${sbkp},${arr},${dep}`);
};

worker();
