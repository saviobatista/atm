use std::io::prelude::*;
use std::net::TcpStream;
use lapin::{options::*, types::FieldTable, BasicProperties, Connection, ConnectionProperties};
use futures::executor::block_on as wait;
use std::thread;
use std::sync::Arc;

fn main() {
    let hosts = std::env::var("HOSTS").expect("HOSTS environment variable not set");
    let addr = std::env::var("RABBITMQ_SERVER").expect("RABBITMQ_SERVER environment variable not set");
    let conn = Arc::new(wait(Connection::connect(&addr, ConnectionProperties::default())).expect("connection error"));

    let handles: Vec<_> = hosts.split(',')
        .map(|host| {
            let host = host.to_string();
            let conn = Arc::clone(&conn);
            thread::spawn(move || {
                println!("Connecting to host: {}", host);
                let channel = wait(conn.create_channel())
                    .expect("Create channel error");
                wait(channel.queue_declare(&host, QueueDeclareOptions::default(), FieldTable::default()))
                    .expect("Queue declare error");
                match TcpStream::connect((&*host, 30003)) {
                    Ok(mut stream) => {
                        let mut buffer = [0; 1024];

                        let props = BasicProperties::default().with_content_type("text/plain".into());

                        println!("Reading data from host: {}", host);
                        while let Ok(bytes_read) = stream.read(&mut buffer) {
                            if bytes_read == 0 { break; }
                            let _ = channel.basic_publish("", &host, BasicPublishOptions::default(), String::from_utf8_lossy(&buffer[..bytes_read]).as_bytes().to_vec(), props.clone());
                        }
                    },
                    Err(e) => {
                        println!("Could not connect to server: {}", e);
                    }
                }
            })
        })
        .collect();

    for handle in handles {
        handle.join().unwrap();
    }
}
