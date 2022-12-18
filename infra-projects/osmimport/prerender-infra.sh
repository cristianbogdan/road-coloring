#!/bin/sh
# executed in the docker-mapnik after a USR2 signal
echo "-------------- removing infra --------------------------"
mv /tmp/stache/infra /tmp/stache/infra-temp
rm -rf /tmp/stache/infra-temp
echo "-------------- done removing infra ---------------------"

mkdir /tmp/stache/template
tilestache-list  -b 48 20 43 29 7 8  9 10 11 12  | split -l 200 - /tmp/stache/template/712-

chmod -R a+rw /tmp/stache
