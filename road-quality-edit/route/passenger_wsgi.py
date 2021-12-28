#!/usr/local/bin/python
import sys
from cgi import parse_qs, escape
import traceback
import psycopg2
import sys
import urllib2
import urllib
import json
reload(sys)  
sys.setdefaultencoding('utf8')

def readCoords(str):
    if(str.startswith("44.") or str.startswith("45.") or str.startswith("46.") or str.startswith("47.")):
        comma= str.index(",")
        return {"lat":str[:comma], "lon":str[comma+1:].strip()}
    if("/" in str):
        slash=str.index("/")
        conn=psycopg2.connect('dbname=gis user=postgres')
        cursor=conn.cursor()
        cursor.execute("select row_to_json(t) from "+
"(select st_asGeoJSON(st_transform(pnt.point,4326))::text as point from "+
"(select distinct st_intersection(a.way, b.way) as point  "+
"from planet_osm_line a, planet_osm_line b where "+
"a.osm_id>0 and b.osm_id>0 and "+
"a.ref='"+str[:slash]+"' and b.ref='"+str[slash+1:]+"' "+
"and st_intersects(a.way, b.way) "+
"UNION "+
"select st_startpoint(way) as point from planet_osm_line where osm_id>0 and ref in('"+str[:slash]+";"+str[slash+1:]+"','"+str[slash+1:]+";"+str[:slash]+"')"+
") pnt) t"
#, {"f":"DN72A", "t":"DN7"})
,())
        if(cursor.rowcount==0):
            raise Exception(str+" not found")
        coords=json.loads(cursor.fetchone()[0].get("point")).get("coordinates");
        return {"lat":repr(coords[1]), "lon":repr(coords[0])}

    dfrom = json.loads(urllib2.urlopen("https://nominatim.openstreetmap.org/search?"+urllib.urlencode({"q":str})+"&format=json&countrycodes=RO").read())
    i=0;
    while dfrom[i].get("type")=='administrative' or dfrom[i].get("type")=='archeological_site':
        i=i+1;
    return dfrom[i];

def application(environ, start_response):
    status = '200 OK'
    progress=''
    d = parse_qs(environ['QUERY_STRING'])
    frm = d.get('from')
    to = d.get('to')

    if frm==None or to==None:
        status= '400 Bad request'
        response_body='no start or end point indicated'

    else:
        try:
            progress+="\nsearching "+frm[0]
            dfrom=readCoords(frm[0]);
            progress+="\n"+json.dumps(dfrom)

            progress+="\nsearching "+to[0]
            dto = readCoords(to[0]);
            progress+="\n"+json.dumps(dto)
            
 
            url="https://graphhopper.com/api/1/route?vehicle=car&locale=en-US&key=LijBPDQGfu7Iiq80w3HzwB4RUDJbMbhs6BU0dEnn&ch.disable=true&elevation=false&instructions=false&points_encoded=false&point="+dfrom.get("lat")+","+dfrom.get("lon")+"&point="+dto.get("lat")+","+dto.get("lon")

#            url="https://routing.openstreetmap.de/routed-car/route/v1/driving/"+dfrom[0].get("lat")+","+dfrom[0].get("lon")+";"+dto[0].get("lat")+","+dto[0].get("lon")+"?geometries=geojson&overview=full"
#            url= "https://api.cargoloy.com/v1/route/"+dfrom[0].get("lat")+","+dfrom[0].get("lon")+"/"+dto[0].get("lat")+","+dto[0].get("lon")
            progress+="\nrouting "+url
            data=urllib2.urlopen(url).read();
            progress+="\nreading json "+data[:80]
            route=json.dumps(json.loads(data).get("paths")[0].get("points"))
            progress+="\nmap matching\n"+route
            response_body=progress
            
            conn=psycopg2.connect('dbname=gis user=postgres')
            cursor=conn.cursor()        
            cursor.execute("with route as (select st_transform( st_setSrid(ST_GeomFromGeoJSON(%s), 4326), 900913) as geo) "+
#"select row_to_json(t) from "+
                 "select row_to_json(t)::text from (select "+
#ST_AsGeoJSON(ST_Transform(ST_centroid(cc.geo), 4326)) as center, ST_xmax(cc.geo)-ST_xmin(cc.geo) as width,ST_ymax(cc.geo)-ST_ymin(cc.geo) as height, 

#"ST_AsGeoJSON(ST_Transform(ST_centroid(cc.geo), 4326)) as center, "
"(select props from (select ST_AsGeoJSON(ST_Transform(ST_centroid(cc.geo), 4326))::text as center,  ST_xmax(cc.geo)-ST_xmin(cc.geo) as width,ST_ymax(cc.geo)-ST_ymin(cc.geo) as height from route cc group by cc.geo) as props), "+
"array_agg(fc) as segments from "+
"(select osm_id,ref, highway, name, st_length(way)::int as len from route y, planet_osm_line x where "+
"x.highway in ('motorway', 'trunk', 'primary', 'secondary', 'tertiary') and "+
#"x.way && y.geo  and (st_intersects(x.way, y.geo) and x.junction='roundabout' or st_dwithin(st_startpoint(x.way), y.geo, 15) and st_dwithin(st_endpoint(x.way), y.geo, 15) and (st_npoints(x.way)=2 or st_dwithin(st_pointn(x.way,2), y.geo, 15)))"+
"(st_startpoint(x.way) && y.geo or st_endpoint(x.way) && y.geo) and ((st_intersects(x.way, y.geo) and x.junction='roundabout') or(st_dwithin(st_startpoint(x.way), y.geo, 15) or st_dwithin(st_endpoint(x.way), y.geo, 15)))"+
") as fc)" 
+"  AS t"
, (route,))
            response_body= cursor.fetchone()[0]

#            cursor.execute("select osm_id, st_intersects(x.way, y.geo) , st_distance(st_startpoint(x.way), y.geo), st_distance(st_endpoint(x.way), y.geo), st_distance(y.geo, st_pointn(x.way, 2)) "
#+"from (select st_transform( st_setSrid(ST_GeomFromGeoJSON(%s), 4326), 900913) as geo) y, planet_osm_line x where x.osm_id=527435319" , (route,)) 
#            response_body= " "+str(cursor.fetchone())

        except Exception as inst:
            traceback.print_exc()
            status= '400 Bad request'
            response_body=["{","\"error\": \"", str(inst).replace('\n',';'), "\"}"]
            
    response_headers = [('Content-type', 'application/json;charset=utf-8')
                    ]
    start_response(status, response_headers)
    return [response_body]


