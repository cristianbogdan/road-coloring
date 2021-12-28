import sys
import TileStache
application = TileStache.WSGITileServer(config='infra.cfg', autoreload=True)
