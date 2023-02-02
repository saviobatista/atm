FROM mcr.microsoft.com/mssql/server

USER root

RUN apt-get update && apt-get install cron -y

WORKDIR /usr/bin

COPY apps/db/wait-for-it.sh /usr/bin/wait-for-it

RUN chmod +x /usr/bin/wait-for-it

COPY apps/db/restore.sh /usr/bin/restore

RUN chmod +x /usr/bin/restore

RUN crontab -l | { cat; echo "0 7 * * * restore"; } | crontab -

USER mssql

ENTRYPOINT /opt/mssql/bin/sqlservr