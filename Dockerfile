FROM node:12.16.2-alpine
LABEL maintainer="express-backend"

RUN apk update
RUN apk upgrade
RUN apk add curl wget git
# install puppeteer
RUN apk add dumb-init binutils-gold nss chromium
# https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
RUN apk --no-cache add --virtual builds-deps build-base python
RUN rm -rf /var/cache/apk/*

RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json .postinstall ./

RUN npm i -g npm
RUN npm install
RUN npm rebuild bcrypt --build-from-source
RUN apk del builds-deps

COPY . .
# CMD ["npm", "run", "start"]
# CMD ["sh", "-c", "npm run serve"]
CMD ["npm", "run", "serve"]

# docker build -t <express-backend> .
# docker run --name <express-backend> -d -p 3000:3000 -it <express-backend:latest>
