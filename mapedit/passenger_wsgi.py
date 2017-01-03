import sys
from cgi import parse_qs, escape
import osmapi
import traceback

def application(environ, start_response):
    status = '200 OK'

    d = parse_qs(environ['QUERY_STRING'])
    ways = d.get('way', [])
    if len(ways)==0:
        status= '400 Bad request'
        response_body='no ways indicated'

    elif d.get('username')==None or d.get('password')==None or d.get('comment')==None:
        status= '400 Bad request'
        response_body='no username, password, or comment indicated'

    else:
        try:    
            api= osmapi.OsmApi(username = d.get('username')[0], password = d.get('password')[0], created_by="peundemerg.ro-0.1")
            api.ChangesetCreate({u"comment": d.get('comment')[0]})
        
            for way in ways:
                x=api.WayGet(way)
                x['tag'][u'smoothness']=d.get('smoothness')[0]
                x['tag'][u'surface_survey']=d.get('surface_survey')[0]
                api.WayUpdate(x)
            
            response_body= str(api.ChangesetClose())            
                
        except Exception as inst:
            traceback.print_exc()
            status= '400 Bad request'
            response_body=str(inst)
                

    response_headers = [('Content-type', 'text/plain'),
                                ('Content-Length', str(len(response_body)))]
    start_response(status, response_headers)
    return [response_body]
