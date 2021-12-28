#!/bin/bash
cat /work/maps/infra-projects/osmimport/crontab.in /work/maps/road-quality/osmimport/crontab.in   >   /etc/crontabs/root
crond -f -l2
