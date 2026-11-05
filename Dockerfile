# Runs Dobara in dev mode on purpose: demo logins need the OTP shown on screen, which production mode hides.
FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run dev -- -H 0.0.0.0"]
