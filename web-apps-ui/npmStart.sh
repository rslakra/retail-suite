#!/bin/sh
# Author: Rohtash Lakra
echo
lsof -ti:9016 | xargs kill -9
npm start
echo
