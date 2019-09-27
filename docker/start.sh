#!/bin/bash

sudo chown -R postgres.postgres /var/lib/postgresql/
sudo chown -R cristi.cristi /tmp/stache
sudo chown -R cristi.cristi /home/cristi/maps/data

#start postgres
service postgresql start

#start nginx
service nginx start

#start cron
service cron start

#make sure the container stays busy so it does not exit
cat

