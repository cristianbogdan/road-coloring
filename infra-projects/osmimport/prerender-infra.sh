#!/bin/sh
# executed in the docker-mapnik after a USR2 signal
echo "-------------- removing infra --------------------------"
mv /tmp/stache/infra /tmp/stache/infra-temp
rm -rf /tmp/stache/infra-temp
echo "-------------- done removing infra ---------------------"
