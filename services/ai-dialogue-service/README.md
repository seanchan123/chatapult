# AI Dialogue Service

The AI Dialogue Service is responsible for managing interactive conversations with users by incorporating context-specific information from local STEM documents via Retrieval-Augmented Generation (RAG). This service retrieves relevant document chunks from a `Qdrant` vector database and uses that context to generate enriched, accurate responses using a large language model (LLM) through `ai-inference-service`.

## Overview

- **Technology Stack:**  
  - **Backend:** FastAPI, Python 3.8+, uvicorn  
  - **RAG Pipeline:**  
    - **Document Ingestion:** PDFs are processed using PyPDFLoader; text is stored (as chunks) with associated metadata in Qdrant  
    - **Embedding:** Documents and queries are converted into 384-dimensional vectors using a HuggingFace embedding model  
    - **Retrieval:** Qdrant returns the most similar document chunks based on query embeddings  
    - **LLM Inference:** An augmented prompt (query plus context) is forwarded to an inference service (e.g., OpenAI ChatGPT API)
- **Purpose:**  
  - Augment user queries with domain-specific context (e.g., concepts from Circuit Theory)  
  - Generate enriched, context-aware responses for STEM topics
- **Location:**  
  - `services/ai-dialogue-service` within the Chatapult project

## Prerequisites

- **Docker:**  
  Ensure Docker is installed and running (required for running Qdrant locally).
- **Python Environment:**  
  Python 3.8+ is required along with a virtual environment (e.g., `venv`).

## Qdrant Setup (Local Deployment)

Before running `ai-dialogue-service`, set up `Qdrant` locally:

1. **Download the Latest Qdrant Image:**
   ```bash
   docker pull qdrant/qdrant
   ```

2. **Run the Qdrant Service:**
   ```bash
   docker run -p 6333:6333 -p 6334:6334 -v "$(pwd)/qdrant_storage:/qdrant/storage:z" qdrant/qdrant
   ```
   - **Access:**
     - REST API: `http://localhost:6333`
     - Web UI: `http://localhost:6333/dashboard`
     - gRPC API: `http://localhost:6334`

## Installation and Setup

1. **Navigate to the Service Folder:**
   ```bash
   cd services/ai-dialogue-service
   ```

2. **Install the Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the `ai-dialogue-service` folder with the following variables:

   ```env
   INTERNAL_API_KEY=your_internal_api_key
   AI_INFERENCE_SERVICE_URL=http://localhost:8080/v1/chat/completions
   QDRANT_URL=http://localhost:6333
   QDRANT_COLLECTION=Chatapult
   EMBEDDING_MODEL=all-MiniLM-L6-v2
   DOCUMENTS_DIR=./documents
   ```

   *These variables let the service authenticate requests, communicate with the inference service, connect to Qdrant, and locate your local PDF documents.*

## Document Ingestion

The ingestion process converts your PDF documents into chunks, computes embeddings for each chunk, and stores them in `Qdrant`.

### Running the Ingestion Script

1. **Ensure Qdrant is Running:**  
   (See the Qdrant Setup section above.)

2. **Run the Ingestion Script:**
   ```bash
   python ingest.py
   ```

   The script will:
   - Recursively locate all PDF files in the specified `DOCUMENTS_DIR`
   - Use `PyPDFLoader` to convert PDFs into Document objects
   - Store the document text in each document's metadata under the `"text"` key
   - Compute embeddings for each chunk (using your HuggingFace model)
   - Save the embeddings and associated text in the Qdrant collection

## AI Dialogue Service (app.py)

The main service uses the following steps:
1. **Receive User Query:**  
   The FastAPI endpoint `/chat` accepts a POST request with a query and an optional streaming flag.
2. **Embed the Query:**  
   The query is converted into a vector (using your HuggingFaceEmbeddings).
3. **Retrieve Context:**  
   Qdrant is queried using the vector to retrieve the top matching document chunks (their text is stored under `"page_content"` or `"text"` in the payload).
4. **Augment the Prompt:**  
   The retrieved context is concatenated with the query to create an enriched prompt.
5. **LLM Inference:**  
   The prompt is forwarded to the `ai-inference-service` to generate a response from the LLM.
6. **Return Response:**  
   The final response is returned to the user (streaming or non-streaming).

### Running the Service

Start the service locally:
```bash
uvicorn app:app --port 8000 --reload
```

## Usage Example

### Non-Streaming Request
```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Authorization: Bearer your_internal_api_key" \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain the concept of Kirchhoff’s Voltage Law in circuit analysis.", "stream": false}'
```

### Streaming Request
```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Authorization: Bearer your_internal_api_key" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"query": "Explain the concept of Kirchhoff’s Voltage Law in circuit analysis.", "stream": true}'
```

*For example, with the given Circuit Theory documents, you could ask: "Explain how Kirchhoff’s Voltage Law is applied in circuit analysis," and the system will augment your query with context from the lecture notes.*

## Additional Notes

- **Context Source:**  
  The context is retrieved from your local STEM documents ingested into `Qdrant`.

- **RAG Pipeline:**  
  The final LLM response is generated by combining the retrieved document context and the query. This means the answer leverages both domain-specific content from Qdrant and general LLM knowledge—unless you explicitly instruct the model to limit its answer to the provided context.

- **Logging and Debugging:**  
  The service logs key steps (e.g., the assembled context) for debugging purposes.

- **Inter-Service Integration:**  
  The `ai-dialogue-service` is designed to work with the `ai-inference-service` (located in `services/ai-inference-service`), using the same internal API key for secure communication.

___

© 2025 Chatapult  

Part of the Chatapult project located at `services/ai-dialogue-service`.