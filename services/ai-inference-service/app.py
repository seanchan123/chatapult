# app.py
# uvicorn app:app --host 0.0.0.0 --port 8080 --reload

import httpx
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, Request, Response, HTTPException

app = FastAPI()

OLLAMA_URL = "http://localhost:11434"
API_KEY = "aZk928j7i6429P"

@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    # Check for API key in Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    response = await call_next(request)
    return response


@app.api_route(
    "/v1/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
)
async def handle_proxy(request: Request, path: str):
    # Read the request body once
    body = await request.body()
    
    # Log the request body
    await log_request(request, body)
    
    # Create the target URL based on the original request
    target_url = f"{OLLAMA_URL}/v1/{path}"
    
    # Prepare headers (exclude 'host' and 'authorization' header)
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() != 'host'
    }
    
    # Handle request streaming
    if "text/event-stream" in request.headers.get("Accept", ""):
        headers["Accept"] = "text/event-stream"
        
        async def stream_response():
            async with httpx.AsyncClient(timeout=None) as client:
                try:
                    async with client.stream(
                        request.method,
                        target_url,
                        headers=headers,
                        content=body,
                    ) as resp:
                        async for chunk in resp.aiter_bytes():
                            yield chunk
                except httpx.RequestError as exc:
                    raise HTTPException(
                        status_code=500, detail=f"Error connecting to Ollama: {exc}"
                    )
        
        return StreamingResponse(
            stream_response(),
            status_code=200,
            media_type="text/event-stream",
        )
    else:
        # Forward the request to Ollama and get the response
        async with httpx.AsyncClient() as client:
            try:
                ollama_response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    content=body,
                )
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=500, detail=f"Error connecting to Ollama: {exc}"
                )
            return Response(
                content=ollama_response.content,
                status_code=ollama_response.status_code,
                headers=ollama_response.headers,
            )


async def log_request(request: Request, body: bytes):
    # Log the request method, URL path, and body
    print(f"Received request: {request.method} {request.url.path}")
    print(f"Request Body: {body.decode('utf-8')}")
