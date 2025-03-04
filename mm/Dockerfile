FROM node:20

WORKDIR /mm

COPY package* .

RUN npm install

RUN npm install -g typescript

COPY . .

RUN npm run build

CMD ["npm", "start"]