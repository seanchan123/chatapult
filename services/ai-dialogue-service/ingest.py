import os
import glob
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance

# Load environment variables from .env file
load_dotenv()

# Environment variables
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "Chatapult")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
DOCUMENTS_DIR = os.getenv("DOCUMENTS_DIR", "./documents/")

# Initialize the embedding model using HuggingFaceEmbeddings
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL)

# Check if the collection exists; if not, create it.
if not qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
    qdrant_client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
    print(f"Collection '{COLLECTION_NAME}' created in Qdrant.")
else:
    print(f"Collection '{COLLECTION_NAME}' already exists.")

# Create a QdrantVectorStore instance.
vectorstore = QdrantVectorStore(
    client=qdrant_client,
    collection_name=COLLECTION_NAME,
    embedding=embeddings
)

# Use glob to recursively find all PDF files in the DOCUMENTS_DIR
pdf_files = glob.glob(os.path.join(DOCUMENTS_DIR, "**/*.pdf"), recursive=True)

all_docs = []
for pdf_file in pdf_files:
    print(f"Processing {pdf_file}...")
    # Load the PDF and convert it into Document objects using PyPDFLoader
    loader = PyPDFLoader(pdf_file)
    docs = loader.load()  # Each Document has .page_content and .metadata
    # Add metadata for source information and store text for retrieval
    for doc in docs:
        doc.metadata["source"] = os.path.basename(pdf_file)
        doc.metadata["text"] = doc.page_content
    all_docs.extend(docs)

if all_docs:
    # Add the documents to the vector store.
    vectorstore.add_documents(all_docs)
    print(f"Ingestion complete. {len(all_docs)} document pages stored in Qdrant collection '{COLLECTION_NAME}'.")
else:
    print("No PDF documents found.")
