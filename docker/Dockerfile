# At first start, undump smoothness_updates table from another system
# /home/cristi/maps/data, /tmp/stache and /var/lib/postgresql should be external volumes. The owner will be set to the right users by start.sh

# sudo docker run -d -t -p8888:80  -v /home/cristi/maps-docker:/home/cristi/maps -v /some/pg-data/dir:/var/lib/postgresql -v /some/tiles/dir:/tmp/stache --name mapnik mapnik


# to map ports or volumes differently than at docker run do
# https://stackoverflow.com/questions/19335444/how-do-i-assign-a-port-mapping-to-an-existing-docker-container
# docker ps to find the mapnik ID
# docker mapnik stop
# sudo service docker stop
# edit /var/lib/docker/containers/<conainerID>.../hostconfig.json   set e.g.  "PortBindings":{"80/tcp":[{"HostIp":"","HostPort":"8888"}]}
# sudo service docker start
# docker mapnik start

# Mapnik for Docker

FROM ubuntu:16.04

ENV LANG C.UTF-8
ENV MAPNIK_VERSION 3.0.10
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN update-locale LANG=C.UTF-8

RUN printf "APT::Install-Recommends \"0\";APT::Install-Suggests \"0\";" > /etc/apt/apt.conf.d/01norecommend

# Update and upgrade system
RUN apt-get -qq update && apt-get -qq --yes upgrade

# Essential stuffs
RUN apt-get -qq install --yes build-essential openssh-server sudo software-properties-common curl

# Boost
RUN apt-get -qq install -y libboost-dev libboost-filesystem-dev libboost-program-options-dev libboost-python-dev libboost-regex-dev libboost-system-dev libboost-thread-dev

# Mapnik dependencies
RUN apt-get -qq install --yes libicu-dev libtiff5-dev libfreetype6-dev libpng12-dev libxml2-dev libproj-dev libsqlite3-dev libgdal-dev libcairo-dev python-cairo-dev postgresql-contrib libharfbuzz-dev

# Mapnik
RUN curl -s https://mapnik.s3.amazonaws.com/dist/v${MAPNIK_VERSION}/mapnik-v${MAPNIK_VERSION}.tar.bz2 | tar -xj -C /tmp/ && cd /tmp/mapnik-v${MAPNIK_VERSION} && python scons/scons.py configure JOBS=4 && make && make install JOBS=4

# TileStache and dependencies
RUN ln -s /usr/lib/x86_64-linux-gnu/libz.so /usr/lib
RUN cd /tmp/ && curl -Os https://bootstrap.pypa.io/get-pip.py && python get-pip.py
RUN apt-get install python-pil
RUN pip install -U modestmaps simplejson werkzeug tilestache #--allow-external PIL --allow-unverified PIL


RUN pip install mapnik
RUN pip install tilestache
RUN apt-get -qq install -y python-shapely
RUN pip install mapbox-vector-tile
RUN pip install psycopg2-binary
RUN pip install osmapi
RUN sudo apt-get -qq install -y --install-recommends postgis 
RUN sudo apt-get -qq install -y  osm2pgsql

# Passenger, Nginx

RUN apt-get install -y dirmngr gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get install -y apt-transport-https ca-certificates

# Add our APT repository
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list
RUN apt-get update

# Install Passenger + Nginx
RUN apt-get install -y nginx-extras passenger

COPY etc/default /etc/nginx/sites-enabled/default

EXPOSE 80

ENV HOST_IP `ifconfig | grep inet | grep Mask:255.255.255.0 | cut -d ' ' -f 12 | cut -d ':' -f 2`

RUN adduser cristi

USER postgres
RUN service postgresql start && createuser cristi && psql -c "alter user cristi with superuser" && createdb -E UTF-8 -O cristi gis  && psql -d gis -c "CREATE EXTENSION postgis" && psql -d gis -c "CREATE EXTENSION hstore" && service postgresql stop

USER root
RUN apt-get install -y cron 

USER cristi
RUN printf "30 23 * * * /home/cristi/maps/daily.sh >> /home/cristi/maps/data/daily.log 2>&1\n" | crontab

USER root
ADD start.sh /
RUN chmod +x /start.sh

VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]
VOLUME ["/tmp/stache"]

RUN apt-get remove --purge --yes  build-essential
RUN apt-get autoremove --purge --yes

CMD ["./start.sh"]
