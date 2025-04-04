# Chatapult: Launch Your Skills With AI Dialogue

**Chatapult** is a multi-service AI-powered chat platform designed to help users engage in context-enriched conversations on STEM topics. It combines user authentication, chat and folder management, and advanced Retrieval-Augmented Generation (RAG) to produce accurate, context-aware responses. With the addition of Kong as an API Gateway, service communication is now streamlined and secured.

## Overview

![Chatapult - System Architecture drawio](https://github.com/user-attachments/assets/e9a1890e-7c9f-4783-9943-733ea484364f)

**Chatapult** is built with a modern microservices architecture. The project now includes an API Gateway (powered by Kong) to route requests from the frontend to the underlying services. The project consists of the following services:

- **AI Dialogue Service**  
  A FastAPI (Python) service that orchestrates the RAG pipeline. It embeds user queries, retrieves relevant document chunks from a Qdrant vector database, and assembles an augmented prompt. The prompt is then forwarded to the *AI Inference Service* for generating responses.

- **AI Inference Service**  
  A FastAPI (Python) proxy service that securely forwards prompts from the AI Dialogue Service to OpenAI’s ChatGPT API via an internal API key. This service supports both streaming and non-streaming responses.

- **Auth Service**  
  A Node.js (Express) service that manages user registration, login, and JWT-based authentication using MongoDB.

- **Database Service**  
  A Node.js (Express) service that stores and manages chats and folders. It provides secure RESTful endpoints to create, read, update, and delete chat and folder data.

- **Frontend**  
  A Next.js (TypeScript) application styled with Tailwind CSS. It provides the user interface for chat and folder management, handles authentication using React Context and cookies, and renders chat responses (including markdown formatting).

- **API Gateway (Kong)**  
  Kong acts as an API Gateway to route and load-balance requests from the Frontend to the appropriate backend services. This abstraction simplifies endpoint management and enhances overall security.

## Architecture

The architecture of **Chatapult** is divided into several interconnected services:

1. **Authentication & User Management (Auth Service):**  
   - Manages user registration and login.  
   - Generates and validates JWT tokens.  
   - Stores user credentials in MongoDB.

2. **Chat & Folder Management (Database Service):**  
   - Provides CRUD operations for chats and folders.  
   - Persists chat conversations and folder structures in MongoDB.  
   - Secured using JWT authentication.

3. **Contextual AI Responses (AI Dialogue Service & AI Inference Service):**  
   - **AI Dialogue Service:**  
     - Embeds user queries and retrieves relevant context from Qdrant.  
     - Constructs an augmented prompt from conversation history, the query, and document context.  
     - Forwards the prompt to the AI Inference Service.
   - **AI Inference Service:**  
     - Acts as a secure proxy to OpenAI’s ChatGPT API.  
     - Supports both streaming and non‑streaming responses and returns Markdown-formatted outputs.

4. **API Gateway (Kong):**  
   - Routes and load-balances requests from the Frontend to backend services.  
   - Exposes simplified endpoints such as `/auth`, `/dialogue`, `/inference`, and `/database` to clients.

5. **User Interface (Frontend):**  
   - A Next.js project providing a modern, responsive UI.  
   - Manages user authentication and global state with React Context.  
   - Enables chat and folder management while rendering AI responses with markdown support.

## Prerequisites

- **Node.js** (v14+ recommended) for Auth Service, Database Service, and Frontend  
- **Python 3.8+** for AI Dialogue Service and AI Inference Service  
- **MongoDB** – for storing user and chat data  
- **Docker** (optional) – for running all services, including Qdrant and Kong, via Docker Compose

## Environment Variables

Each service requires its own set of environment variables. Below are sample configurations:

### AI Dialogue Service (.env)
```bash
INTERNAL_API_KEY=your_internal_api_key
AI_INFERENCE_SERVICE_URL=http://ai-inference-service:8080/v1/chat/completions
QDRANT_URL=http://qdrant:6333
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
NEXT_PUBLIC_AUTH_SERVICE_URL=http://kong:9000/auth
NEXT_PUBLIC_DATABASE_SERVICE_URL=http://kong:9000/database
NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL=http://kong:9000/dialogue
NEXT_PUBLIC_AI_INFERENCE_SERVICE_URL=http://kong:9000/inference
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
   Run Qdrant locally via Docker:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```

7. **Kong API Gateway**  
   Run Kong locally via Docker:
   ```bash
   docker run -d --name kong \
     -e KONG_DATABASE=off \
     -e KONG_DECLARATIVE_CONFIG=/usr/local/kong/declarative/kong.yml \
     -e KONG_PROXY_ACCESS_LOG=/dev/stdout \
     -e KONG_ADMIN_ACCESS_LOG=/dev/stdout \
     -e KONG_PROXY_ERROR_LOG=/dev/stderr \
     -e KONG_ADMIN_ERROR_LOG=/dev/stderr \
     -e KONG_ADMIN_LISTEN=0.0.0.0:9001 \
     -e KONG_PROXY_LISTEN=0.0.0.0:9000 \
     -p 9000:9000 \
     -p 9001:9001 \
     -v $(pwd)/kong.yml:/usr/local/kong/declarative/kong.yml \
     kong:latest
   ```

### Running with Docker Compose

A comprehensive `docker-compose.yml` file is provided in the project root. This compose file now includes services for **Qdrant**, **AI Dialogue Service** (and an ingestion container), **AI Inference Service**, **Auth Service**, **Database Service**, **Kong API Gateway**, and the **Frontend**. Here’s a summary:

1. **Qdrant**  
   - Exposed on ports 6333 (REST) and 6334 (gRPC).  
   - Data is stored in a volume mapped to a local `qdrant_storage` folder.

2. **AI Dialogue Service**  
   - Exposes port 8000.  
   - Connects to Qdrant and the AI Inference Service.
   - **AI Dialogue Service Ingest**: A one-time (or periodic) container to index local PDF documents into Qdrant.

3. **AI Inference Service**  
   - Exposes port 8080.  
   - Acts as a secure proxy to OpenAI’s ChatGPT API.

4. **Auth Service**  
   - Exposes port 4000 and manages authentication routes.

5. **Database Service**  
   - Exposes port 5000 and provides endpoints for chat and folder management.

6. **Kong API Gateway**  
   - Exposes port 9000 for proxy traffic and 9001 for the admin interface.  
   - Routes requests to backend services based on the paths defined in `kong.yml`.

7. **Frontend**  
   - Exposes port 3000.  
   - Communicates with backend services via Kong endpoints (using the environment variables listed above).

#### Steps to Run with Docker Compose

1. **Configure the `.env` files** for each service as described above.
2. **From the project root** (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build
   ```
3. **Access the Frontend** at [http://localhost:3000](http://localhost:3000).  
4. **Service Endpoints via Kong**:
   - Auth Service: [http://localhost:9000/auth](http://localhost:9000/auth)
   - AI Dialogue Service: [http://localhost:9000/dialogue](http://localhost:9000/dialogue)
   - AI Inference Service: [http://localhost:9000/inference](http://localhost:9000/inference)
   - Database Service (Chats): [http://localhost:9000/database/chats](http://localhost:9000/database/chats)
   - Database Service (Folders): [http://localhost:9000/database/folders](http://localhost:9000/database/folders)
   - Qdrant (if needed): [http://localhost:9000/qdrant](http://localhost:9000/qdrant)

### Using the Ingestion Script (Optional)

Within **`services/ai-dialogue-service`**, the `ingest.py` script can be run once (or periodically) to index local PDF documents (stored in `DOCUMENTS_DIR`) into Qdrant. If you’re running via Docker Compose:

1. **Ensure Qdrant is running** (`docker-compose up -d qdrant` or the entire stack).
2. **Exec into the AI Dialogue Service container**:
   ```bash
   docker-compose exec ai-dialogue-service bash
   python ingest.py
   ```
   This indexes PDFs in the default `./documents` directory into Qdrant for retrieval-augmented responses.

## Folder Structure

Chatapult project structure:
```
Chatapult/
├─ docker-compose.yml
├─ kong.yml
├─ services/
│  ├─ ai-dialogue-service/
│  │  ├─ app.py
│  │  ├─ ingest.py
│  │  ├─ qdrant_storage/
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
└─ README.md
```

## Deployment

- **Local Development**:  
  Run services on their specified ports or use Docker Compose locally.

- **Production Deployment**:  
  - **Docker**: Deploy containers to a Docker-compatible hosting platform (e.g., AWS ECS, DigitalOcean, etc.).  
  - **Vercel / Netlify**: Typically used for the Next.js frontend.  
  - **Cloud Providers**: Host Node/Python microservices on platforms such as Heroku, AWS, GCP, or Azure.  
  - Ensure environment variables and persistent volumes (for Qdrant and Kong) are correctly configured in your production setup.

## Summary of Services

- **AI Dialogue Service**  
  Implements a RAG pipeline by embedding queries, retrieving context from Qdrant, and forwarding prompts to the AI Inference Service.

- **AI Inference Service**  
  Securely proxies requests to OpenAI’s ChatGPT API, supporting both streaming and non-streaming responses.

- **Auth Service**  
  Manages user authentication with JWT, built using Express and MongoDB.

- **Database Service**  
  Provides RESTful endpoints for managing chats and folders in MongoDB.

- **API Gateway (Kong)**  
  Simplifies backend access by routing requests from the Frontend to the appropriate microservices.

- **Frontend**  
  A Next.js (TypeScript) application styled with Tailwind CSS that communicates with backend services via Kong, delivering a responsive and modern user experience.

---

© 2025 Chatapult  
Developed by Sean Chan Weng Hin (2200530)
