FROM node:20 as base
WORKDIR /frontend
COPY package*.json ./
RUN npm install

FROM base as builder
COPY . .
RUN npm run build

FROM base as production
ENV NODE_ENV=production
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/public ./public
COPY --from=builder /frontend/package.json ./package.json
COPY --from=builder /frontend/next.config.mjs ./next.config.mjs
CMD ["npm", "start"]

FROM base as dev
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev"]