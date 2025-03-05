#!/bin/bash
set -e

npm start &
npm run refresh:views
wait
