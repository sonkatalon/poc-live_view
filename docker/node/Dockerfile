FROM docker:24.0.7-cli-alpine3.19 as docker

FROM node:20.11.0-alpine3.19

COPY --from=docker /usr/local/bin/docker /usr/local/bin/docker

RUN apk add --no-cache bash
