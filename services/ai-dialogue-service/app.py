# app.py
# uvicorn app:app --port 8000 --reload

import os
import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

app = FastAPI()

# Environment variables
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
AI_INFERENCE_SERVICE_URL = os.getenv("AI_INFERENCE_SERVICE_URL")  # e.g., http://localhost:8080/v1/chat/completions
QDRANT_URL = os.getenv("QDRANT_URL")  # e.g., http://localhost:6333
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "EDE")  # e.g., "EDE"

if not INTERNAL_API_KEY or not AI_INFERENCE_SERVICE_URL or not QDRANT_URL:
    raise Exception("Missing required environment variables. Please set INTERNAL_API_KEY, AI_INFERENCE_SERVICE_URL, and QDRANT_URL.")

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL)

@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)

@app.post("/chat")
async def chat_handler(payload: dict):
    """
    1. Receives a user query with an optional "stream" flag.
    2. Embeds the query.
    3. Retrieves relevant document chunks from Qdrant.
    4. Assembles an augmented prompt.
    5. Forwards the prompt to the ai-inference-service.
    6. Returns the final LLM response (streaming or non-streaming) formatted in Markdown.
    """
    query_text = payload.get("query")
    if not query_text:
        raise HTTPException(status_code=400, detail="Missing 'query' field in payload.")

    stream_requested = payload.get("stream", False)

    # Step 1: Embed the query (using embed_text, defined below)
    query_vector = embed_text(query_text)

    # Step 2: Retrieve relevant document chunks from Qdrant
    try:
        search_results = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=3,  # Adjust as needed
            with_payload=True
        ).points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying Qdrant: {e}")

    # Step 3: Extract context and source information from each ScoredPoint
    context_chunks = []
    sources = set()
    for point in search_results:
        # Retrieve text content from the payload (check "page_content")
        text = point.payload.get("page_content", "")
        if text:
            context_chunks.append(text)
        # Retrieve source information from the metadata subfield, if available
        metadata = point.payload.get("metadata", {})
        src = metadata.get("source", "")
        if src:
            sources.add(src)
    context = "\n".join(context_chunks)
    sources_str = ", ".join(sorted(sources)) if sources else "Unknown"

    print("context:", context)
    print("sources:", sources_str)

    # Step 4: Assemble the augmented prompt.
    prompt = (
        f"Answer the following question using only the provided context. "
        f"Question: \"{query_text}\"\n\n"
        f"Context:\n{context}\n\n"
        "Respond thoroughly and accurately, but do not include any greetings or extra commentary."
    )

    # Step 5: Forward the prompt to the inference service.
    raw_response = await call_inference_service(prompt, stream=stream_requested)

    # Step 6: For non-streaming responses, post-process the output to wrap it in Markdown,
    # including a footer with the sources.
    if stream_requested:
        return raw_response  # StreamingResponse returned as-is.
    else:
        final_markdown = (
            f"## Answer\n\n"
            f"{raw_response}\n\n"
            f"---\n"
            f"**Sources:** {sources_str}"
        )
        return JSONResponse({"response": final_markdown})

def embed_text(text: str):
    """
    Embed text using the globally defined embeddings instance.
    """
    return embeddings.embed_query(text)

async def call_inference_service(prompt: str, stream: bool = False):
    """
    Forwards the prompt to the ai-inference-service.
    If 'stream' is True, returns a StreamingResponse; otherwise, returns a string.
    """
    headers = {
        "Authorization": f"Bearer {INTERNAL_API_KEY}",
        "Content-Type": "application/json",
        "Accept-Encoding": "identity"
    }
    data = {
        "model": "o1-mini",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": stream
    }
    if stream:
        headers["Accept"] = "text/event-stream"
        async def stream_generator():
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", AI_INFERENCE_SERVICE_URL, headers=headers, json=data) as response:
                    async for chunk in response.aiter_bytes():
                        yield chunk
        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    else:
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                response = await client.post(AI_INFERENCE_SERVICE_URL, headers=headers, json=data)
                response.raise_for_status()
            except httpx.RequestError as exc:
                raise HTTPException(status_code=500, detail=f"Error connecting to inference service: {exc}")
            except httpx.HTTPStatusError as exc:
                raise HTTPException(status_code=response.status_code, detail=f"Inference service error: {exc.response.text}")
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "No response received.")

# Initialize the global embeddings instance.
from langchain_huggingface import HuggingFaceEmbeddings
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)