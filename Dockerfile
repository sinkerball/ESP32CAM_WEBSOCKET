FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then \
      yarn install --production --frozen-lockfile; \
    else \
      npm install --production; \
    fi
COPY . .
EXPOSE 3000
CMD ["node","server.js"]