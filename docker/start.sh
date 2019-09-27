#!/bin/bash

#start postgres
service postgresql start

#start nginx
service nginx start

#start cron
service cron start

#make sure the container stays busy so it does not exit
cat

