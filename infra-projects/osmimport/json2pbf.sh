# pip install geobuf
# cp -r /tmp/stache/infraVector /tmp/stache/infraPbf
# find /tmp/stache/infraPbf -name *.json -exec ./json2pbf.sh {} \;

geobuf encode < $1 >`dirname "$1"`/`basename "$1" .json`.pbf  && rm $1

