SET client_encoding = 'UTF8';
DROP function search(text);
CREATE FUNCTION search (text) RETURNS text as $$
SELECT row_to_json(fc)::text
 FROM
  ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type,
      ST_AsGeoJSON(ST_Transform(lg.way, 4326))::json As geometry,
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
			     (SELECT way as way,  concat('0',place) as type FROM planet_osm_polygon WHERE unaccent_string($1) = unaccent_string(name) and place is not null)
			     union
			     (SELECT way as way, concat('1',place) as type FROM planet_osm_point WHERE unaccent_string($1)= unaccent_string(name) and place is not null)
			     union
			    (SELECT ST_union(way) as way, concat('2',highway) as type FROM planet_osm_line WHERE highway is not null and $1 in (osm_id::text, name, ref) group by highway) 

			     )
as lg 
 order by lg.type  )As f
)  As fc;
$$
LANGUAGE SQL;


