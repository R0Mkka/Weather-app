FROM node:12.13-alpine as development

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

# base image
FROM nginx:1.16.0-alpine as production

# copy artifact build from the 'build environment'
COPY --from=development /usr/src/app/dist/weather-app /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
