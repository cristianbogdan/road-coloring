import sys
from cgi import parse_qs, escape
import osmapi
import traceback
import json

def application(environ, start_response):
    status = '200 OK'
    try:
        request_body_size = int(environ.get('CONTENT_LENGTH', 0))
    except (ValueError):
        request_body_size = 0
    request_body = environ['wsgi.input'].read(request_body_size)

    d = json.loads(request_body) 
    ways_string = parse_qs(d["ways"])
    ways=ways_string.get('way', [])
    if len(ways)==0:
        status= '400 Bad request'
        response_body='no ways indicated'

    elif d["username"]==None or d["password"]==None or d["comment"]==None:
        status= '400 Bad request'
        response_body='no username, password, or comment indicated'

    else:
        try:    
            api= osmapi.OsmApi(username = d["username"], password = d["password"], created_by="peundemerg.ro-0.1")
            api.ChangesetCreate({u"comment": d["comment"]})
        
            for way in ways:
                x=api.WayGet(way)
                x['tag'][u'smoothness']=d["smoothness"]
                x['tag'][u'surface_survey']=d["surface_survey"]
                x['tag'][u'surface']=d["surface"]
                api.WayUpdate(x)
            
            response_body= str(api.ChangesetClose())            
                
        except Exception as inst:
            traceback.print_exc()
            status= '400 Bad request'
            response_body=str(inst)+"\n"+str(d)
                

    response_headers = [('Content-type', 'text/plain'),
                                ('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]
