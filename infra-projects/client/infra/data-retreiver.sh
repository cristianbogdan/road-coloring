echo "Downloading overpass data"
curl --insecure --fail-with-body --show-error -d @/run/map/overpass-query https://www.overpass-api.de/api/interpreter > /run/map/overpassdata.osm

echo "Converting to geojson"
osmtogeojson /run/map/overpassdata.osm > /srv/map/dist/overpass-data.json

echo "Delete downloaded file, no longer needed"
rm /run/map/overpassdata.osm
