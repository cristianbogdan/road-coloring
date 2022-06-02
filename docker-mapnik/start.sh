#!/bin/bash
chmod -R a+rw /tmp/stache
trap "/work/maps/road-quality/osmimport/prerender-quality.sh" USR1
trap "/work/maps/infra-projects/osmimport/prerender-infra.sh" USR2

#nginx &

#while
#    /bin/true ; do
#    sleep 1
#done

nginx -g "daemon off;"
