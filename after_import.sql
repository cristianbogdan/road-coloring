---SELECT UpdateGeometrySRID('planet_osm_line','way',900913);
---SELECT UpdateGeometrySRID('planet_osm_point','way',900913);
---SELECT UpdateGeometrySRID('planet_osm_polygon','way',900913);

create index planet_osm_line_smo on planet_osm_line(smoothness);
CREATE INDEX planet_osm_point_name ON planet_osm_point USING btree(unaccent_string(lower(name)));
CREATE INDEX planet_osm_point_place ON planet_osm_point USING btree(place);
CREATE INDEX planet_osm_polygon_name ON planet_osm_polygon USING btree(unaccent_string(lower(name)));
CREATE INDEX planet_osm_polygon_place ON planet_osm_point USING btree(place);
 
update planet_osm_line set highway='trunk' where highway='primary' and ref in ('DN6', 'CB', 'DN1', 'DN4', 'DN14', 'DN15', 'DN18', 'DN19');
update planet_osm_line set ref=nat_ref where ref is null and ( nat_ref is not null);

select max(osm_timestamp) into max from lines_old;

---insert into road_log select * from planet_osm_line where highway in ('motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'construction') and osm_timestamp > (select max(max) from max);

insert into smoothness_updates select a.osm_timestamp, b.osm_timestamp as old_timestamp, a.ref, a.osm_user, a.osm_changeset, b.osm_changeset as old_changeset, a.smoothness as new_smoothness, b.smoothness as old_smoothness, a.surface_survey as new_survey, b.surface_survey as old_survey, a.osm_id from planet_osm_line a, lines_old b where a.osm_id= b.osm_id and (a.smoothness is distinct from b.smoothness or a.surface_survey is distinct from b.surface_survey);

drop table lines_old;
drop table max;
select * into lines_old from planet_osm_line ;
create index line_smo on lines_old(smoothness);
create index line_pkey on lines_old(osm_id);
CREATE INDEX lines_old_way ON lines_old USING gist(way);
