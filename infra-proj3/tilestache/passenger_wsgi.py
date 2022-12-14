import sys
import TileStache
application = TileStache.WSGITileServer(config='infra3.cfg.json', autoreload=True)
