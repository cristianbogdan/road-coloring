#!/bin/sh
# executed in the docker-mapnik after a USR2 signal
echo "-------------- removing infra --------------------------"
rm -rf /tmp/stache/infra
