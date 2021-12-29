drop table roads;
select concat('', osm_id) as osm_id, ref, way, smoothness, surface_survey, surface, z_order, highway, name, access, ST_StartPoint(way) as wstart, ST_endPoint(way) as wend  into roads from planet_osm_line
where osm_id>0 and highway is not null
--where smoothness is not null
;
alter table roads add column id serial;
create unique index roads_pkey on roads using btree (id);
--create index roads_way on roads using gist (way);
--create index roads_smoothness on roads using btree (smoothness);
--create index roads_surface on roads using btree (surface);
--create index roads_surface_survey on roads using btree (surface_survey);
--create index roads_access on roads using btree (access);
--create index roads_name on roads using btree (name);
create index roads_ref on roads using btree (ref);
--create index roads_highway on roads using btree (highway);
create index roads_wstart on roads using btree (wstart);
create index roads_wend on roads using btree (wend);

 
DROP function cleanup();
CREATE FUNCTION cleanup() RETURNS INTEGER AS $$
DECLARE pair RECORD;
DECLARE ret INTEGER :=0	;
DECLARE inserted INTEGER:=0;
DECLARE deleted INTEGER:=0;
DECLARE del INTEGER;
DECLARE del2 INTEGER;
BEGIN


FOR pair IN
select a.id as aosm, b.id as bosm, b.way as bway, b.osm_id as bosmid, a.osm_id as aosmid, a.way as away, b.way as bway
from roads a, roads b
where
a.id < b.id
and (a.wend =b.wstart or a.wend=b.wend or a.wstart=b.wend or a.wstart=b.wstart)
---a.smoothness is not null
-- and a.highway is not null
and (a.ref is null and b.ref is null or a.ref=b.ref)
and b.highway=a.highway
and (a.name is null and b.name is null or a.name= b.name)
and (a.smoothness is null and b.smoothness is null or a.smoothness=b.smoothness )
and (a.surface_survey is null and b.surface_survey is null or a.surface_survey=b.surface_survey)
and (a.surface is null and b.surface is null or a.surface=b.surface)
and (a.access is null and b.access is null or a.access=b.access)
--and
--(ST_StartPoint(a.way) IN (ST_StartPoint(b.way), ST_endPoint(b.way))
--or
--ST_EndPoint(a.way) IN (ST_StartPoint(b.way), ST_endPoint(b.way)))

--and a.z_order is not distinct from b.z_order

order by bosm
--LIMIT 1000
LOOP
    --RAISE NOTICE 'joining % with %', pair.aosm, pair.bosm;

     SELECT COUNT(*) INTO del  FROM roads WHERE id=pair.bosm;
     SELECT COUNT(*) INTO del2  FROM roads WHERE id=pair.aosm;
     IF del=1 AND del2= 1 THEN
          SELECT ST_NumGeometries( ST_LineMerge(ST_collect(way, pair.bway))) INTO del FROM roads WHERE id = pair.aosm;
	  IF del=1 THEN
             UPDATE roads set way= ST_LineMerge(ST_collect(pair.bway, way)), osm_id=concat(osm_id, ',', pair.bosmid) where id = pair.aosm;	     
             GET DIAGNOSTICS del = ROW_COUNT;	
	     IF del=0 THEN
	          ----RAISE NOTICE 'could not merge  % with % ????', pair.aosm, pair.bosm;
		  RETURN -1;
	     ELSE
	        inserted := inserted +1;
		DELETE FROM roads WHERE id=pair.bosm;
		GET DIAGNOSTICS del = ROW_COUNT;	
--		RAISE NOTICE 'deleted %  %', pair.bosm, del;
		ret:= ret+del;
		deleted:=deleted+del;
	    END IF;
	    UPDATE roads set wstart= ST_startPoint(way), wend=ST_endPoint(way) where id=pair.aosm;

            ELSE	
---    	       	 RAISE NOTICE '% and % could not be merged',pair.aosmid, pair.bosmid;
	    END IF;
      ELSE
--	       	 RAISE NOTICE '% % was deleted ',(1-del)*pair.aosm, (1-del2)*pair.bosm;
      END IF;
      	  
END LOOP;     

--	       	 RAISE NOTICE '%  inserts % deletes ', inserted, deleted;
return ret;
 END;
 $$
LANGUAGE plpgsql;

DROP function rep();
CREATE FUNCTION rep() RETURNS INTEGER AS $$
DECLARE x integer;
DECLARE ret integer:=0;

BEGIN

LOOP
  SELECT cleanup() into x;
    IF x = 0 THEN
        EXIT;  -- exit loop
    END IF;
    RAISE NOTICE '% found',x;
    ret:=ret+x;
END LOOP;

RETURN ret;
 END;
 $$
LANGUAGE plpgsql;

-- SELECT rep();

create index roads_way on roads using gist (way);
create index roads_smoothness on roads using btree (smoothness);
create index roads_surface on roads using btree (surface);
create index roads_surface_survey on roads using btree (surface_survey);
create index roads_access on roads using btree (access);
create index roads_name on roads using btree (name);
--create index roads_ref on roads using btree (ref);
create index roads_highway on roads using btree (highway);
