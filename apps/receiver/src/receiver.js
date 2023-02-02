#!/usr/bin/env node
//'10.42.17.50', 30003

var amqp = require('amqplib/callback_api');
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'adsb';

    channel.assertQueue(queue, {
      durable: false
    })
    
    const s = new require('net').createConnection(30003,'10.42.17.50',(soc)=>{
      console.log('conectou')
    })
    s.on('data',(bytes)=>channel.sendToQueue(queue, bytes))
  })
})
