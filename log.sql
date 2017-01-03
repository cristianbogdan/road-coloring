SET client_encoding = 'UTF8';
select 'var log='|| array_to_json(array_agg(fc))||';' from
 (
 select extract('epoch' from max(su.osm_timestamp))::bigint  as time, 
 su.osm_user, 
 case when l.ref is null then l.name else l.ref end as ref, su.old_smoothness, su.new_smoothness,
 string_agg(distinct c.name, ', ') as cities, 
 string_agg(distinct su.osm_changeset::text, ',') as changesets, new_survey
from
   smoothness_updates su 
   join planet_osm_line l  on l.osm_id= su.osm_id 
   left join planet_osm_point c on 
      (c.place in ('city', 'town') and ST_distance(c.way, l.way)<6000 
       or (c.place='village') and ST_distance(c.way, l.way)<2000)
where not(su.new_survey like '%RRQM%')
group by
      su.osm_user, case when l.ref is null then l.name else l.ref end, su.old_smoothness, su.new_smoothness, new_survey
order by time desc) as fc;
