#!/bin/bash
cp /work/maps/osmimport/crontab.in /etc/crontabs/root
crond -f -l2
