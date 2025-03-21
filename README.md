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
     - Acts as a secure proxy for calls to OpenAI’s ChatGPT API.  
     - Supports both streaming and non‑streaming responses.  
     - Returns responses formatted in Markdown.

4. **User Interface (Frontend):**  
   - A Next.js project that provides a modern, responsive UI.  
   - Handles user authentication and global state with React Context.  
   - Allows users to create, view, and manage chats and folders.  
   - Renders chat messages using `react-markdown` with Tailwind CSS styles.  
   - Supports features such as drag-and-drop for folder assignment, dark/light mode, and more.

## Prerequisites

- **Node.js** (v14+ recommended) for Auth Service, Database Service, and Frontend  
- **Python 3.8+** for AI Dialogue Service and AI Inference Service  
- **MongoDB** – for storing user and chat data  
- **Docker** (optional) – for running all services, including Qdrant, via Docker Compose  

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

### Local Setup Without Docker

You can run each microservice individually if preferred:

1. **AI Dialogue Service**
   ```bash
   cd services/ai-dialogue-service
   pip install -r requirements.txt
   uvicorn app:app --port 8000 --reload
   ```

2. **AI Inference Service**
   ```bash
   cd services/ai-inference-service
   pip install -r requirements.txt
   uvicorn app:app --port 8080 --reload
   ```

3. **Auth Service**
   ```bash
   cd services/auth-service
   npm install
   npm run dev
   # Runs on PORT=4000
   ```

4. **Database Service**
   ```bash
   cd services/database-service
   npm install
   npm run dev
   # Runs on PORT=5000
   ```

5. **Frontend**
   ```bash
   cd services/frontend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

6. **Qdrant**  
   You can run Qdrant locally via Docker (recommended) or run it on a remote server:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```
   - The AI Dialogue Service will connect to `QDRANT_URL`.

### Running with Docker Compose

A `docker-compose.yml` file is provided in the root folder. This compose file includes services for **Qdrant**, **AI Dialogue Service**, **AI Inference Service**, **Auth Service**, **Database Service**, and the **Frontend**. Here’s a summary:

1. **Qdrant**  
   - Exposed on ports 6333 (REST) and 6334 (gRPC).  
   - By default, it stores data in a volume mapped to a local `qdrant_storage` folder.

2. **AI Dialogue Service**  
   - Exposes port 8000.  
   - Pulls environment variables for connecting to Qdrant and the AI Inference Service.

3. **AI Inference Service**  
   - Exposes port 8080.  
   - Proxies requests to OpenAI’s ChatGPT using an internal API key.

4. **Auth Service**  
   - Exposes port 4000.  
   - Connects to your MongoDB (cloud or local).  
   - Manages authentication routes (`/api/auth`).

5. **Database Service**  
   - Exposes port 5000.  
   - Connects to your MongoDB.  
   - Manages chat and folder routes (`/api/chats`, `/api/folders`).

6. **Frontend**  
   - Exposes port 3000.  
   - Next.js (TypeScript) application.  
   - Communicates with the other services via environment variables (e.g., `NEXT_PUBLIC_AUTH_SERVICE_URL`, etc.).

#### Steps to Run with Docker Compose

1. **Configure `.env` files** for each service (as described above).
2. **From the project root** (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```
3. **Access the Frontend** at [http://localhost:3000](http://localhost:3000) (or whichever port you mapped).  
4. Services will be available on their mapped ports. For instance:
   - Auth Service: http://localhost:4000  
   - Database Service: http://localhost:5000  
   - AI Dialogue Service: http://localhost:8000  
   - AI Inference Service: http://localhost:8080  
   - Qdrant: http://localhost:6333 (dashboard)  

### Using the Ingestion Script (Optional)

Within **`services/ai-dialogue-service`**, there is an **`ingest.py`** script that you can run *once* (or periodically) to index local PDF documents (stored in `DOCUMENTS_DIR`) into Qdrant. If you are running everything via Docker Compose:

1. **Ensure Qdrant** is up (`docker-compose up -d qdrant` or the entire stack).
2. **Exec** into the AI Dialogue Service container:
   ```bash
   docker-compose exec ai-dialogue-service bash
   python ingest.py
   ```
   This ingests any PDFs in `DOCUMENTS_DIR` (default `./documents`) and stores them in Qdrant, allowing retrieval-augmented responses.

## Folder Structure

The project structure might look like this:

```
Chatapult/
├─ docker-compose.yml
├─ services/
│  ├─ ai-dialogue-service/
│  │  ├─ app.py
│  │  ├─ ingest.py
│  │  └─ ...
│  ├─ ai-inference-service/
│  │  ├─ app.py
│  │  └─ ...
│  ├─ auth-service/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  └─ app.js
│  │  └─ ...
│  ├─ database-service/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ models/
│  │  │  ├─ routes/
│  │  │  └─ app.js
│  │  └─ ...
│  └─ frontend/
│     ├─ src/
│     │  ├─ app/
│     │  ├─ components/
│     │  ├─ contexts/
│     │  ├─ styles/
│     │  └─ ...
│     ├─ package.json
│     └─ ...
└─ README.md  (this file)
```

## Deployment

- **Local Development**:  
  Run each service on its specified port (or use Docker Compose locally).

- **Production Deployment**:  
  - **Docker**: Deploy containers to a Docker-compatible hosting environment (e.g., AWS ECS, DigitalOcean, etc.).  
  - **Vercel / Netlify**: Often used for the Next.js frontend.  
  - **Cloud Services**: Host Node/Python microservices on platforms like Heroku, AWS, GCP, or Azure.  
  - Make sure to provide environment variables and volumes (e.g., for Qdrant) in your production environment.

## Summary of Services

- **AI Dialogue Service**  
  Implements a RAG pipeline by embedding queries, retrieving context from Qdrant, and forwarding prompts to the AI Inference Service.

- **AI Inference Service**  
  Acts as a secure proxy to OpenAI’s ChatGPT API, managing both streaming and non-streaming responses.

- **Auth Service**  
  Handles user authentication with JWT, built with Express and MongoDB.

- **Database Service**  
  Manages chats and folders, providing RESTful endpoints to create, update, retrieve, and delete data in MongoDB.

- **Frontend**  
  A Next.js (TypeScript) application styled with Tailwind CSS. It provides a user interface for authentication, chat interaction, and folder management, rendering AI responses with markdown support.

---

© 2025 Chatapult  
Developed by Sean Chan Weng Hin (2200530)