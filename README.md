# NexaEstate CRM Frontend

A premium real estate CRM dashboard for owner-level lead tracking, AI message/call responder monitoring, custom lead entry, and n8n webhook visibility.

## Development

```bash
npm run dev
```

The frontend uses `NEXT_PUBLIC_API_BASE_URL` when provided. If it is not set, it defaults to:

```bash
http://localhost:4000/api/v1
```

For local API integration, run the backend and point the frontend at the backend API base URL.