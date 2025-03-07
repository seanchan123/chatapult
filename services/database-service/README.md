# Database Service

The Database Service is a core microservice in the Chatapult project. It is responsible for managing and storing application data, including user chat histories and associated metadata. This service leverages `MongoDB` as the data store and uses `Mongoose` for data modeling and interaction.

## Overview

- **Purpose:**  
  Provide a centralized, scalable data store for the Chatapult system, handling operations such as creating, reading, updating, and deleting chat conversations and related records.
- **Technology Stack:**  
  - **Backend:** Express, Node.js (JavaScript)  
  - **Database:** MongoDB (using Mongoose for ODM)  
  - **Environment Management:** dotenv  
- **Project Structure:**  
  The service is organized into modular directories for configuration, models, controllers, routes, and middleware to keep the code maintainable and scalable.

## Prerequisites

- **Node.js:** Install Node.js (v14 or higher) from [nodejs.org](https://nodejs.org).
- **MongoDB:**  
  - For local development, ensure you have a MongoDB instance running locally.
  - For cloud deployments, use a connection string for your hosted MongoDB (e.g., MongoDB Atlas).  
  **Note:** To explicitly create/use the `Chatapult` database, include the database name in your connection string.

- **Environment Variables:**  
  Create a `.env` file in the project root with the following variables:
  
  ```env
  PORT=5000
  MONGODB_URI=mongodb+srv://<username>:<password>@chatapult.tjn3e.mongodb.net/Chatapult?retryWrites=true&w=majority
  ```
  
  This connection string explicitly uses the `Chatapult` database.

## Folder Structure

```
database-service/
├── package.json
├── .env
└── src/
    ├── config/
    │   └── db.js            # MongoDB connection logic
    ├── controllers/
    │   └── chatController.js  # Chat operations logic
    ├── middlewares/
    │   └── authMiddleware.js  # Route protection middleware
    ├── models/
    │   ├── Chat.js          # Chat data model (using Mongoose)
    ├── routes/
    │   └── chatRoutes.js    # Routes for chat operations
    └── app.js               # Main Express application
```

## Installation and Setup

1. **Clone the Repository & Navigate to the Service Folder:**

   ```bash
   cd services/database-service
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the project root with your `MongoDB` connection string and desired `PORT`, as shown above.

4. **Run the Service:**

   For development, run:

   ```bash
   npm run dev
   ```

   This command executes `node src/app.js` and starts the service on the specified port (default is 5000).

## Database Initialization

- When the service starts, it connects to the `MongoDB` instance using the connection string defined in `.env`.  
- **Automatic Database Creation:**  
  `MongoDB` automatically creates the database (named `Chatapult` in this case) and any collections when you first write data.

## Logging

The service includes basic logging for each incoming request and outgoing response:
- **Request Logging:** Logs the HTTP method and URL for each request.
- **Response Logging:** Logs minimal details of responses sent back to the client.

This lightweight logging helps with debugging and monitoring without overwhelming the log files.

## API Endpoints

- **Chat Endpoints:**  
  - `POST /api/chats` – Create a new chat conversation.
  - `GET /api/chats/:chatId` – Retrieve a specific chat conversation.

## Testing

Use tools like Postman or cURL to send requests to your endpoints.

### Example Requests

1. **Create a Chat Conversation:**
    
    ```bash
    curl -X POST http://localhost:5000/api/chats \
        -H "Content-Type: application/json" \
        -d '{
        "userId": "user123",
        "folderId": "folderA",
        "chatId": "chat001",
        "messages": [
            { "sender": "user", "text": "Hello, world!", "timestamp": "2024-03-01T12:00:00Z" }
        ]
        }'
    ```

2. **Retrieve a Chat Conversation:**
  
    ```bash
    curl -X GET http://localhost:5000/api/chats/chat001
    ```

## Running in Production

- Ensure environment variables are set securely in your production environment.

---

© 2025 Chatapult  
Part of the Chatapult project located at `services/database-service`.