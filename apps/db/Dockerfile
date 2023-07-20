FROM mcr.microsoft.com/mssql/server

USER root

RUN apt-get update && apt-get -y --no-install-recommends install curl software-properties-common gnupg2

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

RUN add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/16.04/prod.list)" && apt-get update && apt-get install mssql-tools cron -y

WORKDIR /usr/bin

COPY apps/db/restore.sh /usr/bin/restore

RUN chmod +x /usr/bin/restore

USER mssql

CMD /opt/mssql/bin/sqlservr