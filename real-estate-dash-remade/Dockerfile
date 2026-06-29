# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

ARG NEXT_PUBLIC_BASE_API_URL
ENV NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Ensure node_modules are executable
RUN chmod -R a+x .

# Build the Next.js app
RUN npm run build 


EXPOSE 3000
CMD ["npm", "start"]