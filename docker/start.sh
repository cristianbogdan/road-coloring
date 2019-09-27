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


cleanup()
{
    echo "Caught Signal ... cleaning up."
    service postgresql stop
    echo "Done cleanup ... quitting."
    exit 0
    }

trap cleanup INT TERM

#make sure the container stays busy so it does not exit
coproc read  && wait "$!" || true

while :; do
    echo "Hello! ${SECONDS} secs elapsed..."

    done

