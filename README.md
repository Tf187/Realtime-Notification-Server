# Realtime Notification Server

A small TypeScript service for delivering application notifications over WebSockets.

It exposes a REST endpoint for publishers and keeps WebSocket subscribers grouped by a target such as a user, team or tenant.

## Features

- WebSocket subscriptions
- Targeted notifications
- REST publish endpoint
- API-key protection for publishers
- Runtime payload validation with Zod
- Connection health endpoint
- TypeScript
- Vitest tests
- GitHub Actions CI

## How it works

Clients connect to:

```
ws://localhost:8080/ws?target=user:42
```

A backend service can then publish:

```bash
curl -X POST http://localhost:8080/notifications \
  -H "content-type: application/json" \
  -H "x-api-key: change-me" \
  -d '{
    "target": "user:42",
    "type": "invoice.ready",
    "title": "Export complete",
    "message": "Your export is ready."
  }'
```

Every currently connected client subscribed to `user:42` receives the notification immediately.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The default port is `8080`.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Service and connection status |
| POST | `/notifications` | Publish a notification |
| WS | `/ws?target=...` | Subscribe to a target |

## Notes

This project intentionally keeps state in memory. For multiple server instances, the next logical step is adding Redis Pub/Sub so every node sees the same events.

## License

MIT
