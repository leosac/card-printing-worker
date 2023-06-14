# syntax=docker/dockerfile:1

FROM node:18-bullseye-slim AS base
ENV NODE_ENV=production
ENV TEMPLATE_REPOSITORY=/data/repository
ENV PORT=4000
ENV API_KEY=
ENV SECRET=
VOLUME $TEMPLATE_REPOSITORY
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