FROM jarredsumner/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .
CMD ["bun", "src/index.js"]
