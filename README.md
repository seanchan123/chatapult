# Chatapult: Launch Your Skills With AI Dialogue

**Chatapult** is a multi-service AI-powered chat platform designed to help users engage in context-enriched conversations on STEM topics. It combines user authentication, chat and folder management, and advanced Retrieval-Augmented Generation (RAG) to produce accurate, context-aware responses.

## Overview

**Chatapult** is built with a modern microservices architecture. The project consists of the following services:

- **AI Dialogue Service**  
  A FastAPI (Python) service that orchestrates the RAG pipeline. It embeds user queries, retrieves relevant document chunks from a Qdrant vector database, and assembles an augmented prompt. The prompt is then forwarded to the *AI Inference Service* for generating responses.

- **AI Inference Service**  
  A FastAPI (Python) proxy service that securely forwards prompts from *AI Dialogue Service* to OpenAI’s ChatGPT API via an internal API key. This service supports both streaming and non-streaming responses.

- **Auth Service**  
  A Node.js (Express) service that manages user registration, login, and JWT-based authentication using MongoDB.

- **Database Service**  
  A Node.js (Express) service that stores and manages chats and folders. It provides secure RESTful endpoints to create, read, update, and delete chat and folder data.

- **Frontend**  
  A Next.js (TypeScript) application styled with Tailwind CSS. It provides the user interface for chat and folder management, handles authentication using React Context and cookies, and renders chat responses (including markdown formatting).

## Architecture

The architecture of **Chatapult** is divided into several interconnected services:

1. **Authentication & User Management (Auth Service):**  
   - Handles user registration and login.
   - Generates and validates JWT tokens.
   - Stores user credentials in MongoDB.

2. **Chat & Folder Management (Database Service):**  
   - Provides CRUD operations for chats and folders.
   - Uses MongoDB to persist chat conversations and folder structures.
   - Secured using JWT authentication.

3. **Contextual AI Responses (AI Dialogue Service & AI Inference Service):**  
   - **AI Dialogue Service:**  
     - Converts user queries into embeddings.
     - Retrieves relevant document context from Qdrant.
     - Constructs an augmented prompt by combining conversation history, user query, and document context.
     - Forwards the prompt to the AI Inference Service.
   - **AI Inference Service:**  
     - Acts as a secure proxy for calls to the OpenAI ChatGPT API.
     - Supports both streaming and non‑streaming responses.
     - Returns responses formatted in Markdown.

4. **User Interface (Frontend):**  
   - A Next.js project that provides a modern, responsive UI.
   - Handles user authentication and global state with React Context.
   - Allows users to create, view, and manage chats and folders.
   - Renders chat messages using `react-markdown` with Tailwind CSS styles.
   - Supports features such as drag-and-drop for folder assignment, dark/light mode, and more.

## Prerequisites

- **Node.js** (v14+ recommended) for Auth Service, Database Service, and Frontend.
- **Python 3.8+** for AI Dialogue Service and AI Inference Service.
- **Docker** (optional) – for running Qdrant locally.
- **MongoDB** – for storing user and chat data.

## Environment Variables

Each service requires its own set of environment variables. Below is an example configuration for each:

### AI Dialogue Service (.env)
```bash
INTERNAL_API_KEY=your_internal_api_key
AI_INFERENCE_SERVICE_URL=http://localhost:8080/v1/chat/completions
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=Chatapult
EMBEDDING_MODEL=all-MiniLM-L6-v2
DOCUMENTS_DIR=./documents
```

