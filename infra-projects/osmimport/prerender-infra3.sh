#!/bin/sh
# executed in the docker-mapnik after a USR2 signal
mkdir /tmp/stache/template
tilestache-list  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - /tmp/stache/template/712-

cd /work/maps/infra-proj3/tilestache
echo "---- removing infra-proj2 raster tiles ----"
#mv /tmp/stache/infraGraphic1 /tmp/stache/infraGraphic-temp
#rm -rf /tmp/stache/infraGraphic-temp


#echo "---- removing infra-proj2 vector tiles ----"
#mv /tmp/stache/infraVector /tmp/stache/infraVector-temp
#rm -rf /tmp/stache/infraVector-temp

#echo "---- generating infra-proj2 vector tiles for zoom levels 7 to 12 ----"
#ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra2.cfg.json -x -e json -l infraVector -q --tile-list

echo "---- generating infra-proj2 raster tiles 1 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic1 -q --tile-list
echo "---- generating infra-proj2 raster tiles 2 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic2 -q --tile-list
echo "---- generating infra-proj2 raster tiles 3 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic3 -q --tile-list
echo "---- generating infra-proj2 raster tiles 4 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic4 -q --tile-list
echo "---- generating infra-proj2 raster tiles 5 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic5 -q --tile-list
echo "---- generating infra-proj2 raster tiles 6 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic6 -q --tile-list
echo "---- generating infra-proj2 raster tiles 7 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic7 -q --tile-list
echo "---- generating infra-proj2 raster tiles 8 for zoom levels 7 to 12 ----"
ls -1 /tmp/stache/template/712-* | xargs -n1 -P4 tilestache-seed.py -c infra3.cfg.json -x -e png -l infraGraphic8 -q --tile-list

echo finished
chmod -R a+rw /tmp/stache
