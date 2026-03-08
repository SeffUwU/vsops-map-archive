FROM node:24-alpine

WORKDIR /app/
COPY package.json ./
COPY . .

# RUN npm i -g yarn
RUN yarn

EXPOSE 3000

CMD ["yarn", "dev"]

