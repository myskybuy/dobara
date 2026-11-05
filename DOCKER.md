# Dobara: run with Docker

Needs only Docker Desktop. Node.js and PostgreSQL are not required.

```powershell
docker compose up --build
```

Open http://localhost:3000 once the log shows "Ready". The first start takes a few minutes.

The database loads automatically from `docker/dobara.sql` the first time (a copy of the project database: users, listings, orders; login sessions are not included).
Login is by email OTP, shown on screen. Try `admin@dobara.test`, `aarav@dobara.test` or `karan@dobara.test`. More sellers are in `SELLER_LOGINS.md`.

- Stop: `docker compose down`
- Stop and reset the database to the copy in `docker/dobara.sql`: `docker compose down -v`

This setup runs in dev mode for local demos only. It is not a production deployment.
