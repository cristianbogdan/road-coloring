#!/bin/bash
# install: postgress, postgis, osm2pgsql, 

# create gis db:
# createdb -E UTF-8 -O USERNAME gis
# run postgis SQL scripts, paths on your system may differ:
# psql -d gis -f /usr/local/share/postgis/postgis.sql
# psql -d gis -f /usr/local/share/postgis/spatial_ref_sys.sql
# psql -d gis -c "CREATE EXTENSION postgis"
# psql -d gis -c "CREATE EXTENSION hstore"

# npm install -g topojson

# brew install python
# easy_install pip
# sudo pip install tilestache
# sudo pip install mapnik and all other tilestache dependencies

#brew install nginx --with-passenger --with-gzip
# follow Caveats instructions "to activate passenger"...

# run daily

#export LC_ALL="en_US.utf-8"
export PATH
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin


echo `date` reading the map
cd /Users/cristi/maps
cp data/romania-latest.osm.pbf data/romania.latest.osm.bak.pbf
cd data; wget -N http://download.geofabrik.de/europe/romania-latest.osm.pbf 2> download-status.txt
cd ..
grep "not retrieving" data/download-status.txt
if [[ $? -eq 0 ]] ; then
    tail data/download-status.txt
    echo "no download, exiting"
    date
    exit 1
fi
tail download-status.txt

osm2pgsql --host localhost --slim -d gis -C 1600 --hstore --number-processes 8 --style osm2pgsql.style  --extra-attributes data/romania-latest.osm.pbf

if [[ $? -ne 0 ]] ; then
    echo "osm2pgsql failed, exiting..."
    date
    exit 1
fi


echo `date` creating log, cleaning up, creating json files for download

psql -d gis -f after_import.sql 

psql -q -t -A -d gis -f log.sql  > data/log.js
#./upload.sh log.js

psql -d gis -f cleanup.sql

psql -t -A -d gis -f motorways.sql > data/motorways.json

psql -t -A -d gis -f smoothness-trunk.sql > data/main-roads.json
geo2topo -p -o data/main-roads.topo.json -- data/main-roads.json
(echo "mainRoads="; cat data/main-roads.topo.json ; echo ";";)> data/main-roads.topo.json.js

psql -t -A -d gis -f smoothness-other.sql > data/other-roads.json
geo2topo -p -o data/other-roads.topo.json -- data/other-roads.json
(echo "otherRoads="; cat data/other-roads.topo.json ; echo ";";)> data/other-roads.topo.json.js

#psql -t -A -d gis -f all-roads.sql > all-roads.json
#geo2topo -p -o all-roads.topo.json -- all-roads.json
#(echo "allRoads="; cat all-roads.topo.json ; echo ";";)> all-roads.topo.json.js

#./upload.sh main-roads.topo.json.js
#./upload.sh other-roads.topo.json.js 
#./upload.sh all-roads.topo.json.js 

cd tilestache/

echo `date` generating raster tiles for zoom levels 7 to 12
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -l tiles -e png -q -x --tile-list 
rm -rf /tmp/stache/tiles/13 /tmp/stache/tiles/14  /tmp/stache/tiles/15  /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

#ls -1 template/715-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -l tiles -e png -q -x --tile-list 
#rm -rf /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

echo `date` generating vector tiles for zoom levels 7 to 12
#ls -1 template/712roads-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
#ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
rm -rf /tmp/stache/roads/13 /tmp/stache/roads/14 /tmp/stache/roads/15 /tmp/stache/roads/16 /tmp/stache/roads/17 /tmp/stache/roads/18
#rm -rf /tmp/stache/roads/13 /tmp/stache/roads/14 /tmp/stache/roads/15 /tmp/stache/roads/16 /tmp/stache/roads/17 /tmp/stache/roads/18

echo `date` generating raster tiles for opening_date, zoom levels 7 to 12
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -x -e png -l infra -q --tile-list
rm -rf /tmp/stache/infra/13 /tmp/stache/infra/14 /tmp/stache/infra/15 /tmp/stache/infra/16 /tmp/stache/infra/17 /tmp/stache/infra/18

echo `date` finished

#ls -1 template/1213roads-* | xargs -n1 -P1 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
#date

# tilestache-list.py  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - template/712roads-

#ls -1 template/list-* | xargs -n1 -P8 tilestache-seed.py -c tilestache.cfg -l roads -e json -q -x 7 8 9 10 11 12 13 --tile-list 
#date
