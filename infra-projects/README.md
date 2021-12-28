- `_index.js` loads the sub-project. You can test it with `test-projects.html` 
- `vector-gmaps.js` renders the sub-project at the client. 
  * the only part rendered at the server is the years over the segments, see  `nginx-infra.conf`   below
- `osmimport` takes care of fetching from OSM (overpass) the infrastructure project data, mostly runs in the [docker-osmimport](../docker-osmimport) container 
  * `osmimport/read-overpass.sh` reads data from OSM and places it in the `/data` folder
  *  `osmimport/crontab.in`  sets the frequency of the OSM import
  * after the OSM import, a small script is executed in the `mapnik-docker` container: `osmimport/rerender-projects.sh` 
- `nginx-infra.conf`  is the nginx fragment that configures this sub-project in the the [docker-mapnik](../docker-mapnik) container. 
  * in principle it maps `/infra` URIs to `tilestache` to write the years on the project map
  * `tilestache/infra.cfg` is the tilestache configuration for the project years. It makes use of the mapnik file `tilestache/osm_infra-noent.xml` 
  * JS files are served from `/work/maps/infra-projects`  
  * data is served from `/data` as per the general `docker-mapnik` nginx configuration

TODO: 
- the sub-project data became very large and is loaded in one go, which makes loading and rendering slow. 
  * only a few details should be loaded initially
  * and/or the geometry should be simplified
