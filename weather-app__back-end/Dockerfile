FROM node:12.13-alpine as development

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:12.13-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV WEATHER_API_KEY=18fdc65bcdbfff40b79ee9400eafcc20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]