FROM node:21-alpine3.17 AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install

FROM builder AS runner
CMD [ "npm", "start" ]
