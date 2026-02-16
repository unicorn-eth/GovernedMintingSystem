# GovernedMintingSystem

A two-phase NFT minting platform. Users submit photos and metadata for review. Admins approve, mint NFTs, and share to social media.

## Quick Start

### Prerequisites
- Node.js 18+
- A PostgreSQL database (Railway provides one, or run locally)

### 1. Clone and install

```bash
git clone https://github.com/cryptowampum/GovernedMintingSystem.git
cd GovernedMintingSystem

# Install all three apps
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd admin && npm install && cd ..
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

**backend/.env** — required values:
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PINATA_API_KEY` | Pinata API key for IPFS uploads |
| `PINATA_SECRET_KEY` | Pinata secret key |
| `API_SECRET` | Shared secret between frontends and backend |
| `ADMIN_WALLETS` | Comma-separated admin wallet addresses |
| `SESSION_SECRET` | Random string for admin session tokens |
| `MINTER_PRIVATE_KEY` | Private key of wallet with teamMint permission |
| `POLYGON_RPC_URL` | Polygon RPC endpoint |

**frontend/.env** and **admin/.env** — required values:
| Variable | Description |
|----------|-------------|
| `VITE_THIRDWEB_CLIENT_ID` | Thirdweb client ID |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `VITE_BACKEND_URL` | Backend URL (http://localhost:3001 for dev) |
| `VITE_BACKEND_API_KEY` | Must match `API_SECRET` in backend/.env |

### 3. Set up the database

```bash
cd backend
npm run db:migrate
```

This creates the PostgreSQL tables. You'll be prompted to name the migration (e.g. `init`).

### 4. Start all three services

Open three terminal windows:

**Terminal 1 — Backend (port 3001):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd frontend
npm run dev
```

**Terminal 3 — Admin (port 3002):**
```bash
cd admin
npm run dev
```

### 5. Open in browser

- **User app:** http://localhost:3000
- **Admin panel:** http://localhost:3002
- **Backend health:** http://localhost:3001/health
- **Backend version:** http://localhost:3001/version
- **Frontend version:** http://localhost:3000/version.json
- **Admin version:** http://localhost:3002/version.json

## How It Works

### User Flow
1. User connects wallet (MetaMask, WalletConnect, Coinbase, or Unicorn via `?walletId=inApp`)
2. Takes a photo or uploads an image
3. Adds a comment and optional social handles (X, Instagram, Bluesky)
4. Submits — photo is uploaded to IPFS, submission is stored in the database as "pending"

### Admin Flow
1. Admin connects an authorized wallet (must be in `ADMIN_WALLETS`)
2. Signs a message to authenticate
3. Reviews pending submissions — can edit comments/handles, add notes
4. Approves (selects NFT collection) or denies
5. Mints the NFT to the user's wallet via server-side `teamMint()`
6. Shares to X, Bluesky, or copies caption for Instagram — share buttons only appear for platforms where the user provided a handle
7. Share activity is tracked per-platform with timestamps; already-shared platforms show a checkmark indicator

## Deployment

| App | Platform | Notes |
|-----|----------|-------|
| `frontend/` | Vercel | Static Vite build |
| `admin/` | Vercel | Static Vite build |
| `backend/` | Railway | Express + PostgreSQL |

### Backend → Railway

#### First-time setup

1. **Create a new project** at [railway.app](https://railway.app) and connect your GitHub repo (`cryptowampum/GovernedMintingSystem`)

2. **Add a PostgreSQL plugin** — click "New" → "Database" → "PostgreSQL". Railway automatically sets the `DATABASE_URL` environment variable for your service.

3. **Create the backend service** — click "New" → "GitHub Repo" → select `GovernedMintingSystem`

4. **Set the root directory** — in the service settings, set **Root Directory** to `backend`. This tells Railway to run all commands from the `backend/` folder.

5. **Configure environment variables** — in the service's "Variables" tab, add every variable from `backend/.env.example`:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Use Railway's reference variable (auto-populated) |
   | `PORT` | `3001` | Railway also sets its own PORT; either works |
   | `NODE_ENV` | `production` | |
   | `API_SECRET` | *(your secret)* | Must match `VITE_BACKEND_API_KEY` in frontend/admin |
   | `ADMIN_WALLETS` | *(comma-separated)* | Checksummed Ethereum addresses |
   | `SESSION_SECRET` | *(random string)* | |
   | `PINATA_API_KEY` | *(your key)* | |
   | `PINATA_SECRET_KEY` | *(your key)* | |
   | `THIRDWEB_SECRET_KEY` | *(your key)* | |
   | `SERVER_WALLET_ADDRESS` | *(your address)* | Wallet with teamMint permission |
   | `ARBITRUM_RPC_URL` | *(your RPC URL)* | If minting on Arbitrum |
   | `ALLOWED_ORIGINS` | *(your Vercel URLs)* | e.g. `https://yourfrontend.vercel.app,https://youradmin.vercel.app` |

6. **Deploy** — Railway auto-detects Node.js projects and runs:
   - **Build:** `npm run build` → executes `npx prisma generate` (generates the Prisma client)
   - **Start:** The `Procfile` runs `npx prisma migrate deploy && node server.js` (applies any pending migrations, then starts the server)

7. **Verify** — once deployed, hit your Railway URL:
   - `https://your-service.up.railway.app/health` — should return `{ "status": "ok", ... }`
   - `https://your-service.up.railway.app/version` — should return `{ "service": "backend", "version": "1.0.0" }`

#### Subsequent deploys

Push to `main` and Railway auto-deploys. The `Procfile` runs `prisma migrate deploy` on every start, so new migrations are applied automatically.

#### Troubleshooting

- **"Migration failed"** — check that `DATABASE_URL` is set correctly. Railway's PostgreSQL reference variable (`${{Postgres.DATABASE_URL}}`) should be used.
- **CORS errors** — add your frontend/admin Vercel URLs to `ALLOWED_ORIGINS`. In development, all `localhost` origins are allowed automatically.
- **"Not an authorized admin wallet"** — ensure `ADMIN_WALLETS` contains checksummed addresses (mixed case, not all lowercase). Use [etherscan](https://etherscan.io) to get the checksummed form.

### Frontend & Admin → Vercel

#### First-time setup

1. **Import the GitHub repo** at [vercel.com](https://vercel.com/new)
2. **Set the root directory** to `frontend` (or `admin` for the admin app)
3. **Framework preset** — Vercel auto-detects Vite
4. **Add environment variables:**

   | Variable | Value |
   |----------|-------|
   | `VITE_BACKEND_URL` | Your Railway backend URL (e.g. `https://your-service.up.railway.app`) |
   | `VITE_BACKEND_API_KEY` | Must match `API_SECRET` in the backend |
   | `VITE_THIRDWEB_CLIENT_ID` | Your Thirdweb client ID |
   | `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect project ID |
   | `VITE_CHAIN_ID` | `137` (Polygon) or your target chain |

5. **Deploy** — Vercel runs `npm run build` which creates the static `dist/` folder including `version.json`

6. **Verify** — hit `https://your-app.vercel.app/version.json`

#### Repeat for admin

Import the same repo a second time, but set the root directory to `admin` and add the same environment variables. Use a different Vercel project name (e.g. `governed-minting-admin`).

## Version Tracking

Each service exposes a version endpoint that reads from its `package.json`:

| Service | Endpoint | Example Response |
|---------|----------|------------------|
| Backend | `GET /version` | `{ "service": "backend", "version": "1.0.0" }` |
| Frontend | `GET /version.json` | `{ "service": "frontend", "version": "1.0.0" }` |
| Admin | `GET /version.json` | `{ "service": "admin", "version": "1.0.0" }` |

Bump the `version` field in the relevant `package.json` before deploying to update.

## Tech Stack

- **Frontend/Admin:** React 18, Vite, Tailwind CSS v4, wagmi v2, RainbowKit, @unicorn.eth/autoconnect
- **Backend:** Express.js, Prisma ORM, ethers.js v6
- **Database:** PostgreSQL
- **Storage:** Pinata IPFS
- **Blockchain:** Polygon (server-side minting)

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check with uptime |
| `GET` | `/version` | Service version info |
| `POST` | `/api/submissions` | Create a new submission (photo + metadata) |
| `POST` | `/api/upload/image` | Upload image to IPFS via Pinata |
| `GET` | `/api/ens/:address` | Resolve ENS name for a wallet address |

### Admin (requires wallet auth)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/auth/challenge` | Get a signing challenge |
| `POST` | `/api/admin/auth/verify` | Verify signature, get session token |
| `GET` | `/api/admin/submissions` | List submissions (filterable by status) |
| `GET` | `/api/admin/submissions/:id` | Get a single submission |
| `PATCH` | `/api/admin/submissions/:id` | Edit submission fields |
| `POST` | `/api/admin/submissions/:id/approve` | Approve and assign to collection |
| `POST` | `/api/admin/submissions/:id/deny` | Deny a submission |
| `POST` | `/api/admin/submissions/:id/mint` | Mint NFT to submitter's wallet |
| `GET` | `/api/admin/submissions/:id/share-urls` | Generate social share URLs with normalized handles |
| `POST` | `/api/admin/submissions/:id/record-share` | Record that a share was posted (`{ platform }`) |
| `GET` | `/api/admin/collections` | List active NFT collections |
| `POST` | `/api/admin/collections` | Create a new collection |
