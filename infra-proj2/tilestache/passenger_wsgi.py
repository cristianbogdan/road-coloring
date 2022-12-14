import sys
import TileStache
application = TileStache.WSGITileServer(config='infra2.cfg.json', autoreload=True)
