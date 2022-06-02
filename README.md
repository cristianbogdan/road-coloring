# Road coloring

Each sub-project has its own README: [infra-projects](infra-projects),  [road-quality](road-quality),  [road-quality-edit](road-quality-edit),  [osm-check](osm-check)

Docker containers: 
- [docker-mapnik](docker-mapnik) is used for map rendering and running the sub-projects. Uses a `postgis` database provided by a standard container (user `postgresql`)
- [docker-osmimport](docker-osmimport) is used for retrieving OSM data regularly, saving it in the `postgis` database for rendering by `docker-mapnik` and in `/data/` for serving directly to clients

Production sites:
- `infra-projects` https://proinfrastructura.ro/proiecteinfrastructura.html  
- `road-quality` https://proinfrastructura.ro/harta-calitatii-drumurilor.html
- `road-quality` https://pum.project-online.se/maps/
- `road-quality` with Google Maps background https://pum.project-online.se/maps/test-hcd.html
- `road-quality-edit` https://pum.project-online.se/maps/edit.html
- `osm-check` https://pum.project-online.se/maps/speed.html
