#!/bin/bash
set -e

cd "api"
npm run start &

cd ..
cd "engine"
npm run start &

cd ..
cd "ws"
npm run start &

cd ..
cd "db"
npm run start &
sleep 10
npm run refresh:views &

cd ..
cd "mm"
npm run start &

cd ..
cd "frontend"
npm run dev