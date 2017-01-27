-- (echo "bridges=";psql -t -A -d gis -f bridges.sql;echo ";")>data/bridges.js
SELECT array_to_json(array_agg(fc))
 FROM(
select
b.osm_id as ids,
st_length(b.way)::int as len,
b.ref as ref,
a.surface as surface,
b.smoothness as old_smoothness,
--b.surface_survey as old_survey,
(select regexp_matches(b.surface_survey, '[0-9][0-9][0-9][0-9]')),
a.smoothness as smoothness,
(select regexp_matches(a.surface_survey, '[0-9][0-9][0-9][0-9]')),
(select regexp_matches(c.surface_survey, '[0-9][0-9][0-9][0-9]'))
,a.surface_survey as surface_survey
from roads a, roads b, roads c
where a.osm_id<>b.osm_id and b.osm_id<>c.osm_id
and st_length(b.way) < st_length(a.way)
and st_length(b.way) < st_length(c.way)
and a.ref=b.ref and b.ref=c.ref
and a.highway=b.highway and b.highway=c.highway
and c.osm_id<>a.osm_id
and b.wstart in(a.wstart, a.wend)
and b.wend in(c.wstart, c.wend)
and (b.smoothness is null or b.smoothness <> a.smoothness)
and a.smoothness=c.smoothness
and a.surface=c.surface
and (b.surface_survey is null or a.surface_survey is null or c.surface_survey is null or a.surface_survey<> c.surface_survey or b.surface_survey<> a.surface_survey)
--and a.surface_survey=c.surface_survey
and
(
not exists (select regexp_matches(b.surface_survey, '[0-9][0-9][0-9][0-9]')) and exists (select regexp_matches(a.surface_survey, '[0-9][0-9][0-9][0-9]'))and exists (select regexp_matches(c.surface_survey, '[0-9][0-9][0-9][0-9]'))
or
(select regexp_matches(a.surface_survey, '[0-9][0-9][0-9][0-9]'))::text >=  (select regexp_matches(b.surface_survey, '[0-9][0-9][0-9][0-9]'))::text and (select regexp_matches(c.surface_survey, '[0-9][0-9][0-9][0-9]'))::text >=  (select regexp_matches(b.surface_survey, '[0-9][0-9][0-9][0-9]'))::text)
and st_length(b.way)<822
order by  st_length(b.way)::int
) as fc
