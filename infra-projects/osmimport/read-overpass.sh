#!/bin/bash
echo DB gis1 configuration, if it does not exist
createdb -Upostgres -E UTF-8 gis1 && psql -Upostgres -d gis1 -c "CREATE EXTENSION postgis"

echo Reading from overpass. This may take some time
cd /work/maps/infra-projects/osmimport
curl --insecure --fail-with-body --silent  --show-error -d @overpass-infra.txt https://www.overpass-api.de/api/interpreter > /data/data-overpass-infra.osm.new
if [ $(stat -c%s /data/data-overpass-infra.osm.new) -gt 5000 ] ; then
    mv /data/data-overpass-infra.osm.new /data/data-overpass-infra.osm
else
    echo overpass FAIL
    cat /data/data-overpass-infra.osm.new 
    mv /data/data-overpass-infra.osm.new $(mktemp /data/error_XXXXXX)
    exit 1;
fi
echo attempting to geojson
osmtogeojson /data/data-overpass-infra.osm > /data/data-overpass-infra.geo.json
osmconvert /data/data-overpass-infra.osm -o=/data/data-overpass-infra.osm.pbf
osm2pgsql -Upostgres --style /work/maps/common/osm2pgsql.style --slim --drop -d gis1 -c /data/data-overpass-infra.osm.pbf

echo lot limits
psql -Upostgres -t -A -d gis1 -f lot_limits.sql >  /data/lot_limits.json

echo duplicating planet_osm_line
psql -Upostgres -d gis1 -c "drop table planet_osm_line1;"
psql -Upostgres -d gis1 -c "SELECT UpdateGeometrySRID('planet_osm_line','way',900913);"
psql -Upostgres -d gis1 -c "select * into planet_osm_line1 from planet_osm_line;"
psql -Upostgres -t -A -d gis1 -f infra-projects.sql > /data/data-sql-infra.geo.json

# send the USR1 signal to the rendering container, so the "infra" tiles are removed because they are stale
# see docker-mapnik/start.sh
kill -s USR2 1

echo `date` finished
