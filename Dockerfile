# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production
ENV TEMPLATE_REPOSITORY=/data/repository
ENV HOSTNAME=0.0.0.0
ENV PORT=4000
ENV API_KEY=
ENV API_KEY_FILE=
ENV SECRET_KEY=
ENV SECRET_KEY_FILE=
ENV LOGGING_TYPE=console
ENV LOGGING_LEVEL=http
ENV LOGGING_DIRECTORY=/data/logs

VOLUME $TEMPLATE_REPOSITORY
VOLUME $LOGGING_DIRECTORY

WORKDIR /app
COPY ["package.json", "yarn.lock*", "./"]
RUN apt update && apt install -y \
    libpango1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    xvfb \
    libgl1-mesa-dri libglapi-mesa libosmesa6 mesa-utils

FROM base AS dev
RUN apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    libxi-dev libglu1-mesa-dev libglew-dev pkg-config python3 python-is-python3
RUN corepack enable yarn
COPY . .
RUN yarn install

FROM base AS release
COPY --from=dev /app/node_modules ./node_modules
COPY --from=dev /app/src ./src
COPY --from=dev /app/package.json ./
EXPOSE $PORT
ENTRYPOINT [ "xvfb-run", "--auto-servernum", "node", "src/run.js" ]