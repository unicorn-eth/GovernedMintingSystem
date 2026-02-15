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
6. Shares to X, Bluesky, or copies caption for Instagram

## Deployment

| App | Platform | Notes |
|-----|----------|-------|
| `frontend/` | Vercel | Static Vite build |
| `admin/` | Vercel | Static Vite build |
| `backend/` | Railway | Add PostgreSQL plugin, set root directory to `backend` |

Railway runs `npm run build` (prisma generate) then the `Procfile` (migrate deploy + start).

## Tech Stack

- **Frontend/Admin:** React 18, Vite, Tailwind CSS v4, wagmi v2, RainbowKit, @unicorn.eth/autoconnect
- **Backend:** Express.js, Prisma ORM, ethers.js v6
- **Database:** PostgreSQL
- **Storage:** Pinata IPFS
- **Blockchain:** Polygon (server-side minting)
