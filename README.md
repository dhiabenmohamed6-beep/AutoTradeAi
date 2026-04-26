# AutoTradeAi - AI Trading Assistant

AI-powered trading assistant that analyzes chart screenshots and provides dynamic trading decisions.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB
- OpenAI API Key

### Backend Setup
```bash
cd server
npm install
```

Configure environment variables in `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/autotradeai
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

Create uploads directory:
```bash
mkdir uploads
```

Start server:
```bash
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Features

- AI-powered chart analysis (dynamic, not static)
- 7-day free trial
- Subscription system (59 DT/month)
- Admin dashboard
- Multi-language support (EN, FR, AR)
- JWT authentication

## Tech Stack

- Frontend: React + Tailwind
- Backend: Node.js + Express
- Database: MongoDB
- AI: OpenAI Vision API
