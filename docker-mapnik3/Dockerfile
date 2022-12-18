# Mapnik for Docker
FROM ubuntu:bionic
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN update-locale LANG=C.UTF-8
ENV DEBIAN_FRONTEND noninteractive
# only install dependencies, no recommended or suggested pakages
RUN printf "APT::Install-Recommends \"0\";APT::Install-Suggests \"0\";" > /etc/apt/apt.conf.d/01norecommend

# Passenger apt source
RUN apt-get  install -y dirmngr gnupg 
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get -qq install -y apt-transport-https ca-certificates
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger bionic main > /etc/apt/sources.list.d/passenger.list

# update, upgrade
RUN apt-get -qq update && apt-get -qq --yes upgrade

RUN apt-get install --yes \
   cron sudo wget curl \
   passenger  nginx-extras \
   python-mapnik tilestache \
   ttf-unifont tilestache python-psycopg2 python-shapely  python-setuptools 

RUN  apt-get install -y libnginx-mod-http-passenger

RUN sed -i -e 's/engine = mapnik.FontEngine.instance()/#engine = mapnik.FontEngine.instance()/' /usr/lib/python2.7/dist-packages/TileStache/Mapnik.py

# was: python3-mapnik gir1.2-pango-1.0 gir1.2-rsvg-2.0 python3-gi-cairo

#RUN ln -s /usr/bin/tilestache-seed /usr/bin/tilestache-seed.py

RUN curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output /tmp/get-pip.py
RUN python /tmp/get-pip.py
RUN pip2 install --upgrade pip

RUN pip2 install -U osmapi==1.3.0

RUN apt-get install -y python-dev build-essential && \
   pip2 install -U mapbox-vector-tile && \
   apt-get remove -y python-dev build-essential && \
   apt-get autoremove -y


#RUN apt-get install --yes python3-pip
# osmapi available only in pip 
#RUN pip3 install -U osmapi




#EXPOSE 80

COPY start.sh /
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]