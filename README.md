# AI Expense Assistant

AI Expense Assistant is a full-stack expense tracking application built with **React, FastAPI, PostgreSQL, JWT authentication, and OpenAI API integration**.

Users can register, log in securely, manage their own expenses, and use a floating AI chatbot to ask questions about their spending or general topics.

## Features

- User registration
- Secure login
- Password hashing with Argon2
- JWT authentication
- Private expenses for each logged-in user
- Add expenses
- Edit expenses
- Delete expenses
- Total spending summary
- Expense count
- PostgreSQL database
- FastAPI REST API
- React frontend
- Floating AI chatbot
- AI analysis of the logged-in user's expenses
- General AI questions
- Responsive chat interface

## AI Expense Assistant

After logging in, users see a floating happy-face AI assistant:

```text
😊
```

Clicking the floating assistant opens a chat window.

Users can ask questions such as:

```text
How much have I spent in total?

How much did I spend on food?

What is my biggest expense?

Which category am I spending the most on?

How can I reduce my spending?

What is Python?

Explain machine learning.
```

For personal expense questions, the backend sends only the currently logged-in user's expense records to the AI.

## Privacy

Each expense is linked to a specific `user_id`.

The authentication flow is:

```text
Login
  ↓
JWT Token
  ↓
FastAPI verifies token
  ↓
User ID extracted
  ↓
PostgreSQL
  ↓
SELECT expenses
WHERE user_id = logged-in user
  ↓
Only that user's expenses
```

The AI chatbot does not receive expenses belonging to other users.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Fetch API

### Backend

- Python
- FastAPI
- OpenAI API
- PyJWT
- Argon2 password hashing
- Psycopg
- Python-dotenv

### Database

- PostgreSQL

## Architecture

```text
React Frontend
      ↓
FastAPI Backend
      ↓
JWT Authentication
      ↓
PostgreSQL Database
      ↓
Logged-in User Expenses
      ↓
OpenAI API
      ↓
AI Expense Assistant
```

## Project Structure

```text
ai-expense-assistant/
│
├── backend/
│   ├── ai_assistant.py
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── .venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Chatbot.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check API status |
| POST | `/register` | Create a user account |
| POST | `/login` | Login and receive JWT |
| GET | `/expenses` | Get logged-in user's expenses |
| POST | `/expenses` | Add an expense |
| PUT | `/expenses/{expense_id}` | Update an expense |
| DELETE | `/expenses/{expense_id}` | Delete an expense |
| POST | `/chat` | Ask the AI assistant |

## Database

The application uses PostgreSQL.

Main tables:

```text
users
```

Stores:

```text
id
name
email
hashed_password
```

And:

```text
expenses
```

Stores:

```text
id
title
amount
category
expense_date
user_id
```

The `user_id` connects each expense to its owner.

## Run the Project Locally

### Clone the repository

```bash
git clone https://github.com/inju-bit/ai-expense-assistant
cd ai-expense-assistant
```

## Backend Setup

Go to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install the required packages:

```bash
python -m pip install -r requirements.txt
```

## Environment Variables

Create:

```text
backend/.env
```

Add:

```env
SECRET_KEY=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

You can generate a secure JWT secret with:

```bash
openssl rand -hex 32
```

Never upload `.env` to GitHub.

## PostgreSQL

Create the database:

```bash
createdb expense_dashboard
```

The application expects a PostgreSQL database named:

```text
expense_dashboard
```

## Start the Backend

```bash
cd backend
source .venv/bin/activate
python -m fastapi dev main.py
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

## Authentication Flow

```text
Register
   ↓
Password hashed using Argon2
   ↓
User stored in PostgreSQL
   ↓
Login
   ↓
Password verified
   ↓
JWT created
   ↓
JWT stored by frontend
   ↓
JWT sent with protected requests
```

## AI Chat Flow

```text
User opens 😊 chatbot
       ↓
User asks a question
       ↓
React sends POST /chat
       ↓
JWT identifies logged-in user
       ↓
FastAPI loads only that user's expenses
       ↓
Expense context + question sent to OpenAI
       ↓
AI response returned
       ↓
Displayed inside chat box
```

## Security

Sensitive information is excluded from Git using `.gitignore`.

Recommended entries:

```gitignore
.env
backend/.env

.venv/
backend/.venv/

node_modules/
frontend/node_modules/

__pycache__/
*.pyc

.DS_Store
```

Never commit:

```text
OPENAI_API_KEY
SECRET_KEY
.env
```

## Current Functionality

```text
Register
   ↓
Login
   ↓
JWT Authentication
   ↓
Personal Expense Dashboard
   ↓
Add / Edit / Delete Expenses
   ↓
Expense Totals
   ↓
😊 AI Expense Assistant
   ↓
Personal spending questions
or
General questions
   ↓
Logout
```

## Future Improvements

- Spending charts
- Monthly analytics
- Category charts
- Budget limits
- Monthly budget warnings
- AI-generated monthly summaries
- Conversation history
- Expense search and filters
- Export expenses to CSV
- Deployment
- Better mobile interface

## Purpose

This project demonstrates practical full-stack development using:

- React
- FastAPI
- PostgreSQL
- REST APIs
- CRUD operations
- Authentication
- JWT
- Password hashing
- Environment variables
- LLM integration
- AI chatbot development
- Frontend/backend integration

## Author

Built as a full-stack AI development and portfolio project.