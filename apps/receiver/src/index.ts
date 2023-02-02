import { AppDataSource } from "./data-source"
import { Aircraft } from "./entity/Aircraft"
import { Radar } from "./entity/Radar"
import { Channel, connect, GetMessage } from 'amqplib'

const parseGetMessage = async (message:GetMessage) => {
    const lines = message.content.toString().trim().split('\r\n')
    for(const line of lines) {
        await parseMsg(line)
    }
}
const tipos = {
    '1': 'ES Identification and Category',
    '2': 'ES Surface Position Message',
    '3': 'ES Airborne Position Message',
    '4': 'ES Airborne Velocity Message',
    '5': 'Surveillance Alt Message',
    '6': 'Surveillance ID Message',
    '7': 'Air To Air Message',
    '8': 'All Call Reply'
}
const parseMsg = async (line) => {
    const data = line.split(',')
    if(data.length==0)return
    const info = {
        'tipo': data[1],
        'desc': data[1] in Object.keys(tipos) ? tipos[data[1]] : 'Unknown',
        // 'sessionId': data[2], // Currently not in use
        // 'aircraftId': data[3], // Currently not in use
        'hexId': data[4],
        // 'flightId': data[5], // Currently not in use
        'date': data[6].replaceAll('/','-')+ 'T'+data[7].substr(0,8),
        'callsign': data[10],
        'altitude': data[11],
        'speed': data[12],
        'track': data[13],
        'latitude': data[14],
        'longiture': data[15],
        'verticalRate': data[16],
        // 'squawk': data[17],
        // 'alert': data[18],
        // 'emergency': data[19],
        // 'spi': data[20],
        'onGround': data[21]
    }
    if(await AppDataSource.manager.countBy(Aircraft,{ hex: info.hexId }) == 0) {
        const aircraft = new Aircraft()
        aircraft.hex = info.hexId
        await AppDataSource.manager.save(aircraft)
    }
    const radar = await getRadarRecord(info.hexId,new Date(info.date))
    if(info.callsign) radar.callsign = info.callsign
    if(info.altitude) radar.altitude = info.altitude
    if(info.speed) radar.speed = info.speed
    if(info.track) radar.track = info.track
    if(info.latitude&&info.longiture) radar.position = 'POINT('+info.longiture+' '+info.latitude+')'
    if(info.verticalRate) radar.vertical = info.verticalRate
    await AppDataSource.manager.save(Radar,radar)
}
const getRadarRecord = async (hex:string,date:Date):Promise<Radar> => {
    if(await AppDataSource.manager.countBy(Radar,{hex,date})==1) {
        return await AppDataSource.manager.findOneBy(Radar,{hex,date})
    }
    const radar = new Radar()
    radar.hex = hex
    radar.date = date
    return radar
} 

const getMessage = async (channel:Channel) => {
    const result = await channel.get('adsb')
    if(result) {
        await parseGetMessage(result)
        getMessage(channel)
    } else {
        setTimeout(()=>getMessage(channel),100)
    }
}

const onInit = async () => {
    console.log("TypeORM initalized")
    const conexao = await connect('amqp://localhost')
    const canal = await conexao.createChannel()
    console.log("Here you can setup and run express / fastify / any other framework.")
    getMessage(canal)
}

AppDataSource.initialize().then(onInit).catch((error) => console.error(error))
