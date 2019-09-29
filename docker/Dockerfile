# At first start, undump smoothness_updates table from another system
# /home/cristi/maps/data, /tmp/stache and /var/lib/postgreql should be external volumes. The owner will be set to the right users by start.sh

# sudo docker run -d -t -p 8888:80  --restart unless-stopped -v /home/cristi/maps-docker:/home/cristi/maps -v /some/pg-data/dir:/var/lib/postgresql -v /some/tiles/dir:/tmp/stache --name mapnik mapnik


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

RUN apt-get -qq update && apt-get -qq --yes upgrade

# curl, cron, sudo
RUN apt-get -qq install --yes cron sudo curl

# postgres, postgis, osm2pgsql
RUN apt-get -qq install --yes  postgresql-9.5-postgis postgresql-contrib   osm2pgsql

# configure the postgress db, add postgis extension
RUN adduser cristi
USER postgres
RUN service postgresql start && createuser cristi && psql -c "alter user cristi with superuser" && createdb -E UTF-8 -O cristi gis  && psql -d gis -c "CREATE EXTENSION postgis" && psql -d gis -c "CREATE EXTENSION hstore" && service postgresql stop
USER root

# Passenger, Nginx
RUN apt-get -qq install -y dirmngr gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get -qq install -y apt-transport-https ca-certificates
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list
RUN apt-get -qq update
RUN apt-get -qq install -y nginx-extras passenger

# configure passenger and nginx
COPY etc/default /etc/nginx/sites-enabled/default
EXPOSE 80

#install mapnik
RUN apt-get -qq install --yes python-mapnik ttf-unifont # gir1.2-pango-1.0 gir1.2-rsvg-2.0 python3-gi-cairo

# get pip
RUN cd /tmp/ && curl -Os https://bootstrap.pypa.io/get-pip.py && python get-pip.py && rm /tmp/get-pip.py
# tilestache, dependencies and other python libraries used
RUN pip install -U mapnik mapbox-vector-tile shapely tilestache    psycopg2-binary osmapi 
RUN pip uninstall -y  Werkzeug

# crontab
USER cristi
RUN printf "30 23 * * * /home/cristi/maps/daily.sh >> /home/cristi/maps/data/daily.log 2>&1\n" | crontab
USER root

# volumes, though recommended to map them to host folders using -v
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql", "/tmp/stache"]

# startup script
COPY start.sh /
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]
