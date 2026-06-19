# Deployment & Setup Guide – SupplyChainX

Follow these instructions to spin up the SupplyChainX platform locally or inside dockerized environments.

---

## Prerequisites
Ensure the following tools are installed on your system:
- **Node.js** (v18+) & **npm** (v9+)
- **Python** (v3.10+)
- **Docker** & **Docker Compose**
- **PostgreSQL** client tool (optional)

---

## 1. Quick-Start Containerized Run (Recommended)

The easiest way to orchestrate all services is using **Docker Compose**:

```bash
# 1. Clone/navigate to project root
cd SupplyChainX

# 2. Build and launch all services in the background
docker-compose up --build -d

# 3. View the container log streaming to verify startup
docker-compose logs -f
```

Once launched:
- **Next.js Web Client**: [http://localhost:3000](http://localhost:3000)
- **Node.js Express Backend**: [http://localhost:5000](http://localhost:5000)
- **FastAPI AI Microservice**: [http://localhost:8000](http://localhost:8000)
- **PostgreSQL Database Port**: `5432`
- **Redis Port**: `6379`

---

## 2. Local Native Setup (Developer Mode)

If you wish to run the microservices natively for debugging, configure each segment independently:

### A. Environment Configuration
Verify that the `.env` file in the root directory contains the following configuration keys:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/supplychainx?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-key-change-in-production"
AI_SERVICE_URL="http://localhost:8000"
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### B. Launch PostgreSQL & Redis
Start local instances of PostgreSQL and Redis on ports `5432` and `6379` respectively.

### C. Backend API Setup
```bash
cd backend
# 1. Install Node dependencies
npm install

# 2. Compile database models and run migrations
npx prisma migrate dev --name init

# 3. Seed dataset into the Database tables
npx prisma db seed

# 4. Start backend TypeScript development server
npm run dev
```

### D. Python AI Service Setup
```bash
cd ai_service
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows

# 2. Install requirements
pip install -r requirements.txt

# 3. Run FastAPI server using uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### E. Frontend Next.js Client Setup
```bash
cd frontend
# 1. Install packages
npm install

# 2. Launch hot-reloading development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to inspect the client workspace dashboard.

---

## 3. Seeded Accounts & Credentials
Use these accounts to test login roles inside the dashboard gateway:

| Account Role | Username / Email | Password | Capabilites |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@supplychainx.com` | `admin123` | Read & Write access to all modules |
| **Analyst** | `analyst@supplychainx.com` | `analyst123` | Read-only reports view |

---

## 4. Verification Checklists
1. **API Health Check**: Navigate to [http://localhost:5000/health](http://localhost:5000/health) and ensure the system status is `OK`.
2. **AI Health Check**: Navigate to [http://localhost:8000/docs](http://localhost:8000/docs) to verify Swagger documentation is active.
3. **Copilot Interaction**: Type `"Which products may go out of stock next week?"` in the AI Copilot chat and verify that details render.
