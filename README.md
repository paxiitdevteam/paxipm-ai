# PaxiPM AI

AI-driven Project Management SaaS focused on IT infrastructure and software project delivery.

## Project Structure

```
paxipm-ai/
├── frontend/          # React frontend application
├── backend/           # Express.js API backend
├── ai_engine/         # FastAPI AI service
└── docs/              # Documentation
```

## Tech Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, PostgreSQL
- **AI Engine**: Python, FastAPI, OpenAI/LangChain
- **Database**: PostgreSQL
- **Authentication**: JWT

## Setup Instructions

### Backend Setup

1. Navigate to `backend/` directory
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Configure database connection in `.env`
5. Run database schema: `psql -U your_user -d paxipm -f db/schema.sql`
6. Start server: `npm start` (or `npm run dev` for development)

### AI Engine Setup

1. Navigate to `ai_engine/` directory
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` file from `.env.example`
6. Add your OpenAI API key to `.env`
7. Start service: `python main.py` or `uvicorn main:app --reload`

### Frontend Setup

1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get single project

### AI
- `POST /api/ai/charter` - Generate project charter
- `POST /api/ai/risk` - Calculate risk score

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/project/:projectId` - Get project reports

## Environment Variables

See `.env.example` files in each module for required configuration.

## License

Proprietary - PaxiIT Development Team

