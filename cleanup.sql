drop table roads;
select concat('', osm_id) as osm_id, ref, way, smoothness, surface_survey, highway into roads from planet_osm_line
where highway in ('motorway', 'motorway_link', 'trunk', 'primary', 'secondary', 'tertiary')
--where smoothness is not null
;
alter table roads add column id serial;
create unique index roads_pkey on roads using btree (id);
create index roads_way on roads using gist (way);

 
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
select a.id as aosm, b.id as bosm, b.way as bway, b.osm_id as bosmid, a.osm_id as aosmid
from roads a, roads b
where
a.ref =b.ref

---a.smoothness is not null
-- and a.highway is not null
and b.highway=a.highway
and a.id < b.id
and (a.smoothness is null and b.smoothness is null or
a.smoothness=b.smoothness and a.surface_survey=b.surface_survey)
and
(ST_StartPoint(a.way) IN (ST_StartPoint(b.way), ST_endPoint(b.way))
or
ST_EndPoint(a.way) IN (ST_StartPoint(b.way), ST_endPoint(b.way)))
order by bosm
---LIMIT 1000
LOOP
     RAISE NOTICE 'joining % with %', pair.aosm, pair.bosm;

     SELECT COUNT(*) INTO del  FROM roads WHERE id=pair.bosm;
     SELECT COUNT(*) INTO del2  FROM roads WHERE id=pair.aosm;
     IF del=1 AND del2= 1 THEN
          SELECT ST_NumGeometries( ST_LineMerge(ST_collect(way, pair.bway))) INTO del FROM roads WHERE id = pair.aosm;
	  IF del=1 THEN
             UPDATE roads set way= ST_LineMerge(ST_collect(pair.bway, way)), osm_id=concat(osm_id, ',', pair.bosmid) where id = pair.aosm; 
	     
             GET DIAGNOSTICS del = ROW_COUNT;	
	     IF del=0 THEN
	          RAISE NOTICE 'could not merge  % with % ????', pair.aosm, pair.bosm;
		  RETURN -1;
	     ELSE
	        inserted := inserted +1;
		DELETE FROM roads WHERE id=pair.bosm;
		GET DIAGNOSTICS del = ROW_COUNT;	
		RAISE NOTICE 'deleted %  %', pair.bosm, del;
		ret:= ret+del;
		deleted:=deleted+del;
	    END IF;
            ELSE	
    	       	 RAISE NOTICE '% and % could not be merged',pair.aosmid, pair.bosmid;
	    END IF;
      ELSE
	       	 RAISE NOTICE '% % was deleted ',(1-del)*pair.aosm, (1-del2)*pair.bosm;
      END IF;
      	  
END LOOP;     

	       	 RAISE NOTICE '%  inserts % deletes ', inserted, deleted;
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
    ret:=ret+x;
END LOOP;

RETURN ret;
 END;
 $$
LANGUAGE plpgsql;

SELECT rep();
