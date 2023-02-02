import "reflect-metadata"
import { DataSource } from "typeorm"
import { Aircraft } from "./entity/Aircraft"
import { Radar } from "./entity/Radar"

export const AppDataSource = new DataSource({
    type: "mssql",
    host: "localhost",
    username: "sa",
    password: "NavTakp190!",
    database: "adsb",
    synchronize: true,
    logging: false,
    entities: [Aircraft, Radar],
    migrations: [],
    subscribers: [],
    options: {
        encrypt:false,
        // trustServerCertificate: true
    }   
})
