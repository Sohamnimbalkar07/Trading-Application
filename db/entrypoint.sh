#!/bin/bash
set -e

npm start &

sleep 5

npm run seed:db
npm run refresh:views

wait