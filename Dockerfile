FROM node:14.15.2-alpine3.12

WORKDIR /myapp
ADD package.json ./
COPY . .
RUN npm install
ENTRYPOINT [ "npm", "run", "start" ]
EXPOSE 3001
