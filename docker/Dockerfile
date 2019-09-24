# TODO: at first start, undump smoothness_updates table from another system
# TODO: from within the docker container, chown maps/data to the docker cristi account. Alternatively set it as a volume inside the container

# Mapnik for Docker

FROM ubuntu:16.04
MAINTAINER Fabien Reboia<srounet@gmail.com>

ENV LANG C.UTF-8
ENV MAPNIK_VERSION 3.0.10
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN update-locale LANG=C.UTF-8

# Update and upgrade system
RUN apt-get -qq update && apt-get -qq --yes upgrade

# Essential stuffs
RUN apt-get -qq install --yes build-essential openssh-server sudo software-properties-common curl

# Boost
RUN apt-get -qq install -y libboost-dev libboost-filesystem-dev libboost-program-options-dev libboost-python-dev libboost-regex-dev libboost-system-dev libboost-thread-dev

# Mapnik dependencies
RUN apt-get -qq install --yes libicu-dev libtiff5-dev libfreetype6-dev libpng12-dev libxml2-dev libproj-dev libsqlite3-dev libgdal-dev libcairo-dev python-cairo-dev postgresql-contrib libharfbuzz-dev

# Mapnik 3.0.9
RUN curl -s https://mapnik.s3.amazonaws.com/dist/v${MAPNIK_VERSION}/mapnik-v${MAPNIK_VERSION}.tar.bz2 | tar -xj -C /tmp/ && cd /tmp/mapnik-v${MAPNIK_VERSION} && python scons/scons.py configure JOBS=4 && make && make install JOBS=4

# TileStache and dependencies
RUN ln -s /usr/lib/x86_64-linux-gnu/libz.so /usr/lib
RUN cd /tmp/ && curl -Os https://bootstrap.pypa.io/get-pip.py && python get-pip.py
RUN apt-get install python-pil
RUN pip install -U modestmaps simplejson werkzeug tilestache #--allow-external PIL --allow-unverified PIL
RUN mkdir -p /etc/tilestache
COPY etc/run_tilestache.py /etc/tilestache/


RUN pip install mapnik
RUN pip install tilestache
RUN apt-get -qq install -y python-shapely
RUN pip install mapbox-vector-tile
RUN pip install psycopg2-binary
RUN pip install osmapi
RUN sudo apt-get -qq install -y postgis
RUN sudo apt-get -qq install -y  osm2pgsql

# Nginx
# RUN add-apt-repository -y ppa:nginx/stable && apt-get -qq update && apt-get -qq install -y nginx


RUN apt-get install -y dirmngr gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get install -y apt-transport-https ca-certificates

# Add our APT repository
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list
RUN apt-get update

# Install Passenger + Nginx
RUN apt-get install -y nginx-extras passenger

COPY etc/default /etc/nginx/sites-enabled/default
#RUN ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/
#RUN rm /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# SSH config
RUN mkdir /var/run/sshd
RUN echo 'root:lela' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# Start services
#RUN /etc/init.d/supervisord start
#RUN service nginx start

EXPOSE 22 80
#9001

ENV HOST_IP `ifconfig | grep inet | grep Mask:255.255.255.0 | cut -d ' ' -f 12 | cut -d ':' -f 2`

RUN adduser cristi

USER postgres
RUN service postgresql start && createuser cristi && psql -c "alter user cristi with superuser" && createdb -E UTF-8 -O cristi gis  && psql -d gis -c "CREATE EXTENSION postgis" && psql -d gis -c "CREATE EXTENSION hstore" && service postgresql stop

USER root
ADD start.sh /
RUN chmod +x /start.sh

VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

CMD ["/start.sh"]
