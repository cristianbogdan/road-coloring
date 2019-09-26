#!/bin/bash

#start postgres
service postgresql start

#start nginx
service nginx start

#start cron
cron

#make sure the container stays busy so it does not exit
cat

