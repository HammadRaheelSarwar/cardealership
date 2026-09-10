# DealerOS CRM

DealerOS is a multi-tenant dealership CRM backed by Supabase PostgreSQL. The
application displays stored dealership records only. Empty dealerships show
empty states and zero totals; the production client does not substitute sample
customers, inventory, sales, tasks, or dashboard figures.

## Local development

Install dependencies and start the Vite client and Express API:

```bash
npm install
npm run dev
```

The client runs at `http://localhost:5173` and proxies `/api` to the API at
`http://localhost:5000`.

## Required configuration

Set these values in the Vercel project that runs the API:

- `NODE_ENV=production`
- `CLIENT_URL` — the exact public frontend origin
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET` — at least 32 random characters
- `JWT_REFRESH_SECRET` — a different value with at least 32 random characters

Set these build-time values for the Vite client:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` — omit this when the API is deployed in the same Vercel
  project; otherwise set it to the separate API origin without `/api/v1`

Optional production integrations require their real credentials:

- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Email: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` (a verified sender)
- AI assistant: `OPENAI_API_KEY`, optionally `OPENAI_MODEL`

The application reports an integration as unavailable when its required values
are absent. It never records a simulated provider success.

## Database and realtime updates

Apply every SQL file in `supabase/migrations` to the production Supabase
project in filename order before deploying the application. The latest
migrations add transactional task and sales workflows, secure tenant-scoped
read policies, and the Supabase Realtime publication used by the client.

Authenticated clients subscribe to dealership changes and refresh visible
queries immediately. A 15-second recovery poll covers transient connection or
delivery failures, which is appropriate for a Vercel serverless API where a
persistent Socket.IO process is unavailable.

## Verification

```bash
npm test
npm run test --workspace=client -- --run
npm run build
```
