# SUVIDHA
## Smart Urban Virtual Interactive Digital Helpdesk Assistant

A full-stack civic services platform with AI-powered assistance.

## Tech Stack
- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js + MongoDB Atlas
- **AI Service:** Python + FastAPI + LangChain + Gemini + FAISS

## Running the Project

### Frontend
```bash
cd client && npm run dev
```

### Backend
```bash
cd server && npm run dev
```

### AI Service
```bash
cd ai-service
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app:app --reload --port 8000
```