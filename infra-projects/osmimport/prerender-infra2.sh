#!/bin/sh
mkdir /tmp/stache/template
tilestache-list  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - /tmp/stache/template/712-

cd /work/maps/infra-proj2/tilestache
#echo "---- removing infra-proj2 vector tiles ----"
#mv /tmp/stache/infraVector /tmp/stache/infraVector-temp
#rm -rf /tmp/stache/infraVector-temp

echo `date` "---- generating infra-proj2 vector tiles for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra2.cfg.json -x -e json -l infraVector -q --tile-list

#echo "---- generating infra-proj2 raster tiles for zoom levels 7 to 12 ----"
#ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra2.cfg.json -x -e png -l infraGraphic -q --tile-list

echo `date` finished
chmod -R a+rw /tmp/stache
