# app.py
# uvicorn app:app --host 0.0.0.0 --port 8080 --reload

import httpx
from typing import Optional
from fastapi import FastAPI, Request, Response, HTTPException

app = FastAPI()

OLLAMA_URL = "http://localhost:11434"
API_KEY = "aZk928j7i6429P"


@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    # Read the request body
    body = await request.body()
    # Log the request method, URL path, and body
    print(f"Received request: {request.method} {request.url.path}")
    print(f"Request Body: {body.decode('utf-8')}")

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
    # Log the request body
    await log_request(request)

    # Create the target URL based on the original request
    target_url = f"{OLLAMA_URL}/v1/{path}"

    # Handle request streaming
    if "text/event-stream" in request.headers.get("Accept", ""):
        headers = {"Accept": "text/event-stream"}
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                request.method,
                target_url,
                headers=headers,
                content=await request.body(),
            ) as resp:
                return Response(
                    content=resp.aiter_raw(),
                    status_code=resp.status_code,
                    headers=resp.headers,
                )

    # Forward the request to Ollama and get the response
    async with httpx.AsyncClient() as client:
        try:
            ollama_response = await client.request(
                method=request.method,
                url=target_url,
                headers=request.headers,
                content=await request.body(),
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


async def log_request(request: Request):
    # Read the request body
    body = await request.body()
    # Log the request method, URL path, and body
    print(f"Received request: {request.method} {request.url.path}")
    print(f"Request Body: {body.decode('utf-8')}")
