#!/usr/bin/env node

var amqp = require('amqplib/callback_api');


const onConnect = (error, connection) => {
    if (error) {
        throw error;
    }
    connection.createChannel(onCreateChannel);
}

const onCreateChannel = (error, channel) => {
    if (error) {
        throw error;
    }

    var queue = 'adsb';

    channel.assertQueue(queue, { durable: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, onConsume, { noAck: true });
}

const onConsume = (message) => {
    const lines = message.content.toString().trim().split('\r\n')
    for(const line of lines) {
        parseMsg(line)
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
const parseMsg = (line) => {
    const data = line.split(',')
    if(data.length==0)return
    const result = {
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
    if(result.onGround=='-1')
    console.log(result)
}

amqp.connect('amqp://localhost', onConnect)