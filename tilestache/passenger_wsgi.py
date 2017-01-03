import sys

#def append_local_dir():
#    import os,sys
#    local_dir = os.path.dirname(__file__)
#    sys.path.append(local_dir)

#append_local_dir()
#print "This line will be printed."

import TileStache
application = TileStache.WSGITileServer(config='tilestache.cfg', autoreload=True)



