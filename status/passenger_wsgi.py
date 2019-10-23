#!/usr/local/bin/python
import sys
from cgi import parse_qs, escape
import traceback
import subprocess
import sys
#import json, ast

def application(environ, start_response):
    status = '200 OK'

    d = parse_qs(environ['QUERY_STRING'])
    linez = d.get('lines')

    if linez==None:
        lines='10'
    else:
        lines= linez[0]

    fil= d.get('at')
    if fil==None:
        fil= '/home/cristi/maps/data/daily.log'
    else:
        fil= '/home/cristi/maps/data/waze-'+fil[0]+'.txt'
        if linez==None:
            lines='50'
        

    try:
        result = subprocess.check_output(['tail', '-'+lines, fil])
        response_body= result
        
    except Exception as inst:
        traceback.print_exc()
        status= '400 Bad request'
        response_body=str(inst)

    response_headers = [('Content-type', 'text/plain'),('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]
    
