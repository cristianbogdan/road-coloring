- `_index.js` loads the sub-project. You can test it with `test-leaflet.html` 
- `client/*` contains the client (front-end) application. 
  * before building the application, make sure there's a `.env` file inside `/client` and it is completed with the appropriate configurations. The available configurations can be found in `.env.local` 
  * to build the application and serve it locally, the `npm run build` commands needs to be executed
  * to build the application and serve it within the docker-compose infrastructure, the `npm run build-docker-env` commands needs to be executed
  * to build the application and serve it within the docker-compose infrastructure and use it for the https://proinfrastructura.ro domain, the `npm run build-docker-env` commands needs to be executed
  * the only part rendered at the server is the years over the segments, see  `nginx-infra.conf`   below
- `osmimport` takes care of fetching from OSM (overpass) the infrastructure project data, mostly runs in the [docker-osmimport](../docker-osmimport) container 
  * `osmimport/read-overpass.sh` reads data from OSM and places it in the `/data` folder
  *  `osmimport/crontab.in`  sets the frequency of the OSM import
  * after the OSM import, a small script is executed in the `mapnik-docker` container: `osmimport/rerender-projects.sh` 
- `nginx-infra.conf`  is the nginx fragment that configures this sub-project in the the [docker-mapnik](../docker-mapnik) container. 
  * in principle it maps `/infra` URIs to `tilestache` to write the years on the project map
  * it maps /click to deal with clicks on the map
  * `tilestache/infra.cfg` is the tilestache configuration for the project years. It makes use of the mapnik file `tilestache/osm_infra-noent.xml` 
  * HTML, CSS and JS files are served from `/work/maps/infra-projects/client/dist` after `npm run build` is run 
  * data is served from `/data` as per the general `docker-mapnik` nginx configuration

