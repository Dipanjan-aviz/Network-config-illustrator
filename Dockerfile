FROM node:18.16-alpine3.16 AS builder

WORKDIR /Frontend

COPY ./Frontend/package*.json ./

RUN npm install --force

COPY ./Frontend .

RUN npm run build

FROM node:18.16-alpine3.16

WORKDIR /Backend

COPY ./Backend/package*.json ./

# RUN apk add --no-cache python3 py3-pip make g++\
#    && rm -rf /var/cache/apk/*

# RUN apk add --update  --no-cache openssh
# RUN apk add busybox-extras

RUN npm install

COPY ./Backend .

COPY --from=builder /Frontend/build ./public

EXPOSE 8085

# ENTRYPOINT  ["node"]
# CMD ["node", "server/create-tabe.js"]
# CMD ["node", "server/create-users.js"]
CMD ["node", "index.js"]