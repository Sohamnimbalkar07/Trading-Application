#!/bin/bash
set -e

npm run start &
npm run refresh:views
wait
