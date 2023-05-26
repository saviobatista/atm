#!/bin/bash
tcpdump -i eth0 -s 0 -l -w - src host FR24-BC6A29C4A08A or src host S-KPAN50 and port 30003 | rabbitmqadmin publish raw_adsb_exchange routing_key=adsb
