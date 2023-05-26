import * as amqp from 'amqplib/callback_api';

interface ADSBData {
  HexIdent: string;
  MessageType: string;
  SessionID: number;
  AircraftID: number;
  FlightID: number;
  DateMessageGenerated: string;
  TimeMessageGenerated: string;
  DateMessageLogged: string;
  TimeMessageLogged: string;
  Callsign: string;
  Altitude: number;
  GroundSpeed: number;
  Track: number;
  Latitude: number;
  Longitude: number;
  VerticalRate: number;
  Squawk: string;
  Alert: boolean;
  Emergency: boolean;
  SPI: boolean;
  IsOnGround: boolean;
}

async function consumeRabbitMQQueue(queueName: string) {
  try {
    const connection = await new Promise<amqp.Connection>((resolve, reject) => {
      amqp.connect('amqp://localhost', (error, connection) => {
        if (error) {
          reject(error);
        } else {
          resolve(connection);
        }
      });
    });

    const channel = await new Promise<amqp.Channel>((resolve, reject) => {
      connection.createChannel((error, channel) => {
        if (error) {
          reject(error);
        } else {
          resolve(channel);
        }
      });
    });

    await channel.assertQueue(queueName);
    await channel.consume(queueName, (message) => {
      if (message !== null) {
        const messageContent = message.content.toString();
        const sbsData = parseSBSMessage(messageContent);
        groupAndProcessData(sbsData);
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('Error occurred while consuming RabbitMQ queue:', error);
  }
}

function parseSBSMessage(message: string): ADSBData {
  const fields = message.split(',');

  return {
    HexIdent: fields[4],
    MessageType: fields[0],
    SessionID: parseInt(fields[2], 10),
    AircraftID: parseInt(fields[3], 10),
    FlightID: parseInt(fields[5], 10),
    DateMessageGenerated: fields[6],
    TimeMessageGenerated: fields[7],
    DateMessageLogged: fields[8],
    TimeMessageLogged: fields[9],
    Callsign: fields[10],
    Altitude: parseFloat(fields[11]),
    GroundSpeed: parseFloat(fields[12]),
    Track: parseFloat(fields[13]),
    Latitude: parseFloat(fields[14]),
    Longitude: parseFloat(fields[15]),
    VerticalRate: parseFloat(fields[16]),
    Squawk: fields[17],
    Alert: fields[18] === '1',
    Emergency: fields[19] === '1',
    SPI: fields[20] === '1',
    IsOnGround: fields[21] === '1',
  };
}

const dataMap = new Map<string, Map<string, ADSBData>>();

function groupAndProcessData(adData: ADSBData) {
  const messageGeneratedDate = adData.DateMessageGenerated.split('/')[2];
  const key = `${messageGeneratedDate}-${adData.TimeMessageGenerated.split(':')[0]}`;

  if (!dataMap.has(key)) {
    dataMap.set(key, new Map<string, ADSBData>());
  }

  const timeMap = dataMap.get(key);

  if (!timeMap.has(adData.HexIdent)) {
    timeMap.set(adData.HexIdent, adData);
  }

  const currentDate = new Date();
  const currentTimestamp = Math.floor(currentDate.getTime() / 1000);

  // ... previous code ...

  // Process the grouped data
  function processGroupedData() {
    for (const [key, timeMap] of dataMap) {
      console.log(`Processing data for ${key}`);
      for (const [hexIdent, adData] of timeMap) {
        // Perform your processing logic here
        console.log(adData);
      }
      timeMap.clear(); // Clear the map for the current key
    }
  }

  // Call the processGroupedData function every 5 minutes
  setInterval(processGroupedData, 5 * 60 * 1000);

  // Start consuming the RabbitMQ queue
  consumeRabbitMQQueue('sbs_queue');
}

