# Superior Touch API

NestJS REST API with the `/api` prefix. The health endpoint is always available. Product and category list routes return an empty list until MySQL is configured and catalog rows have been added; the existing static frontend catalog remains the fallback.

## Local development

1. Copy `.env.example` to `.env` and set `FRONTEND_ORIGINS` to exact frontend origins. Do not commit `.env`.
2. Install and start the API from this directory:

   ```sh
   npm install
   npm run start:dev
   ```

3. Serve the repository root over HTTP on port 8000, for example with `python -m http.server 8000`.
4. Open `http://localhost:8000`. On localhost, the static site's API configuration targets `http://localhost:3001/api`.

The frontend API base URL is configured in the root `api-config.js`. It defaults to the local API only on localhost/127.0.0.1; set `apiBaseUrl` there to the eventual API origin for a production deployment. No production domain is assumed.

## MySQL / RDS

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` together. The TypeORM connection is disabled when `DB_HOST` is empty. Schema synchronization is disabled; after provisioning the database, run `npm run migration:run` to create the catalog tables. No product or category rows are seeded.

## Current routes

- `GET /api/health`
- `GET /api/products`
- `GET /api/categories`

Auth, users, cart, orders, admin, and inventory modules are structural placeholders only. They intentionally expose no endpoints until their data model and behavior are implemented. No payment processing is included.