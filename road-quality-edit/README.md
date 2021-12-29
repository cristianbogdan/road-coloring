
- `edit.html` is the entry point. Loads JS files
- `nginx-edit.conf`  is the nginx fragment that configures this sub-project in the the [docker-mapnik](../docker-mapnik) container. 
  * it maps `/roads` URIs to `tilestache` to serve a vectorial layer with road segments, so they become sensitive on click, can be highlighted, etc
  * `tilestache/edit.cfg` is the tilestache configuration for the `roads` layer. It is a vectorial layer served directly by tilestache
  * `/route` calculates a route between two given points using `graphopper` and queries in the `postgis` database. Points can be given as place names (using nominatim at the client), road intersections, or GPS coordinates
  * `/mapedit` edits OSM using `osmapi`
  * JS files are served from `/work/maps/road-quality-edit`  

TODO: 
- the `roads` vector tiles do not seem to work correctly with Postgis 3+, latitude is about one unit higher. They only work with Postgis 2.5, which limits Postgresql version to 11. Postgis 3 prints `proj_create: crs not found` on each query
- non-ASCII characters in the edit comments do not seem to be accepted somewhere in the stack (maybe osmapi?)
- when the user enters From or To, the map could be zoomed there if the respective point is found. Show an error otherwise.
