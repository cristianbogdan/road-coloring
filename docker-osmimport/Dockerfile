FROM alpine:3.15
LABEL maintainer="guy.pascarella@gmail.com"
#based on disrvptor/osm2pgsql

ENV HOME /root
ENV OSM2PGSQL_VERSION 1.5.1
    
RUN apk update

# Install the things we want to stick around
RUN apk add --no-cache \
	libgcc \
	libstdc++ \
	boost-filesystem \
	boost-system \
	boost-thread \
	expat \
	libbz2 \
	postgresql-libs \
	libpq \
	geos \
	proj \
	lua5.2 \
	lua5.2-libs

# Install develop tools and dependencies, build osm2pgsql and remove develop tools and dependencies
RUN apk add --no-cache --virtual .osm2pgsql-deps\
	make \
	cmake \
	expat-dev \
	g++ \
	git \
	boost-dev \
	zlib-dev \
	bzip2-dev \
	proj-dev \
	geos-dev \
	lua5.2-dev \
	postgresql-dev &&\
	cd $HOME &&\
	mkdir src &&\
	cd src &&\
	git clone --depth 1 --branch $OSM2PGSQL_VERSION https://github.com/openstreetmap/osm2pgsql.git &&\
	cd osm2pgsql &&\
	mkdir build &&\
	cd build &&\
	cmake -DLUA_LIBRARY=/usr/lib/liblua-5.2.so.0 .. &&\
	make &&\
	make install &&\
	cd $HOME &&\
	rm -rf src &&\
	apk --purge del .osm2pgsql-deps

	
RUN apk add --no-cache --virtual .osmctools-deps make g++ git autoconf automake libtool zlib-dev && \
  git clone --depth 1 https://gitlab.com/osm-c-tools/osmctools.git && \
  cd osmctools &&  autoreconf --install &&  ./configure &&  make install &&\
  rm -rf /osmctools &&\
  apk --purge del .osmctools-deps
  
RUN apk add bash npm postgresql-client curl
RUN npm install -g osmtogeojson

COPY start.sh /
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
