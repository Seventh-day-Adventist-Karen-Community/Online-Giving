# Karen Community SDA – Online Giving

A dedicated giving site for Karen Community SDA Church: give by M-PESA (STK push),
see the payment confirmation, and view/print a receipt. Built with Next.js 16 (App Router),
Tailwind CSS v4 and Apollo Client, talking to the church's Django/Graphene backend.

## Routes

| Route                      | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `/`                        | Giving form (details → amounts → M-PESA prompt)      |
| `/give-now/confirm/[id]`   | Polls the payment status after the STK push          |
| `/give-now/receipt/[id]`   | Receipt page with PDF download (linked from SMS/email) |

Old giving URLs (`/give-now/mpesa`, `/giving/...`) redirect to `/` (see `next.config.ts`).

## Getting started

```bash
cp .env.example .env.local   # then set GRAPHQL_URL
npm install
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## Configuration

| Variable               | Where  | Description                                   |
| ---------------------- | ------ | --------------------------------------------- |
| `GRAPHQL_URL`          | server | GraphQL endpoint of the church backend        |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL (sitemap, robots, OpenGraph) |

## Layout

```
app/            routes (page.tsx, give-now/*), layout, robots, sitemap
components/     giving-form, buttons, loader, toast, form inputs
data/           apollo-client.ts, mpesa.ts (server actions), types.ts
reducers/       mpesaReducer.ts (giving form state)
utils/          constants, validation, masking helpers
```

All backend calls happen in server actions / server components, so the GraphQL
endpoint is never called from the browser.
