# Create multi stage nginx docker image
# Build the app
FROM node:16-alpine as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Create nginx image
FROM nginx:1.23-bullseye
COPY --from=build --chown=nginx:nginx /app/docker/entrypoint.sh /docker-entrypoint.d/entrypoint.sh
RUN touch /usr/share/nginx/html/env_config.js
RUN chown nginx:nginx /usr/share/nginx/html/env_config.js

COPY --from=build /app/dist /usr/share/nginx/html/dist
COPY --from=build /app/assets /usr/share/nginx/html/assets
COPY --from=build /app/index.html /usr/share/nginx/html
COPY ./src/assets /usr/share/nginx/html/src/assets

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]