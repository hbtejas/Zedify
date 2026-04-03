# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Inject API URL into Vite build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
