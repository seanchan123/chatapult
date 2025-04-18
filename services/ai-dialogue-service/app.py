# app.py
# uvicorn app:app --port 8000 --reload

import os
import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
from qdrant_client import QdrantClient

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
AI_INFERENCE_SERVICE_URL = os.getenv("AI_INFERENCE_SERVICE_URL")  # e.g., http://localhost:8080/v1/chat/completions
QDRANT_URL = os.getenv("QDRANT_URL")  # e.g., http://localhost:6333
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Chatapult")

if not INTERNAL_API_KEY or not AI_INFERENCE_SERVICE_URL or not QDRANT_URL:
    raise Exception("Missing required environment variables. Please set INTERNAL_API_KEY, AI_INFERENCE_SERVICE_URL, and QDRANT_URL.")

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL)

@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    auth_header = request.headers.get("Authorization")
    if auth_header != f"Bearer {INTERNAL_API_KEY}":
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)

@app.post("/chat")
async def chat_handler(payload: dict):
    """
    1. Receives a user query with an optional "stream" flag and optional "history" (a list of previous messages).
    2. Embeds the query.
    3. Retrieves relevant document chunks from Qdrant.
    4. Assembles an augmented prompt that includes the conversation history if provided.
    5. Forwards the prompt to the ai-inference-service.
    6. Returns the final LLM response (streaming or non‑streaming) formatted in Markdown.
    """
    query_text = payload.get("query")
    if not query_text:
        raise HTTPException(status_code=400, detail="Missing 'query' field in payload.")

    stream_requested = payload.get("stream", False)

    # Optional: Extract conversation history if provided.
    # Assume each history message is a dict with at least "sender" and "text" (or "content") keys.
    history = payload.get("history", [])
    history_text = ""
    if history:
        # Build a history string with one message per line.
        history_text = "\n".join(
            f"{msg.get('sender')}: {msg.get('text') or msg.get('content') or ''}"
            for msg in history
        )

    # Step 1: Embed the query.
    query_vector = embed_text(query_text)

    # Step 2: Retrieve relevant document chunks from Qdrant.
    try:
        search_results = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=3,
            with_payload=True,
            score_threshold=0.5
        ).points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying Qdrant: {e}")

    # Step 3: Extract context and source information from Qdrant results.
    context_chunks = []
    sources = set()
    for point in search_results:
        text = point.payload.get("page_content", "")
        if text:
            context_chunks.append(text)
        metadata = point.payload.get("metadata", {})
        src = metadata.get("source", "")
        if src:
            sources.add(src)
    context = "\n".join(context_chunks)
    sources_str = ", ".join(sorted(sources))

    # Step 4: Assemble the augmented prompt.
    # If history_text exists, prepend it to the prompt.
    # https://github.com/neo4j-labs/llm-graph-builder/blob/main/backend/src/shared/constants.py
    CHAT_SYSTEM_TEMPLATE = """
        You are an AI-powered tutoring and question-answering agent. Your task is to assess students' understanding of theoretical concepts and provide tailored explanations to reinforce their learning, using the given context, chat history, and available resources.
        
        ### Response Guidelines:
        1. **Direct Answers**: Provide clear and thorough answers to the user's queries without headers unless requested. Avoid speculative responses.
        2. **Utilize History and Context**: Leverage relevant information from previous interactions, the current user input, and the context provided below.
        3. **No Greetings in Follow-ups**: Start with a greeting in initial interactions. Avoid greetings in subsequent responses unless there's a significant break or the chat restarts.
        4. **Admit Unknowns**: Clearly state if an answer is unknown. Avoid making unsupported statements.
        5. **Avoid Hallucination**: Only provide information based on the context provided. Do not invent information.
        6. **Response Length**: Keep responses concise and relevant. Aim for clarity and completeness within 4-5 sentences unless more detail is requested.
        7. **Tone and Style**: Maintain a professional and informative tone. Be friendly and approachable.
        8. **Error Handling**: If a query is ambiguous or unclear, ask for clarification rather than providing a potentially incorrect answer.
        9. **Fallback Options**: If the required information is not available in the provided context, provide a polite and helpful response. Example: "I don't have that information right now." or "I'm sorry, but I don't have that information. Is there something else I can help with?"
        10. **Context Availability**: If the context is empty, do not provide answers based solely on internal knowledge. Instead, respond appropriately by indicating the lack of information.
        11. **Respond in Markdown**: Format your responses in markdown language for clarity. Do not wrap the response in markdown.
        12. **Avoid replying with 'According to the provided context' or 'Based on the information provided'**: Respond directly to the user's query without this phrase.
        13. **Assess Understanding**: Evaluate the student's grasp of theoretical concepts and provide detailed explanations aimed at reinforcing their knowledge.
        14. **Personalized Feedback**: Analyze the conversation history and offer targeted feedback and suggestions for improvement tailored to the student's performance.
        
        **IMPORTANT** : DO NOT ANSWER FROM YOUR KNOWLEDGE BASE USE THE BELOW CONTEXT

        ### Source:
        <source>
        {source}
        </source>

        ### Example Responses:
        User: Hi 
        AI Response: 'Hello there! How can I assist you today?'

        User: "What is Langchain?"
        AI Response: "Langchain is a framework that enables the development of applications powered by large language models, such as chatbots. It simplifies the integration of language models into various applications by providing useful tools and components."

        User: "Can you explain how to use memory management in Langchain?"
        AI Response: "Langchain's memory management involves utilizing built-in mechanisms to manage conversational context effectively. It ensures that the conversation remains coherent and relevant by maintaining the history of interactions and using it to inform responses."

        User: "I need help with PyCaret's classification model."
        AI Response: "PyCaret simplifies the process of building and deploying machine learning models. For classification tasks, you can use PyCaret's setup function to prepare your data. After setup, you can compare multiple models to find the best one, and then fine-tune it for better performance."

        User: "What can you tell me about the latest realtime trends in AI?"
        AI Response: "I don't have that information right now. Is there something else I can help with?"

        Note: This system does not generate answers based solely on internal knowledge. 
        It answers from the information provided in the user's current and previous inputs, and from the context.
        Do not provide any greetings and focus solely on the educational content.
        """

    prompt = (
        CHAT_SYSTEM_TEMPLATE.replace("{source}", context) +
        (f"\n\nConversation History:\n{history_text}" if history_text else "") +
        f"\n\nUser Query:\n{query_text}"
    )

    # Step 5: Forward the prompt to the inference service.
    raw_response = await call_inference_service(prompt, stream=stream_requested)

    # Step 6: For non-streaming responses, wrap the output in Markdown with a footer for sources.
    # If sources_str is exists, append it to the response.
    if stream_requested:
        async def markdown_stream_generator():
            async for chunk in raw_response.body_iterator:
                yield chunk
            if sources_str:  # Only append footer if sources_str exists
                yield f"\n\n---\n**Sources:** {sources_str}".encode("utf-8")
        return StreamingResponse(markdown_stream_generator(), media_type="text/plain")
    else:
        final_markdown = raw_response
        if sources_str:  # Only append footer if sources_str exists
            final_markdown += f"\n\n---\n**Sources:** {sources_str}"
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