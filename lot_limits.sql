SELECT row_to_json(fc)
 FROM
  ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type,
      ST_AsGeoJSON(ST_Transform(pt.way, 4326))::json As geometry,
          (
	          select row_to_json(t) from (select osm_id, name, highway) t
	   ) AS properties
			     FROM planet_osm_point As pt WHERE pt.highway='lot_limit'

   ) As f
)  As fc;
			     




