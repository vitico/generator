FROM node:7.9

ADD package.json yarn.lock /app/
WORKDIR /app
RUN yarn install

ADD src /app/src

ENTRYPOINT ["yarn"]

CMD ["start"]
