FROM node:14.17.5-alpine
LABEL maintainer="express-start-kit"

RUN apk update
RUN apk upgrade
RUN apk add curl wget git

# # install puppeteer support
# RUN apk add dumb-init binutils-gold nss chromium
# # https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
# RUN apk --no-cache add --virtual builds-deps build-base python
# RUN rm -rf /var/cache/apk/*

# # install sharp support
# RUN apk add --update --no-cache \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/community \
#     --repository http://dl-3.alpinelinux.org/alpine/edge/main vips-dev

RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json .postinstall .initial ./

RUN npm i -g npm
RUN npm ci
RUN npm rebuild bcrypt --build-from-source
RUN apk del builds-deps

COPY . .

# use one of all script below
# CMD ["npm", "run", "start"]
# CMD ["sh", "-c", "npm run serve"]
CMD ["npm", "run", "serve"]

# build cmd script
# docker build -t <express-start-kit> .
# docker run --name <express-start-kit> -d -p 3000:3000 -it <express-start-kit:latest>
