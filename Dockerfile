# syntax=docker/dockerfile:1

FROM node:18-bullseye-slim AS base
ENV NODE_ENV=production
ENV TEMPLATE_REPOSITORY=/data/repository
ENV PORT=4000
ENV API_KEY=
ENV SECRET=
ENV LOGGING_TYPE=console
ENV LOGGING_LEVEL=http
ENV LOGGING_DIRECTORY=/data/logs

VOLUME $TEMPLATE_REPOSITORY
VOLUME $LOGGING_DIRECTORY

WORKDIR /app
COPY ["package.json", "yarn.lock*", "./"]
RUN apt update && apt install -y \
    libpango1.0-0 \
    xvfb \
    libgl1-mesa-dri libglapi-mesa libosmesa6 mesa-utils

FROM base AS dev
RUN yarn install --pure-lockfile --production
COPY . .

FROM base AS release
COPY --from=dev /app/node_modules ./node_modules
COPY --from=dev /app/src ./src
COPY --from=dev /app/package.json ./
EXPOSE $PORT
CMD [ "xvfb-run", "--auto-servernum", "node", "src/run.js" ]