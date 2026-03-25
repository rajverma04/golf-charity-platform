# CharityRoll - Decentralized Charity Lottery Platform

CharityRoll is a transparent, algorithmic lottery platform where 90% of subsciption fees go to a prize pool and 10% goes directly to user-selected charities. Players enter by submitting their weekend golf scores.

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    User([User]) -->|Subscripts/Submits Score| Frontend[React + Vite Frontend]
    Frontend -->|API Requests| Backend[Node.js + Express Backend]
    
    subgraph Backend Logic
        Auth[Auth Service]
        DrawEngine[Draw Engine]
        ScoreService[Score Service]
    end
    
    Backend -->|Auth/Data| DB[(PostgreSQL + Supabase)]
    Backend -->|Payments| Stripe[Stripe API]
    
    DrawEngine -->|Matches Scores| Winners[Winner Calculation]
    Winners -->|Saves| DB
    
    User -->|View Results| Frontend
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or Supabase URL)
- Stripe Account (for test keys)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd Charity
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd ../backend
   npm install
   ```

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory:
```env
PORT=5001
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=development
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5001
```

---

## 🐳 Docker Setup (Recommended)

The easiest way to run the project is using Docker. Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

### 1. Environment Setup
Docker requires environment variables to connect to your database and Stripe.
1.  Navigate to `backend/` and `frontend/`.
2.  Copy `.env.example` to `.env` in both directories.
3.  Fill in your actual keys (Database URL, Stripe Secret, etc.).

### 2. Build and Run locally
From the root directory:
```bash
docker compose up --build
```
*Port mapping: Frontend (5173), Backend (5001)*

### 3. Pull from Docker Hub
If you prefer to pull the pre-built images:
```bash
# Pull the latest image
docker pull rajverma4/golf-charity-platform:latest

# Run the project using Compose (it will pull images if not found)
docker compose up
```

---

## 🧪 Key Features
- **Subscription Model**: Automatic entry with monthly subscription.
- **Golf Score Integration**: Users submit scores which are validated against draws.
- **Transparent Drawing**: Algorithmic "Match Engine" runs on the 28th of every month.
- **Charity Voting**: 10% of every ticket goes to an NGO selected by the user.
- **Admin Dashboard**: Run draft draws, verify winners, and manage charities.
- **Modern UI**: Emotion-driven design using `framer-motion` for fluid transitions.
