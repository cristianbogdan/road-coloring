- Entry points:
  * `test-maps.html` tests the sub-project with Thunderforest background using `tiles.js`. See `_index.js`, used also from proinfrastructura.ro 
  * `test-hcd.html` tests the sub-project with google background using `vector-hcd.js`. See `_roadQuality-gmaps.js`, can be used from proinfrastructura.ro, using `vector-hcd.js` 
  * `index.html`, home without the `_index.js` mechanism
  * `full.html` full screen
- `osmimport` takes care of fetching from OSM (overpass) the infrastructure project data, mostly runs in the [docker-osmimport](../docker-osmimport) container 
  * `osmimport/daily.sh` reads data from OSM and places it in the `/data` folder
  *  `osmimport/crontab.in`  sets the frequency of the OSM import
  * after the OSM import, a prerendering script is executed in the `mapnik-docker` container: `osmimport/rerender-quality.sh` 
- `nginx-quality.conf`  is the nginx fragment that configures this sub-project in the the [docker-mapnik](../docker-mapnik) container. 
  * in principle it maps `/tiles` URIs to `tilestache` to draw the quality colors and write the year/ road name texts along the lines
  * `tilestache/quality.cfg` is the tilestache configuration for the `tiles` layer. It makes use of the mapnik file `tilestache/osm-noent.xml` 
  * JS files are served from `/work/maps/road-quality`  

TODO:
- incremental update from OSM so more frequent updates can be made
- the `log` file are supposed to show the a log of road quality editing by various OSM users. 
   * Stopped working propertly a few years ago when geofabrik stopped including user data in their export files due to GDPR. 
   * We are not using geofabrik any longer but an overpass script. So Maybe this can be fixed
