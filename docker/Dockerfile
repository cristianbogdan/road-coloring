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
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN update-locale LANG=C.UTF-8

# only install dependencies, no recommended or suggested pakages
RUN printf "APT::Install-Recommends \"0\";APT::Install-Suggests \"0\";" > /etc/apt/apt.conf.d/01norecommend

RUN apt-get -qq install -y dirmngr gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get -qq install -y apt-transport-https ca-certificates
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list

# update, upgrade
RUN apt-get -qq update && apt-get -qq --yes upgrade

# postgres, postgis, osm2pgsql
RUN apt-get -qq install --yes \
   cron sudo curl wget \
   postgresql-9.5-postgis   osm2pgsql \
   nginx-extras passenger \
   python-mapnik ttf-unifont tilestache python-psycopg2 python-shapely \
   python-setuptools #python-pip

# was: python3-mapnik gir1.2-pango-1.0 gir1.2-rsvg-2.0 python3-gi-cairo
RUN ln -s /usr/bin/tilestache-seed /usr/bin/tilestache-seed.py

RUN curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output /tmp/get-pip.py
RUN python /tmp/get-pip.py

RUN apt-get install osmctools

# osmapi available only in pip 
RUN pip2 install -U osmapi==1.3.0

# configure the postgress db, addostgis extension
RUN adduser cristi
USER postgres
RUN service postgresql start && createuser cristi && psql -c "alter user cristi with superuser" && createdb -E UTF-8 -O cristi gis  && psql -d gis -c "CREATE EXTENSION postgis" && service postgresql stop

RUN printf "host	gis		cristi		 127.0.0.1/32		trust" >>/etc/postgresql/9.5/main/pg_hba.conf

RUN service postgresql start && createdb -E UTF-8 -O cristi gis1  && psql -d gis1 -c "CREATE EXTENSION postgis"&& service postgresql stop

USER root
RUN apt-get -qq install nodejs npm
RUN npm install -g osmtogeojson
RUN ln -s `which nodejs` /usr/bin/node

# configure passenger and nginx
COPY etc/default /etc/nginx/sites-enabled/default
EXPOSE 80

# crontab
USER cristi
RUN printf "30 0 * * * /home/cristi/maps/daily.sh >> /home/cristi/maps/data/daily.log 2>&1\n0,30 * * * * /home/cristi/maps/read-overpass.sh >> /home/cristi/maps/data/read-overpass.log 2>&1\n" | crontab
USER root

# volumes, though recommended to map them to host folders using -v
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql", "/tmp/stache"]

# startup script
COPY start.sh /
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]