use chrono::prelude::*;
use lapin::{options::*, Connection, ConnectionProperties, message::BasicGetMessage, types::FieldTable};
use futures::executor::block_on as wait;
use std::io::prelude::*;
use std::fs::OpenOptions;
use std::thread;
use std::sync::Arc;

fn main() {
    let hosts = std::env::var("HOSTS").expect("HOSTS environment variable not set");
    let addr = std::env::var("RABBITMQ_SERVER").unwrap();
    let conn = Arc::new(wait(Connection::connect(&addr, ConnectionProperties::default())).expect("connection error"));

    let handles: Vec<_> = hosts.split(',')
        .map(|host| {
            let host = host.to_string();
            let conn = Arc::clone(&conn);
            thread::spawn(move || {
                let host = host.to_string();
                println!("Piping queue {}", host);
                let channel = wait(conn.create_channel()).expect("create_channel error");

                wait(channel.queue_declare(&host, QueueDeclareOptions::default(), FieldTable::default())).expect("queue_declare error");

                loop {
                    let get_msg: Option<BasicGetMessage> = wait(channel.basic_get(&host, BasicGetOptions::default())).expect("basic_get error");

                    if let Some(get_msg) = get_msg {
                        let delivery = get_msg.delivery;
                        let date = Local::now().format("%Y%m%d").to_string();
                        let file_name = format!("/data/adsb-log_{}_{}.csv", host, date);
                        let mut f = OpenOptions::new().append(true).create(true).open(&file_name).expect("Unable to open file");
                        f.write_all(&delivery.data).expect("Unable to write data");
                        wait(channel.basic_ack(delivery.delivery_tag, BasicAckOptions::default())).expect("basic_ack error");
                    }
                }
            })
        })
        .collect();

    for handle in handles {
        handle.join().unwrap();
    }
}
