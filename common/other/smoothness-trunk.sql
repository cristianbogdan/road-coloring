SELECT row_to_json(fc)
 FROM
  ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type,
      ST_AsGeoJSON(ST_Transform(ST_simplify(lg.way, 50), 4326))::json As geometry,
          (
	          select row_to_json(t) from (select smoothness, highway, surface_survey, ref) t
	   ) AS properties
			     FROM roads As lg WHERE lg.smoothness is not null and lg.highway in ('trunk', 'motorway', 'motorway_link', 'primary')
   ) As f
)  As fc;
			     


