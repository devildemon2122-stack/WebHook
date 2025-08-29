# Step 1: Build the app
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the build with Nginx
FROM nginx:1.25-alpine

# make sure the html dir exists (newer minimal images sometimes skip it)
RUN mkdir -p /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html   # Vite output
# COPY --from=build /app/build /usr/share/nginx/html  # CRA output

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
