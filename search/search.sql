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
		  ST_ymax(way)-ST_ymin(way) as height,
		  type
		  ) t
	   ) AS properties
			     FROM(
			     (SELECT way as way, place as type FROM planet_osm_polygon WHERE unaccent_string($1) in (unaccent_string(name), unaccent_string(ref)))
			     union
			      (SELECT ST_union(way) as way, 'road' as type FROM planet_osm_line WHERE $1 in (osm_id::text, name, ref)) 

			     )
as lg 
 order by lg.type  )As f
)  As fc;
$$
LANGUAGE SQL;


