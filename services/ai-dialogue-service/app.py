# app.py
# Run with: python -m uvicorn app:app --port 8000 --reload

import os
import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Environment variables
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
AI_INFERENCE_SERVICE_URL = os.getenv("AI_INFERENCE_SERVICE_URL")  # e.g., http://localhost:8080/v1/chat/completions
QDRANT_URL = os.getenv("QDRANT_URL")  # e.g., http://localhost:6333
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Chatapult")

if not INTERNAL_API_KEY or not AI_INFERENCE_SERVICE_URL or not QDRANT_URL:
    raise Exception("Missing required environment variables. Please set INTERNAL_API_KEY, AI_INFERENCE_SERVICE_URL, and QDRANT_URL.")

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL)

# Middleware to validate incoming requests using the internal API key
@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)

# Endpoint to handle chat requests with RAG and streaming support
@app.post("/chat")
async def chat_handler(payload: dict):
    """
    1. Receives a user query along with an optional "stream" flag.
    2. Embeds the query.
    3. Retrieves relevant document chunks from Qdrant.
    4. Assembles an augmented prompt.
    5. Forwards the prompt to the ai-inference-service.
    6. Returns the final LLM response (streaming or non-streaming).
    """
    query_text = payload.get("query")
    if not query_text:
        raise HTTPException(status_code=400, detail="Missing 'query' field in payload.")

    # Check if streaming response is requested; default is False.
    stream_requested = payload.get("stream", False)

    # Step 1: Embed the query (placeholder implementation)
    query_vector = embed_text(query_text)

    # Step 2: Retrieve relevant document chunks from Qdrant
    try:
        search_results = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=3,  # Adjust the number of results as needed
            with_payload=True
        ).points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying Qdrant: {e}")

    # Step 3: Extract context from retrieved results (assuming payload has a 'text' field)
    context_chunks = [point.payload.get("text", "") for point in search_results if point.payload.get("text")]
    context = "\n".join(context_chunks)

    # Step 4: Assemble the augmented prompt for the LLM
    prompt = (
        f"You are a knowledgeable STEM tutor. "
        f"The user asked: \"{query_text}\"\n\n"
        f"Relevant context from documents:\n{context}\n\n"
        f"Please provide a detailed and accurate response."
    )

    # Step 5: Forward the augmented prompt to the AI Inference Service, with streaming if requested
    inference_result = await call_inference_service(prompt, stream=stream_requested)
    
    # Step 6: Return the final response to the user.
    # If streaming, inference_result is a StreamingResponse; otherwise, it's a string.
    if stream_requested:
        return inference_result  # Already a StreamingResponse
    else:
        return JSONResponse({"response": inference_result})

def embed_text(text: str):
    """
    Placeholder function to embed text.
    Replace this with your actual embedding logic (e.g., calling an embedding API or using a local model).
    """
    # For demonstration purposes, we return a dummy vector.
    return [0.1, 0.2, 0.3, 0.4]

async def call_inference_service(prompt: str, stream: bool = False):
    """
    Forwards the augmented prompt to the ai-inference-service.
    The inference service is responsible for calling the LLM (e.g., OpenAI ChatGPT API).
    If 'stream' is True, returns a StreamingResponse; otherwise, returns a string response.
    """
    headers = {
        "Authorization": f"Bearer {INTERNAL_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "o1-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful STEM tutor."},
            {"role": "user", "content": prompt}
        ],
        "stream": stream
    }
    async with httpx.AsyncClient(timeout=None) as client:
        if stream:
            # Add Accept header for streaming responses
            headers["Accept"] = "text/event-stream"
            async def stream_generator():
                async with client.stream("POST", AI_INFERENCE_SERVICE_URL, headers=headers, json=data) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
            return StreamingResponse(stream_generator(), media_type="text/event-stream")
        else:
            try:
                response = await client.post(AI_INFERENCE_SERVICE_URL, headers=headers, json=data)
                response.raise_for_status()
            except httpx.RequestError as exc:
                raise HTTPException(status_code=500, detail=f"Error connecting to inference service: {exc}")
            except httpx.HTTPStatusError as exc:
                raise HTTPException(status_code=response.status_code, detail=f"Inference service error: {exc.response.text}")
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "No response received.")
