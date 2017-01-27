--SET client_encoding = 'UTF8';
DROP function search(text);
CREATE FUNCTION search (text) RETURNS text as $$
SELECT row_to_json(fc)::text
 FROM
  ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type,
      ST_AsGeoJSON(ST_Transform(ST_simplify(lg.way, 50), 4326))::json As geometry,
          (
	          select row_to_json(t) from
		  (select
		  ST_AsGeoJSON(ST_Transform(ST_centroid(way), 4326)) as center,
		  ST_xmax(way)-ST_xmin(way) as width,
		  ST_ymax(way)-ST_ymin(way) as height
		  ) t
	   ) AS properties
			     FROM planet_osm_line As lg WHERE lg.osm_id=$1::int
   ) As f
)  As fc;
$$
LANGUAGE SQL;


