# Approval Hub Service

Backend for Approval Hub: it lists open GitHub pull requests as approval requests, records approve/reject
decisions with an audit trail, and shows repository milestones. Approving a request performs a **local git
merge** in a mirror clone — nothing is ever pushed to GitHub, and GitHub is only ever read.

## Decisions recorded in this service

- **Approve action**: record decision only + local git merge (user choice). No GitHub writes.
- **Repository scope**: configured repo list via `GITHUB_REPOSITORIES` (user choice).
- **Auth**: local, no login. Every handler is `@Public()`; the service binds to `127.0.0.1` (user choice).
- **GitHub access**: unauthenticated public reads only. No personal account or token is used.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check (Postgres connectivity) |
| GET | `/api/pull-request/list` | The request board: synced pull requests + latest decision. Triggers a GitHub sync when empty. |
| POST | `/api/pull-request/sync` | Re-sync open pull requests from GitHub (read-only) |
| POST | `/api/decision` | Record a decision. `APPROVED` first merges the PR locally; conflicts answer 409 and record nothing. |
| GET | `/api/audit/list` | The audit trail, newest first (`?limit=`, default 50) |
| GET | `/api/milestone/list` | Open GitHub milestones per repository + synced PR counts |

## Run it

```bash
cp .env.example .env        # then set JWT_SECRET (>= 32 chars) and GITHUB_REPOSITORIES
docker compose up -d        # Postgres on 127.0.0.1:5435
npm install
npm run migrate             # applies seed/NNN-*.sql forward-only
npm run start:dev           # http://127.0.0.1:3001
```

Serve the frontend next to it and open it in a browser:

```bash
cd ../approval-hub
python3 -m http.server 8742     # http://localhost:8742
```

## Approve flow

1. `POST /api/decision` with `{ repositoryFullName, pullRequestNumber, status: 'APPROVED', reviewNote }`.
2. The service finds the synced pull request, then merges `refs/heads/<head>` into `refs/heads/<base>`
   in the local mirror under `GIT_MIRRORS_PATH` (created on first use, `git clone --mirror`).
   A conflict answers **409 MERGE_CONFLICT** and nothing is recorded.
3. Only after the merge succeeds are the decision row and its audit entry written.
4. The merge exists only in the local mirror; `git push` is never run.

## GitHub reads and rate limits

Requests to `api.github.com` are unauthenticated: 60/hour per IP, public repositories only. The board
syncs when empty and on explicit `POST /api/pull-request/sync`; the UI's Sync button calls the latter.
If rate limits ever matter, set a throwaway account's fine-grained token with public-read scope only —
never a token from a real account with write access.
