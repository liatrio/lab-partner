FROM node:12.2-alpine as build
WORKDIR /app/src

# handle dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn

# copy over source code
COPY .eslintrc.json ./
COPY test ./test
COPY *.js ./
COPY features ./features
COPY plugins ./plugins
COPY sample-script ./sample-script

# run tests
RUN yarn test

FROM node:12.2-alpine as prod

COPY package.json ./
COPY yarn.lock ./
RUN yarn --prod

COPY .eslintrc.json ./
COPY *.js ./
COPY features ./features
COPY plugins ./plugins
COPY sample-script ./sample-script


ENV PORT 3000
EXPOSE ${PORT}
ENTRYPOINT ["yarn", "start"]

