# AI Inference Service

A FastAPI-based proxy service that forwards requests to OpenAI’s ChatGPT API. This service enforces an internal API key to validate incoming requests, then uses your OpenAI API key to call OpenAI’s endpoint (e.g., `https://api.openai.com/v1`). It supports both regular and streaming responses.

## Overview

- **Technology Stack**: FastAPI, Python 3.8+, httpx, uvicorn  
- **Purpose**: Acts as an internal gateway for AI requests, ensuring secure communication and providing a consistent interface for other services in the project (e.g., `ai-dialogue-service`).  
- **Location**: `services/ai-inference-service` within the Chatapult project.

## Environment Variables

Store the following environment variables securely (e.g., in a `.env` file or via your deployment platform):

- **`INTERNAL_API_KEY`**  
  An internal API key used to authenticate incoming requests to this microservice.  
- **`OPENAI_API_KEY`**  
  Your OpenAI API key for calling the OpenAI ChatGPT API.

Example `.env` file:
```
INTERNAL_API_KEY=some_internal_key
OPENAI_API_KEY=sk-xyz123
```

## Installation and Setup

1. **Navigate to the folder**  
   ```bash
   cd services/ai-inference-service
   ```

2. **Install the dependencies**  
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   - **Option 1**: Create a `.env` file in this folder with the required variables (see above).
   - **Option 2**: Export them manually or via your deployment platform.

4. **Run the service**  
   ```bash
   uvicorn app:app --port 8080 --reload
   ```
   - The service will listen on port `8080` by default.

## Usage

### Authorization
All incoming requests must include the internal API key in the `Authorization` header, for example:

```makefile
Authorization: Bearer your_internal_api_key
```

### Proxy Endpoint
Any request to:
```bash
POST http://<HOST>:8080/v1/{path:path}
```

will be proxied to OpenAI's API at:
```bash
POST https://api.openai.com/v1/{path}
```

Note: This service automatically replaces your internal API key with the `OPENAI_API_KEY` before forwarding the request.

### Example: Streaming Chat Completion
```bash
curl -X POST http://<HOST>:8080/v1/chat/completions \
  -H "Authorization: Bearer your_internal_api_key" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "model": "o1-mini",
    "messages": [
      { "role": "user", "content": "Tell me a story about a brave knight." }
    ],
    "stream": true
  }'
```

## Logging
- The service logs each request’s method, URL path, and body (if readable).
- Logs can be viewed directly in your console where uvicorn is running.

© 2025 Chatapult

Part of the Chatapult project located at `services/ai-inference-service`.