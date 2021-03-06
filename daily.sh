#!/bin/bash
# see docker/Dockerfile

# run daily

#export LC_ALL="en_US.utf-8"
export PATH
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

echo `date` reading the map
OUTPUT=data/data-roads-new.osm.pbf
cd /home/cristi/maps
curl --fail --silent --show-error -d @overpass-roads.txt https://www.overpass-api.de/api/interpreter 2>data/err.txt | osmconvert - -o=$OUTPUT
if [ $(stat -c%s $OUTPUT) -gt 5000 ] ; then
    mv $OUTPUT data/data-roads.osm.pbf
else
    cat data/err.txt
    mv data/err.txt $(mktemp data/error-roads_XXXXXX)
    exit 1;
fi

echo `date` osm to psql
osm2pgsql --style osm2pgsql.style --slim --drop -d gis -c --extra-attributes data/data-roads.osm.pbf

if [[ $? -ne 0 ]] ; then
    echo "osm2pgsql failed, exiting..."
    date
    exit 1
fi


echo `date` creating log, cleaning up, creating json files for download

psql -d gis -f search/search.sql

psql -d gis -f after_import.sql 

#psql -q -t -A -d gis -f log.sql  > data/log.js
#./upload.sh log.js

psql -d gis -f cleanup.sql

cd tilestache/

echo `date` generating raster tiles for zoom levels 7 to 12
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -l tiles -e png -q -x --tile-list 
rm -rf /tmp/stache/tiles/13 /tmp/stache/tiles/14  /tmp/stache/tiles/15  /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

#ls -1 template/715-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -l tiles -e png -q -x --tile-list 
#rm -rf /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

echo `date` generating vector tiles for zoom levels 7 to 12
#ls -1 template/712roads-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
rm -rf /tmp/stache/roads/13 /tmp/stache/roads/14 /tmp/stache/roads/15 /tmp/stache/roads/16 /tmp/stache/roads/17 /tmp/stache/roads/18

echo `date` finished

#ls -1 template/1213roads-* | xargs -n1 -P1 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
#date

# tilestache-list.py  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - template/712roads-

#ls -1 template/list-* | xargs -n1 -P8 tilestache-seed.py -c tilestache.cfg -l roads -e json -q -x 7 8 9 10 11 12 13 --tile-list 
#date
