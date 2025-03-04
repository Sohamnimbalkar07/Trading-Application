FROM node:20

WORKDIR /engine

COPY package* .

RUN npm install

COPY . .
RUN npm run build

CMD ["node", "run", "start"]