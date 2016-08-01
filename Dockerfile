FROM node:6
COPY ./package.json /app/package.json
RUN cd /app && npm install
COPY ./.babelrc /app/.babelrc
COPY ./.eslintrc.json /app/.eslintrc.json
COPY ./src /app/src
CMD cd /app && npm run-script all
