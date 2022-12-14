#!/bin/bash
# see docker-osmimport/Dockerfile
# At first start, undump smoothness_updates table from another system into smoothness-dump.sql

# run daily
echo `date` reading the map
echo "DB gis configuration, if it does not exist"
createdb -Upostgres -E UTF-8 gis && psql -Upostgres -d gis -c "CREATE EXTENSION postgis" && psql -Upostgres -d gis < /data/smoothness-dump.sql

echo  `date` reading from overpass. This may take some time
OUTPUT=/data/data-roads-new.osm
cd /work/maps/road-quality/osmimport
curl --fail-with-body --silent --show-error -d @overpass-roads.txt https://www.overpass-api.de/api/interpreter > $OUTPUT
if [ $(stat -c%s $OUTPUT) -gt 5000 ] ; then
    mv $OUTPUT /data/data-roads.osm
    osmconvert /data/data-roads.osm -o=/data/data-roads.osm.pbf
else
    echo `date` error, exiting
    cat $OUTPUT
    mv $OUTPUT $(mktemp /data/error-roads_XXXXXX)
    exit 1;
fi

echo `date` osm to psql
osm2pgsql -Upostgres --style /work/maps/common/osm2pgsql.style --slim --drop -d gis -c --extra-attributes /data/data-roads.osm.pbf

if [[ $? -ne 0 ]] ; then
    echo "osm2pgsql failed, exiting..."
    date
    exit 1
fi


echo `date` creating log, cleaning up, creating json files for download

psql -Upostgres -d gis -f after_import.sql 

#psql -q -t -A -d gis -f log.sql  > data/log.js
#./upload.sh log.js

psql -Upostgres -d gis -f cleanup.sql

# send the USR1 signal to the rendering container, so the tiles are pre-rendered
# see docker-mapnik/start.sh, tilestache/pre-render* 
kill -s USR1 1

echo `date` finished

