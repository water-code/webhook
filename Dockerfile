# dockerfile
# build stage
FROM node:16.14.0 as build-step
WORKDIR /auto/app
RUN npm install pnpm -g
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-step
COPY --from=build-step /auto/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
