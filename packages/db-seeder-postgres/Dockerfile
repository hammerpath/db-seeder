FROM node:24-alpine

ENV NODE_ENV=production
ENV DB_SEEDER_HOST=0.0.0.0

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "node",  "./dist/bin/cli.js", "run" ]