FROM node:14

WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/

COPY server.js .

RUN yarn install

CMD ["node", "server.js"]