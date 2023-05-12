# attempt to convert GeoJSON tiles to PBF. does not seem to work well so far
# see json-vt-pbf.js
# cp -r /tmp/stache/infraVector /tmp/stache/infraPbf
# find infraPbf -name "*.json" -exec ./convert.sh {} \;

echo $1
node json-vt-pbf.js < $1 >`dirname "$1"`/`basename "$1" .json`.pbf  && rm $1

