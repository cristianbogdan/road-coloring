#!/usr/local/bin/python
import sys
from cgi import parse_qs, escape
import traceback
import psycopg2
import sys
#import json, ast

def application(environ, start_response):
    status = '200 OK'

    d = parse_qs(environ['QUERY_STRING'])
    search = d.get('search')
    if search==None:
        status= '400 Bad request'
        response_body='no search indicated'

    else:
        try:    
            conn=psycopg2.connect('dbname=gis user=postgres')
            cursor=conn.cursor()        
            cursor.execute("select search(%s)", (search[0],))
            
            response_body= cursor.fetchone()[0]
                
        except Exception as inst:
            traceback.print_exc()
            status= '400 Bad request'
            response_body=str(inst)
                

    response_headers = [('Content-type', 'application/json'),
                                ('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]
