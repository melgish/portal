FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/build ./
COPY package*.json ./
RUN npm ci --prod
# Configure
COPY .env .
COPY certs /certs

CMD node .
