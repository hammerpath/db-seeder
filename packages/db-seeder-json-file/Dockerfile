FROM node:24-alpine

WORKDIR /app

RUN mkdir data && touch data/db.json

COPY dist .

EXPOSE 3000

CMD [ "node",  "./bin/cli.js", "run" ]