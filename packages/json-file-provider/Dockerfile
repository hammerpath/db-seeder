FROM node:24-alpine

ENV DB_SEEDER_HOST=0.0.0.0

WORKDIR /app

RUN mkdir data

COPY dist .

EXPOSE 3000

CMD [ "node",  "./bin/cli.js", "run" ]