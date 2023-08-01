FROM node:18.16-alpine3.17

# install curl to make http requests
RUN apk add curl

# install simple http server for serving static content
RUN npm install -g serve@14.2.0

# install osmtogeojson
RUN npm install -g osmtogeojson

# copy files needed to load the map data
COPY /infra/data-retreiver.sh /run/map/data-retreiver.sh
COPY /infra/overpass-query /run/map/overpass-query

# register the cron job to run every 15 minutes
RUN echo "*/15 * * * * /run/map/data-retreiver.sh" > /etc/crontabs/root
# RUN echo "*/15 * * * * /run/map/data-retreiver.sh" | crontab -

# make the 'app' folder the current working directory
WORKDIR /tmp/map

# copy both 'package.json' and 'package-lock.json' for list of dependencies
COPY package*.json ./

# install dependencies with versions from package-lock.json
RUN npm ci;

# copy everything from the current directory to the 'app' folder
COPY ./ ./

# build the artifacts
RUN npm run build -- --outDir /srv/map/dist;

# cleanup sources
RUN rm -rf /tmp/map

# get initial data
RUN /run/map/data-retreiver.sh

# expose port 5173
EXPOSE 5173

# run app entrypoint
ENTRYPOINT ["sh", "-c" , "crond -l2 && serve -s /srv/map/dist -p 5173"]
