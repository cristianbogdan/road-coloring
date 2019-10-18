#!/bin/bash
cd /home/cristi/maps
curl --fail --silent --show-error -d @overpass.txt https://www.overpass-api.de/api/interpreter &> data/data-overpass.json.new 
if [ $(stat -c%s data/data-overpass.json.new) -gt 5000 ] ; then
    mv data/data-overpass.json.new data/data-overpass.json
else
    mv data/data-overpass.json.new $(mktemp data/error_XXXXXX)
fi
