FROM node:12.2-alpine as prod
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

# run tests
RUN yarn test

ENV PORT 3000
EXPOSE ${PORT}
ENTRYPOINT ["yarn", "start"]

