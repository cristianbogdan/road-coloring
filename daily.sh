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
# sudo apt-get install python-shapely
# sudo pip install mapbox-vector-tile
# sudo pip install psycopg2-binary
# sudo pip install osmapi
# define functions search() and unaccent_string()
# copy tilestache/template/* or generate them with tilestache-list (see below)

#brew install nginx --with-passenger --with-gzip
# follow Caveats instructions "to activate passenger"...
# on ubuntu follow https://www.phusionpassenger.com/library/install/nginx/install/oss/xenial/

# run daily

#export LC_ALL="en_US.utf-8"
export PATH
PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin


echo `date` reading the map
OUTPUT=data/data-test-new.osm.pbf
cd /home/cristi/maps
curl --fail --silent --show-error -d @overpass.txt https://www.overpass-api.de/api/interpreter 2>data/err.txt | osmconvert - -o=$OUTPUT
if [ $(stat -c%s $OUTPUT) -gt 5000 ] ; then
    mv $OUTPUT data/data-test.osm.pbf
else
    cat data/err.txt
    mv data/err.txt $(mktemp data/error_XXXXXX)
    exit 1;
fi

