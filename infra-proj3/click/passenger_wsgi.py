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

def application(environ, start_response):
    status = '200 OK'
    progress=''
    d = parse_qs(environ['QUERY_STRING'])

    try:
        latLng = d.get('latLng')[0]
        comma= latLng.index(",")
        lat= float(latLng[:comma].strip())
        lon= float(latLng[comma+1:].strip());
        max= float(d.get('max')[0])

        conn=psycopg2.connect('dbname=gis1 user=postgres')
        cursor=conn.cursor()
        cursor.execute(
            "select row_to_json(t)::text from ("+
            "select  osm_id, ref, name, highway, railway, construction, status, proposed, start_date, maxspeed, opening_date "+
            "from planet_osm_line1 "
            "where st_distance(way, st_transform(ST_setSRID(ST_point("+str(lon)+","+str(lat)+" ), 4326), 900913))< "+str(max)+
            ") t"
            ,())
        if(cursor.rowcount==0):
            response_body="null"
        else:
            response_body= cursor.fetchone()[0]
    except Exception as inst:
        traceback.print_exc()
        status= '400 Bad request'
        response_body=''.join(["{","\"error\": \"", str(inst).replace('\n',';'), "\"}"])
    
    
    response_headers = [('Content-type', 'application/json;charset=utf-8'),
                    ('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]


