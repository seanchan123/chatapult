# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
async def get_root(query: str):
    if query == "error":
        raise HTTPException(status_code=400, detail="Returning error")
    response = await talk_to_ollama(query)
    return {"response": response}

# Temporary function to simulate interaction with Ollama
async def talk_to_ollama(query: str) -> str:
    return f"Ollama says: {query}"

