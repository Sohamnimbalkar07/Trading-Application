FROM node:20

WORKDIR /db

COPY package* .

RUN npm install

COPY . .
RUN npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]