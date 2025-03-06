# app.py
# uvicorn app:app --port 8080 --reload

import os
import httpx
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, Request, HTTPException, Response

# Load environment variables from .env if available
load_dotenv()

app = FastAPI()

# Retrieve API keys from environment variables
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1"

if not INTERNAL_API_KEY or not OPENAI_API_KEY:
    raise Exception("Missing required environment variables. Please set INTERNAL_API_KEY and OPENAI_API_KEY.")

@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    """Validate incoming requests using the internal API key."""
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    response = await call_next(request)
    return response

@app.api_route("/v1/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
async def handle_proxy(request: Request, path: str):
    """Proxy incoming requests to the OpenAI API."""
    body = await request.body()
    await log_request(request, body)
    
    target_url = f"{OPENAI_API_URL}/{path}"
    
    # Prepare headers: exclude internal 'host' and 'authorization' headers
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in ["host", "authorization"]
    }
    # Set the OpenAI API key for outgoing requests
    headers["Authorization"] = f"Bearer {OPENAI_API_KEY}"
    
    # Handle streaming responses if requested
    if "text/event-stream" in request.headers.get("Accept", ""):
        headers["Accept"] = "text/event-stream"
        
        async def stream_response():
            async with httpx.AsyncClient(timeout=None) as client:
                try:
                    async with client.stream(
                        method=request.method,
                        url=target_url,
                        headers=headers,
                        content=body,
                    ) as resp:
                        async for chunk in resp.aiter_bytes():
                            yield chunk
                except httpx.RequestError as exc:
                    raise HTTPException(
                        status_code=500, detail=f"Error connecting to OpenAI API: {exc}"
                    )
        return StreamingResponse(
            stream_response(),
            status_code=200,
            media_type="text/event-stream",
        )
    else:
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                openai_response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    content=body,
                )
                openai_response.raise_for_status()
            except httpx.RequestError as exc:
                print(f"RequestError (non-streaming): {exc}")
                raise HTTPException(
                    status_code=500, detail=f"Error connecting to OpenAI API: {exc}"
                )
            except httpx.HTTPStatusError as exc:
                print(f"HTTPStatusError (non-streaming): {exc.response.text}")
                raise HTTPException(
                    status_code=openai_response.status_code, detail=f"Inference service error: {exc.response.text}"
                )
            return Response(
                content=openai_response.content,
                status_code=openai_response.status_code,
                headers=openai_response.headers,
            )

async def log_request(request: Request, body: bytes):
    """Log the request details for debugging."""
    print(f"Received request: {request.method} {request.url.path}")
    try:
        print(f"Request Body: {body.decode('utf-8')}")
    except UnicodeDecodeError:
        print("Request Body: <binary data>")
