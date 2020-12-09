#!/bin/bash
cd /home/cristi/maps
curl --fail --silent --show-error -d @overpass-infra.txt https://www.overpass-api.de/api/interpreter &> data/data-overpass-infra.osm.new 
if [ $(stat -c%s data/data-overpass-infra.osm.new) -gt 5000 ] ; then
    mv data/data-overpass-infra.osm.new data/data-overpass-infra.osm
else
    mv data/data-overpass-infra.osm.new $(mktemp data/error_XXXXXX)
    exit 1;
fi
osmtogeojson data/data-overpass-infra.osm > data/data-overpass-infra.geo.json
osmconvert data/data-overpass-infra.osm -o=data/data-overpass-infra.osm.pbf
osm2pgsql --style osm2pgsql.style --slim --drop -d gis1 -c data/data-overpass-infra.osm.pbf
psql -t -A -d gis1 -f lot_limits.sql >  data/lot_limits.json
