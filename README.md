# ControlVault

Compliance control tracker for a synthetic tenant. Evidence is stored as a SHA-256 digest, not as the original file. Owners cannot accept their own evidence.

Controls live in `data/controls.json`. The App Router API seeds three controls on first run; restarting the server keeps submitted evidence and review status.

## API

- `GET /api/controls` — list controls + gap count
- `POST /api/controls` — `{ id, title, owner }` create an open control
- `POST /api/controls/:id/evidence` — `{ hash }` (64 hex chars)
- `POST /api/controls/:id/review` — `{ reviewer, accept }`

## Complete product flows

1. Create a control (id like `LG-9`, title, owner) — it appears as `open` and the gap count rises.
2. **Submit digest**, then **Auditor accept**. Restart `npm run dev` — status stays `accepted` in `data/controls.json`.
3. Submit digest again on another control, then **Owner accept (must fail)** — self-approval is rejected. **Reject** returns it to the open pile.

```bash
npm install
npm test
npm run dev
```

http://localhost:3000
