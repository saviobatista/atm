#!/bin/bash

#CONSTANTS
declare -r PASSWORD='NavTakp190!'
declare -r SOURCE='/backup/'
declare -r DESTINATION='/var/opt/mssql/data/'

for entry in $SOURCE*
do
    banco=`echo "$entry" | sed 's/.*\/\([A-Za-z]*\).*/\1/'`
    #evita bancos internos do sql server
    if [[ $banco != 'master' ]] && [[ $banco != 'model' ]] && [[ $banco != 'msdb' ]]
    then
        echo "Restaurando banco de dados "$banco"..."
        #flag pra concatenacao
        extra=""
        while read -r line
        do
            file=`echo $line | cut -d '|' -f 1 -`
            oldpath=`echo $line | cut -d '|' -f 2 -`
            extra=$extra", MOVE '$file' TO '$DESTINATION$file'"
        done <<<$(/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$PASSWORD" -Q "SET NOCOUNT ON;RESTORE FILELISTONLY FROM DISK='$entry'" -s '|' -k1 -W -h -1)
        # Importa db
        query="DROP DATABASE IF EXISTS "$banco"; RESTORE DATABASE "$banco" FROM DISK='"$entry"' WITH REPLACE"$extra
        cmd=`echo '/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "'$PASSWORD'" -Q "'$query'" 2>&1'`
        eval "$cmd"
        echo "Processamento do banco de dados "$banco" finalizado"
    fi
done

