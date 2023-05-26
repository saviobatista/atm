#!/bin/bash
PATH=$PATH":/home/savio/.nvm/versions/node/v18.12.1/bin"
echo $PATH
scp takp@S-KPAN50:/home/takp/log/adsb_log.$(date --date="yesterday" +%Y%m%d).csv.gz /home/savio/adsb-data/
cd /home/savio/atm
yarn workspace adsb run start parse SBKP --pattern $(date --date="yesterday" +%Y%m%d).*