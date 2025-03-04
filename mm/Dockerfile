FROM node:20

WORKDIR /mm

COPY package* .

RUN npm install

COPY . .
RUN npm run build

CMD ["node", "run", "start"]