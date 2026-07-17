# SUVIDHA
### Smart Urban Virtual Interactive Digital Helpdesk Assistant

> Official digital portal for Vijayawada Municipal Corporation — enabling citizens to access municipal services, pay utility bills, file complaints, and get AI-powered civic assistance.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://suvidha-plum.vercel.app/login)
[![Backend](https://img.shields.io/badge/Backend-Render-green)](https://suvidha-backend-mx7h.onrender.com)


---

## Overview

SUVIDHA is a production-grade civic services platform built with a 3-service microservice architecture. It combines a React frontend, Node.js REST API backend, and a Python FastAPI AI microservice to deliver a complete digital municipal experience.

---

## Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel |  https://suvidha-plum.vercel.app/login |
| Backend API | Render | https://suvidha-backend-mx7h.onrender.com |
| AI Service | Render | https://suvidha-ai-xxxx.onrender.com |
| Database | MongoDB Atlas | Cloud hosted |

> **Note:** Backend and AI service are on Render free tier. First request after inactivity may take 30-60 seconds to wake up.

---

## Features

### Citizen Portal
- Secure registration and JWT-based authentication
- Utility bill management with online payment via Razorpay
- Complaint registration with image evidence and real-time status tracking
- Service requests for water, electricity, and gas connections
- Civic document vault with Cloudinary storage
- Aadhaar identity verification using OCR and Levenshtein distance fraud prevention
- AI-powered civic assistant with RAG pipeline

### Admin Dashboard
- Platform-wide analytics and statistics
- Complaint management with status timeline updates
- Service request approval and rejection workflow
- Citizen account management

### Super Admin
- Admin account creation and management
- Full platform access and control

### AI Assistant
- RAG (Retrieval Augmented Generation) pipeline
- Google Gemini LLM for natural language responses
- FAISS vector search for semantic document retrieval
- Civic FAQ knowledge base for Vijayawada municipal services
- Floating chat widget available on all dashboard pages

---

## Architecture
