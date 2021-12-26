# Mapnik for Docker
FROM ubuntu:16.04
RUN apt-get clean && apt-get update && apt-get install -y locales
RUN update-locale LANG=C.UTF-8

# only install dependencies, no recommended or suggested pakages
RUN printf "APT::Install-Recommends \"0\";APT::Install-Suggests \"0\";" > /etc/apt/apt.conf.d/01norecommend

# Passenger apt source
RUN apt-get -qq install -y dirmngr gnupg
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
RUN apt-get -qq install -y apt-transport-https ca-certificates
RUN echo deb https://oss-binaries.phusionpassenger.com/apt/passenger xenial main > /etc/apt/sources.list.d/passenger.list

# update, upgrade
RUN apt-get -qq update && apt-get -qq --yes upgrade

RUN apt-get -qq install --yes \
   cron sudo curl wget \
   nginx-extras passenger \
   python-mapnik ttf-unifont tilestache python-psycopg2 python-shapely \
   python-setuptools 

# was: python3-mapnik gir1.2-pango-1.0 gir1.2-rsvg-2.0 python3-gi-cairo

RUN ln -s /usr/bin/tilestache-seed /usr/bin/tilestache-seed.py

RUN curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output /tmp/get-pip.py
RUN python /tmp/get-pip.py

# osmapi available only in pip 
RUN pip2 install -U osmapi==1.3.0

# configure passenger and nginx
RUN rm /etc/nginx/sites-enabled/*
COPY etc/nginx.conf /etc/nginx/sites-enabled/
EXPOSE 80

COPY start.sh /
RUN chmod +x /start.sh
ENTRYPOINT ["/start.sh"]