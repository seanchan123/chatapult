# AI Inference Service

This project is a FastAPI-based service designed to act as a proxy for requests to Ollama, an AI model server running locally. The service validates incoming API requests, forwards them to Ollama, and handles streaming responses if necessary.

## Prerequisites

- Ensure you have access to an EC2 instance or local server where Ollama will run.
- You will need `pip` for installing Python dependencies.
- Make sure you have `uvicorn` and `httpx` installed to run the FastAPI server.

## Setup Instructions

1. **Connect to EC2 Instance**

   First, navigate to the `ai-inference-service` directory on your local machine and connect to your EC2 instance:

   ```bash
   ssh -i "<PEM_KEY_FILE>" ubuntu@<AWS_EC2_PUBLIC_IPV4_DNS>
   ```

2. **Install Ollama**

   Once connected, install Ollama by running the following command:

   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

   After installation, run Ollama with Llama3.2:

   ```bash
   ollama run llama3.2
   ```

   To verify the model is running:

   ```bash
   ollama ps
   ```

3. **Install Python Dependencies**

   Now, navigate to the `ai-inference-service` directory on your EC2 instance:

   ```bash
   cd ai-inference-service
   ```

   Install the required Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI Server**

   Start the FastAPI service using `uvicorn`:

   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8080 --reload
   ```

   This will start the API on port 8080 and allow you to interact with Ollama through the service.

## API End points

### Proxy Endpoint

The FastAPI service forwards requests to Ollama through a general-purpose proxy endpoint:

```
http://<AWS_EC2_PUBLIC_IPV4_DNS>:8080/v1/{path:path}
```

- Supports `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `HEAD`, and `PATCH` methods.
- Handles streaming responses using the `text/event-stream` header if requested.

## Environment Variables

- `OLLAMA_URL`: URL where Ollama is running (default: `http://localhost:11434`).
- `API_KEY`: API key for request validation.

## How It Works

1. **API Key Validation**: The middleware checks for a valid API key in the `Authorization` header of each request.
2. **Proxying Requests**: Requests are forwarded to Ollama, excluding the `Host` and `Authorization` headers. Streaming responses are handled if requested.
3. **Request Logging**: The service logs each request method, URL, and body for debugging purposes.

## Testing

To test if the API is working, you can send a sample request using `curl`:

```bash
    curl -X POST http://<AWS_EC2_PUBLIC_IPV4_DNS>.com:8080/v1/chat/completions \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d '{
        "model": "llama3.2",
        "messages": [
        {
            "role": "user",
            "content": "Tell me a story about a brave knight"
        }
        ],
        "stream": true
    }'
```

or in one-line:

```bash
curl -X POST http://<AWS_EC2_PUBLIC_IPV4_DNS>:8080/v1/chat/completions -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -H "Accept: text/event-stream" -d "{\"model\": \"llama3.2\", \"messages\": [{\"role\": \"user\", \"content\": \"Tell me a story about a brave knight\"}], \"stream\": true}"
```

Though this is better tested on a client like **Postman** or **Insomnia**.