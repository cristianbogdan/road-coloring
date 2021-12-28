import sys
import TileStache
application = TileStache.WSGITileServer(config='osm-check.cfg', autoreload=True)
