This sub-project was intended to check issues with OSM mapping. It currently visualizes the roads that lack `maxspeed´ in OSM

- `speed.html` is the entry point. Loads JS files
- `nginx-speed.conf`  is the nginx fragment that configures this sub-project in the the [docker-mapnik](../docker-mapnik) container. 
  * it maps `/speed` URIs to `tilestache` to serve a vectorial layer with road segments which are then rendered at the client
  * `tilestache/speed.cfg` is the tilestache configuration for the `speed` layer. It is a vectorial layer served directly by tilestache
  * JS files are served from `/work/maps/osm-check`  
