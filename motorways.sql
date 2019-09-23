SELECT row_to_json(fc)
 FROM
  ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type,
      ST_AsGeoJSON(ST_Transform(ST_simplify(lg.way, 10), 4326))::json As geometry,
          (
	          select row_to_json(t) from (select osm_id, ref, name, railway, highway, construction, proposed, access, start_date, opening_date, check_date, description, status, maxspeed, bridge, tunnel) t
	   ) AS properties
			     FROM planet_osm_line As lg 
			     WHERE lg.osm_id>0 AND (
                                             lg.highway in('motorway', 'motorway_link') 
					     or lg.highway not in ('construction','proposed') and lg.opening_date is not null
					     or lg.highway in ('trunk', 'trunk_link', 'primary', 'primary_link', 'services', 'service') and lg.start_date >'1989'
					     or lg.construction in ('railway', 'motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'services', 'service')
					     or lg.proposed in ('railway', 'motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link','tertiary', 'tertiary_link', 'services', 'service')
					     or lg.railway in('proposed', 'construction')
					     )
			     order by  
			     	(case when highway='construction' then 100 when highway='proposed' then 1 else 2 end),
				(case when status is null then 'Z' else status end),
				(case when layer is null then 0 else ascii(layer)-ascii('0') end ) 
   ) As f
)  As fc;
			     




