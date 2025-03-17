# Database Service

The **Database Service** manages storage and retrieval of chats, folders, and related data for the Chatapult project. It uses **Express**, **MongoDB**, and **JWT-based** authentication middleware to protect routes.

## Overview

- **Technology Stack**  
  - **Backend**: Node.js, Express  
  - **Database**: MongoDB (via Mongoose)  
  - **Security**: JWT-based route protection  
- **Purpose**  
  - Store and retrieve user chats (including messages, tags, etc.)  
  - Organize chats into folders  
  - Provide secure CRUD operations for chat and folder data  

## Folder Structure

```
database-service
├─ node_modules
├─ src
│  ├─ config
│  │  └─ db.js             # Connects to MongoDB
│  ├─ controllers
│  │  ├─ chatController.js   # CRUD for Chat model
│  │  └─ folderController.js # CRUD for Folder model
│  ├─ middlewares
│  │  └─ authMiddleware.js   # Verifies JWT tokens
│  ├─ models
│  │  ├─ Chat.js             # Mongoose schema for chats
│  │  └─ Folder.js           # Mongoose schema for folders
│  ├─ routes
│  │  ├─ chatRoutes.js       # /api/chats endpoints
│  │  └─ folderRoutes.js     # /api/folders endpoints
│  └─ app.js                 # Main Express server
├─ .env
├─ package-lock.json
├─ package.json
└─ README.md  (this file)
```

## Prerequisites

1. **Node.js** (v14+ recommended)  
2. **MongoDB** (local or remote)

## Installation

1. **Clone/Download the Repository**  
   Make sure you have the `database-service` folder locally.

2. **Install Dependencies**  
   ```bash
   cd database-service
   npm install
   ```

3. **Configure Environment Variables**  
   Create or update your `.env` file in the `database-service` folder with:

   ```bash
   MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
   JWT_SECRET=some_long_secret_string
   PORT=5000
   ```
   - **MONGODB_URI**: Connection string for your MongoDB instance  
   - **JWT_SECRET**: Used to verify incoming JWT tokens from other services or front-end  
   - **PORT**: The port on which the service will run (default: `5000`)

## Running the Service

```bash
npm run start
```

or (for local development with automatic restarts):

```bash
npm run dev
```

**Output**:  
You should see console logs indicating a successful MongoDB connection and that the service is running on your configured port.

## Endpoints

All endpoints require a valid JWT token in the `Authorization` header, for example:
```
Authorization: Bearer <jwt_token>
```
If the token is missing or invalid, the service returns a `401 Unauthorized` error.

### Chat Endpoints

**Route Prefix**: `/api/chats`

1. **GET `/api/chats`**  
   - **Query Params**: `username`, optional `folderId`  
   - **Behavior**: Retrieves all chats for the specified `username`. If `folderId=none`, it returns chats with no folder.  
   - **Protected**: Yes (JWT required)

2. **GET `/api/chats/:chatId`**  
   - **Params**: `chatId`  
   - **Behavior**: Returns the chat document matching `chatId`.  
   - **Protected**: Yes

3. **POST `/api/chats`**  
   - **Body**: `{ username, folderId, chatId, chatName, messages, tags }`  
   - **Behavior**: Creates a new chat document.  
   - **Protected**: Yes

4. **PUT `/api/chats/:chatId`**  
   - **Params**: `chatId`  
   - **Body**: `{ chatName, folderId, tags }`  
   - **Behavior**: Updates chat metadata (name, folder, tags).  
   - **Protected**: Yes

5. **PUT `/api/chats/:chatId/messages`**  
   - **Params**: `chatId`  
   - **Body**: `{ messages }`  
   - **Behavior**: Replaces the messages array for the chat.  
   - **Protected**: Yes

6. **DELETE `/api/chats/:chatId`**  
   - **Params**: `chatId`  
   - **Behavior**: Deletes the specified chat.  
   - **Protected**: Yes

### Folder Endpoints

**Route Prefix**: `/api/folders`

1. **POST `/api/folders`**  
   - **Body**: `{ folderId, folderName, username }`  
   - **Behavior**: Creates a new folder document.  
   - **Protected**: Yes

2. **GET `/api/folders`**  
   - **Query Param**: `username`  
   - **Behavior**: Returns all folders belonging to the specified username.  
   - **Protected**: Yes

3. **GET `/api/folders/:folderId`**  
   - **Params**: `folderId`  
   - **Behavior**: Returns the folder with the given folderId.  
   - **Protected**: Yes

4. **PUT `/api/folders/:folderId`**  
   - **Params**: `folderId`  
   - **Body**: `{ folderName }`  
   - **Behavior**: Updates the folder name.  
   - **Protected**: Yes

5. **DELETE `/api/folders/:folderId`**  
   - **Params**: `folderId`  
   - **Behavior**: Deletes the folder and all associated chats.  
   - **Protected**: Yes

## JWT Authentication

- The service expects a JWT token in the `Authorization` header (e.g., `Bearer <token>`).  
- Tokens are verified using `JWT_SECRET`.  
- If the token is invalid or missing, the request is denied with a 401 response.

## Logging

- **morgan** is used to log all incoming HTTP requests to the console.  
- Errors are logged to the console and returned as JSON via the Express global error handler.

## CORS Configuration

In `app.js`, `cors` is configured to allow requests from `http://localhost:3000` with credentials. Modify or extend the origin list as needed for your environment.

## Integration with Other Services

- Typically called by your front-end or other microservices (e.g., the **Next.js** UI or **Auth Service**) to manage user chats and folders.
- The **Auth Service** issues JWT tokens, which are used here for route protection.

## Troubleshooting

1. **MongoDB Connection Error**  
   - Ensure `MONGODB_URI` is correct and MongoDB is running/accessible.
2. **JWT Verification Error**  
   - Check that `JWT_SECRET` matches the secret used by your Auth Service if tokens are shared.
3. **CORS Issues**  
   - Adjust `cors` options in `app.js` to match your client’s domain(s).

## Running in Production

- Ensure environment variables are set securely in your production environment.

---

© 2025 Chatapult  
Part of the Chatapult project located at `services/database-service`.