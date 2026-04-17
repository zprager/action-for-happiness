This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Email endpoint

The app sends a daily check-in invitation email via a single Route Handler backed by [Nodemailer](https://nodemailer.com/).

### `POST /api/email`

Sends the "Your Daily Check-In is ready" email to one recipient.

- Body: `{ "to": "user@example.com", "name": "Alex" }` (`name` is optional; falls back to "friend")
- Response: `202 Accepted` with `{ "messageId": "..." }`
- Errors: `400` if `to` is missing

The email body (subject, plain text, and branded HTML with a CTA button) is composed by `buildDailyCheckinEmail()` in [lib/mailer.ts](lib/mailer.ts). The CTA links to `${APP_URL}/daily-checkin`.

### SMTP configuration

The transporter is created lazily and reused across requests. It reads these env vars (with local-dev defaults):

| Variable    | Default                    | Purpose                          |
| ----------- | -------------------------- | -------------------------------- |
| `SMTP_HOST` | `mailpit`                  | SMTP server hostname             |
| `SMTP_PORT` | `1025`                     | SMTP port                        |
| `MAIL_FROM` | `no-reply@actionfh.local`  | `From:` address on outbound mail |
| `APP_URL`   | `http://localhost:3000`    | Base URL used to build the CTA   |

Locally, Docker Compose runs [Mailpit](https://github.com/axllent/mailpit) so mail is captured (not actually delivered) and viewable in its web UI. In production, point `SMTP_HOST`/`SMTP_PORT` at a real relay and set `MAIL_FROM` to a verified sender.

### Current limitations

- **No auth on the endpoint.** Anyone who can reach it can trigger a send to any address — this is intentional for the test environment but must be locked down before production (auth, rate limiting, or an internal-only network).
- **One-shot, recipient-supplied.** There is no scheduler and no user-list iteration; the caller passes `to` each time. A production rollout would replace this with a per-user cron that respects each user's timezone and delivery preferences.




## Deploy with Docker

The repo ships with a [Dockerfile](Dockerfile) and a [docker-compose.yml](docker-compose.yml) that stand up the full stack: the Next.js app, MongoDB, [Mailpit](https://github.com/axllent/mailpit) as a local SMTP catcher, and an alpine `cron` sidecar that triggers the daily check-in job.

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose v2 (`docker compose ...`).

### Start everything

```bash
docker compose up -d --build
```

Services and ports:

| Service   | URL / Port                     | Purpose                                      |
| --------- | ------------------------------ | -------------------------------------------- |
| `web`     | http://localhost:3000          | Next.js app                                  |
| `mongo`   | `localhost:27017`              | MongoDB 7 (persisted in `mongo-data` volume) |
| `mailpit` | http://localhost:8025 (UI), `localhost:1025` (SMTP) | Captures all outbound mail |
| `cron`    | (no ports)                     | `crond` that POSTs the daily check-in at 09:00 UTC |

### Environment variables

Defaults live in `docker-compose.yml` under the `web` service. Override for a real deployment:

| Variable       | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `MONGODB_URI`  | Mongo connection string                                          |
| `JWT_SECRET`   | Auth token signing secret — **must** be changed from the default |
| `SMTP_HOST` / `SMTP_PORT` | Point at a real SMTP relay in production            |
| `MAIL_FROM`    | Verified `From:` address                                         |
| `APP_URL`      | Public URL used in email CTAs                                    |
| `CRON_SECRET`  | Shared secret between `web` and `cron`; **change from the default** |

For production, move these into a `.env` file (referenced from compose) or your orchestrator's secret store rather than committing them.

### Common tasks

```bash
# Tail logs for a single service
docker compose logs -f web

# Rebuild just the web image after changing package.json
docker compose up -d --build web

# Trigger the daily cron job manually (without waiting for 09:00 UTC)
curl -X POST http://localhost:3000/api/cron/daily-checkin \
  -H "x-cron-secret: $CRON_SECRET"

# Stop everything (volumes preserved)
docker compose down

# Stop and wipe Mongo + Mailpit data
docker compose down -v
```

### Time zone for the cron

`crond` in the `cron` service runs in UTC by default. To fire at 09:00 local time, add a `TZ` env var to that service (e.g. `TZ: America/New_York`). The schedule itself is defined inline in the service's `command`.

### Production notes

- The `web` service currently runs `next dev` with source mounted as a volume — convenient for local dev, **not** suitable for production. For a real deployment, swap the Dockerfile to a multi-stage build that runs `next build` and `next start`, and drop the bind mounts from compose.
- Don't publish Mongo's `27017` port to the host; remove the `ports:` block on `mongo` in production so it's only reachable inside the compose network.
- Replace Mailpit with a real SMTP relay (SES, Postmark, Resend SMTP, etc.) by overriding `SMTP_HOST`/`SMTP_PORT`/credentials.
