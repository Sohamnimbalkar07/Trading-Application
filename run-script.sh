#!/bin/bash
set -e

cd "api"
npm run dev &

cd ..
cd "engine"
npm run dev &

cd ..
cd "ws"
npm run dev &

cd ..
cd "db"
npm run dev &
sleep 10
npm run dev:refresh:views &

cd ..
cd "mm"
npm run dev &

cd ..
cd "frontend"
npm run dev