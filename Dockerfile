# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production
ENV TEMPLATE_REPOSITORY=/data/repository
VOLUME $TEMPLATE_REPOSITORY
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .

EXPOSE 4000

CMD [ "node", "run.js" ]