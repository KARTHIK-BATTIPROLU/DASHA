# Dasha — College Allotment PDF Platform

Full-stack web app for Telangana college allotment PDF resources. React + Vite frontend, Express backend deployed as a Netlify serverless function, MongoDB Atlas database.

## Project Structure

```
Dasha/
├── client/          React + Vite frontend (port 5173 locally)
├── server/          Express backend
│   ├── functions/   Netlify serverless entry (api.js)
│   ├── routes/      public.js + admin.js
│   ├── models/      Mongoose schemas
│   ├── middleware/  JWT auth
│   └── config/      db.js (MongoDB connection)
└── netlify.toml     Build config — /api/* proxied to /.netlify/functions/api/:splat
```

## Running Locally

```bash
# Backend (port 5000)
cd server && node index.js

# Frontend (port 5173)
cd client && npm run dev
```

Requires `server/.env` with `MONGO_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`.

## Deployment

Deployed on Netlify. Build command: `cd client && npm install && npm run build && cd ../server && npm install`. Frontend published from `client/dist`, backend from `server/functions`.

## API

- `GET/POST /api/...` — public routes
- `GET/POST /api/admin/...` — admin routes (JWT protected)
- All API calls are proxied via Netlify redirects in production; in dev the frontend points directly to `http://localhost:5000`.

## Tech Stack

- **Frontend:** React 19, Vite 8, React Router 7, Axios, Firebase
- **Backend:** Express 4, Mongoose 7, multer (file uploads), bcryptjs, jsonwebtoken, serverless-http
- **Database:** MongoDB Atlas
- **Hosting:** Netlify (frontend + serverless functions)

---

# graphify

- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`

When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

## What graphify does

Turns any folder of code, SQL schemas, docs, PDFs, images, or videos into a queryable knowledge graph. Outputs an interactive HTML graph, an Obsidian vault, Wikipedia-style wiki articles, and a `GRAPH_REPORT.md` with god nodes, surprising connections, and suggested questions. 71.5x fewer tokens per query vs reading raw files on large corpora.

## Key commands

```bash
/graphify .                        # build graph from current directory
/graphify ./client/src             # run on a specific folder
/graphify . --mode deep            # more aggressive INFERRED edge extraction
/graphify . --update               # re-process only changed files, merge into existing graph
/graphify . --watch                # auto-sync as files change
/graphify . --wiki                 # build agent-crawlable wiki (index.md + article per community)

/graphify query "what connects auth to the PDF routes?"
/graphify path "AdminRoute" "PDFCard"
/graphify explain "connectDB"

graphify hook install              # post-commit git hook — rebuilds graph on every commit
```

## Output

```
graphify-out/
├── graph.html       interactive graph — click nodes, search, filter by community
├── obsidian/        open as Obsidian vault
├── wiki/            Wikipedia-style articles for agent navigation (--wiki)
├── GRAPH_REPORT.md  god nodes, surprising connections, suggested questions
├── graph.json       persistent graph — query later without re-reading
└── cache/           SHA256 cache — re-runs only process changed files
```

Every edge is tagged `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`.

## Install

Already installed via `pip install graphifyy && graphify install`. The skill is at `~/.claude/skills/graphify/SKILL.md`.

To reinstall: `pip install graphifyy && graphify install`