### AI Inference Service (.env)
```bash
INTERNAL_API_KEY=your_internal_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Auth Service (.env)
```bash
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Database Service (.env)
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:4000
NEXT_PUBLIC_DATABASE_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY=your_internal_api_key_for_ai_dialogue
```

> **Note:** Next.js exposes environment variables prefixed with `NEXT_PUBLIC_` to the client.

## Installation and Setup

### 1. AI Dialogue Service

- **Navigate to the service folder:**
  ```bash
  cd services/ai-dialogue-service
  ```
- **Install dependencies:**
  ```bash
  pip install -r requirements.txt
  ```
- **Run the service:**
  ```bash
  uvicorn app:app --port 8000 --reload
  ```
- **Functionality:**
  - Accepts a chat query, retrieves context from Qdrant, and forwards a prompt to the AI Inference Service.
  - Returns the final response (streaming or non-streaming).

### 2. AI Inference Service

- **Navigate to the service folder:**
  ```bash
  cd services/ai-inference-service
  ```
- **Install dependencies:**
  ```bash
  pip install -r requirements.txt
  ```
- **Run the service:**
  ```bash
  uvicorn app:app --port 8080 --reload
  ```
- **Functionality:**
  - Proxies requests to OpenAI’s ChatGPT API.
  - Supports streaming responses.

### 3. Auth Service

- **Navigate to the service folder:**
  ```bash
  cd services/auth-service
  ```
- **Install dependencies:**
  ```bash
  npm install
  ```
- **Run the service:**
  ```bash
  npm run dev
  ```
- **Endpoints:**
  - `POST /api/auth/register`
  - `POST /api/auth/login`

### 4. Database Service

- **Navigate to the service folder:**
  ```bash
  cd services/database-service
  ```
- **Install dependencies:**
  ```bash
  npm install
  ```
- **Run the service:**
  ```bash
  npm run dev
  ```
- **Endpoints include:**
  - `GET /api/chats`
  - `GET /api/chats/:chatId`
  - `POST /api/chats`
  - `PUT /api/chats/:chatId`
  - `PUT /api/chats/:chatId/messages`
  - `DELETE /api/chats/:chatId`
  - And similar endpoints for folders (e.g., `/api/folders`)

### 5. Frontend

- **Navigate to the frontend folder:**
  ```bash
  cd services/frontend
  ```
- **Install dependencies:**
  ```bash
  npm install
  ```
- **Set up your `.env.local`** (see above).
- **Run the development server:**
  ```bash
  npm run dev
  ```
- **Access the application:**
  - [http://localhost:3000](http://localhost:3000)

## Folder Structure

The project structure might look like this:

```
Chatapult/
├─ services/
│  ├─ ai-dialogue-service/
│  │  ├─ app.py
│  │  ├─ ingest.py
│  │  └─ README.md
│  ├─ ai-inference-service/
│  │  ├─ app.py
│  │  └─ README.md
│  ├─ auth-service/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  └─ app.js
│  │  └─ README.md
│  ├─ database-service/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  └─ app.js
│  │  └─ README.md
│  └─ frontend/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ components/
│     │  ├─ contexts/
│     │  ├─ styles/
│     │  └─ ...
│     ├─ package.json
│     ├─ tailwind.config.js
│     └─ README.md
└─ README.md  (this file)
```

## Deployment

- **Local Development**:  
  Run each service on its specified port (see above).

- **Production Deployment**:  
  Deploy each service using your preferred hosting (e.g., Vercel for the frontend, Heroku or AWS for Node/Python services). Ensure that environment variables are properly configured in each deployment environment.

## Summary of Services

- **AI Dialogue Service**:  
  Implements a RAG pipeline by embedding queries, retrieving context from Qdrant, and forwarding prompts to the AI Inference Service.

- **AI Inference Service**:  
  Acts as a secure proxy to OpenAI’s ChatGPT API, managing both streaming and non-streaming responses.

- **Auth Service**:  
  Handles user authentication with JWT, built with Express and MongoDB.

- **Database Service**:  
  Manages chats and folders, providing RESTful endpoints to create, update, retrieve, and delete data in MongoDB.

- **Frontend**:  
  A Next.js (TypeScript) application styled with Tailwind CSS. It provides a user interface for authentication, chat interaction, and folder management, rendering AI responses with markdown support.

---

© 2025 Chatapult  
Developed by Sean Chan Weng Hin (2200530)