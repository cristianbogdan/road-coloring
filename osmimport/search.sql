SET client_encoding = 'UTF8';
DROP FUNCTION unaccent_string(text);
CREATE FUNCTION unaccent_string (text) RETURNS text as $$ SELECT translate(  $1,  'ăîșțâ', 'aista') $$ LANGUAGE SQL;
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
			     (SELECT way as way,  '0' as type FROM planet_osm_polygon WHERE unaccent_string(lower($1)) = unaccent_string(lower(name)) and place is not null)
			     union
			     (SELECT way as way, '1' as type FROM planet_osm_point WHERE unaccent_string(lower($1))= unaccent_string(lower(name)) and place is not null)
			     union
			    (SELECT ST_union(way) as way, '2' as type FROM planet_osm_line WHERE highway is not null and lower($1) in (lower(osm_id::text), lower(name), lower(ref))
			    --and not highway in ('construction', 'proposed')
			    group by highway) 

			     )
as lg 
 order by lg.type, st_length(lg.way) desc  )As f
)  As fc;
$$
LANGUAGE SQL;


