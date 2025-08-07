FROM node:24-alpine

ENV DB_SEEDER_HOST=0.0.0.0

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "node",  "./dist/bin/cli.js", "run" ]