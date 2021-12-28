import sys
import TileStache
application = TileStache.WSGITileServer(config='quality.cfg', autoreload=True)
