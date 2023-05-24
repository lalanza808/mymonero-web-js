FROM node:16-alpine

# set workdir to /app
WORKDIR /app

COPY . .

# install dependencies
RUN npm install

# SET ENVIRONMENT DEFAULTS IF NOT SET
ENV NETTYPE=0
ENV SERVER_URL=https://localhost
ENV APP_NAME=MyMonero-Self-Hosted

RUN npm run build

EXPOSE 9110

CMD ["node", "server.js"]