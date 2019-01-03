#!/usr/bin/env bash
dt=$(date '+%d/%m/%Y %H:%M:%S');
echo "EWP installing - $dt"
npm install
npm install -g webpack webpack-dev-server
