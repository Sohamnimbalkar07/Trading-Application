FROM node:20

WORKDIR /ws

COPY package* .

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]