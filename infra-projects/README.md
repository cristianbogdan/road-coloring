- `index.js` loads the sub-project. You can test it with `test-projects.html` 
- `vector-gmaps.js` renders the sub-project at the client. Most rendering of this sub-project is there.
  * the only part rendered at the server is the years over the segments, see  `nginx-infra.conf`   below
- `osmimport` takes care of fetching from OSM (overpass) the infrastructure project data, mostly runs in the [osmimport-docker](../osmimport-docker) container 
  * `osmimport/read-overpass.sh` reads data from OSM and places it in the `/data` folder
  *  `osmimport/crontab.in`  sets the frequency of the OSM import
  * after the OSM import, a small script is executed in the `mapnik-docker` container: `osmimport/rerender-projects.sh` 
- data and JS files are served by the [mapnik-docker](../mapnik-docker) container
- `nginx-infra.conf`  is the nginx fragment that configures this sub-project in the the [mapnik-docker](../mapnik-docker) container. In principle it maps `/infra` URIs to `tilestache` to write the years on the project map
  * `tilestache/infra.cfg` is the tilestache configuration for the project years. It makes use of the mapnik file `tilestache/osm_infra-noent.xml` 

TODO: 
- the project data became very large and is loaded in one go. Only a few details should be loaded initially. Or the geometry should be simplified.
