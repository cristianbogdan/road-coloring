#!/bin/bash
chmod -R a+rw /tmp/stache
trap "/work/maps/road-quality/osmimport/prerender-quality.sh 2>1 >>/data/daily.log" USR1
trap "/work/maps/infra-projects/osmimport/prerender-projects.sh" USR2

nginx &

while
    /bin/true ; do
    sleep 1
done

#nginx -g "daemon off;"
