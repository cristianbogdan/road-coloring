#!/bin/bash
# executed in the docker-mapnik after a USR1 signal

# this is how to generate the template folders
# tilestache-list.py  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - template/712-
cd /work/maps/road-quality/tilestache

echo "---- removing raster tiles ----"
mv /tmp/stache/tiles /tmp/stache/tiles-temp
rm -rf /tmp/stache/tiles-temp

echo "---- generating raster tiles for zoom levels 7 to 12 ---"
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c quality.cfg -l tiles -e png -q -x --tile-list 
#rm -rf /tmp/stache/tiles/13 /tmp/stache/tiles/14  /tmp/stache/tiles/15  /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

#ls -1 template/715-* | xargs -n1 -P4 tilestache-seed.py -c tilestache.cfg -l tiles -e png -q -x --tile-list 
#rm -rf /tmp/stache/tiles/16  /tmp/stache/tiles/17  /tmp/stache/tiles/18  

cd /work/maps/road-quality-edit/tilestache
echo "---- removing vector tiles ----"
mv /tmp/stache/roads /tmp/stache/roads-temp
rm -rf /tmp/stache/roads-temp

echo "---- generating vector tiles for zoom levels 7 to 12 ----"
ls -1 template/712-* | xargs -n1 -P4 tilestache-seed.py -c edit.cfg -x -e json -l roads -q --tile-list
#rm -rf /tmp/stache/roads/13 /tmp/stache/roads/14 /tmp/stache/roads/15 /tmp/stache/roads/16 /tmp/stache/roads/17 /tmp/stache/roads/18

echo finished
chmod -R a+rw /tmp/stache

#ls -1 template/1213roads-* | xargs -n1 -P1 tilestache-seed.py -c tilestache.cfg -x -e json -l roads -q --tile-list
#date

#ls -1 template/list-* | xargs -n1 -P8 tilestache-seed.py -c tilestache.cfg -l roads -e json -q -x 7 8 9 10 11 12 13 --tile-list 
#date
