#!/bin/sh
# Author: Rohtash Lakra
echo
lsof -ti:9900 | xargs kill -9
npm start
echo
