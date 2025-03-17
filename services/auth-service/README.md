# Auth Service

The **Auth Service** provides user authentication for the Chatapult project. It manages user registration, login, and JWT token issuance using **Express**, **MongoDB**, and **JSON Web Tokens**.

## Overview

- **Technology Stack**  
  - **Backend**: Node.js, Express  
  - **Database**: MongoDB (via Mongoose)  
  - **Security**: Password hashing with **bcrypt**, token-based authentication with **jsonwebtoken**  
- **Purpose**  
  - Create new users in MongoDB with a hashed password  
  - Verify user credentials at login  
  - Return a signed JWT token for authenticated sessions  

## Folder Structure

```
auth-service
├─ node_modules
├─ src
│  ├─ config
│  │  └─ db.js              # Connects to MongoDB
│  ├─ controllers
│  │  └─ authController.js  # Contains register/login logic
│  ├─ models
│  │  └─ User.js            # Mongoose schema for users
│  ├─ routes
│  │  └─ authRoutes.js      # Defines auth-related endpoints
│  └─ app.js                # Main Express server
├─ .env
├─ package-lock.json
├─ package.json
```

## Prerequisites

1. **Node.js** (v14+ recommended)  
2. **MongoDB** (local or remote)

## Installation

1. **Clone/Download the Repository**  
   Make sure you have the `auth-service` folder locally.

2. **Install Dependencies**  
   ```bash
   cd auth-service
   npm install
   ```

3. **Configure Environment Variables**  
   Create or update your `.env` file in the `auth-service` folder with:

   ```bash
   MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
   JWT_SECRET=some_long_secret_string
   PORT=4000
   ```
   - **MONGODB_URI**: Connection string for your MongoDB instance  
   - **JWT_SECRET**: Used to sign JWT tokens  
   - **PORT**: The port on which the service will run (default: `4000`)

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

All endpoints are prefixed with `/api/auth` by default.

### `POST /api/auth/register`

- **Request Body**:
  ```json
  {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "plaintextpassword"
  }
  ```
- **Behavior**:
  - Checks if a user with the same email already exists
  - Hashes the user’s password
  - Creates a new user in the `users` collection
  - Returns a JWT token in JSON upon success
- **Response** (success example):
  ```json
  {
    "token": "<jwt_token>"
  }
  ```
- **Response** (error example):
  ```json
  {
    "error": "User already exists"
  }
  ```

### `POST /api/auth/login`

- **Request Body**:
  ```json
  {
    "username": "testuser",
    "password": "plaintextpassword"
  }
  ```
- **Behavior**:
  - Finds the user by `username`
  - Compares the given password with the hashed password in the database
  - Returns a JWT token in JSON upon success
- **Response** (success example):
  ```json
  {
    "token": "<jwt_token>"
  }
  ```
- **Response** (error example):
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

## Token Usage

Upon receiving a token from `register` or `login`, the client (e.g., your front-end or another service) can store it (often in local storage, cookies, or an in-memory store) and attach it as needed to subsequent requests to other services that require authentication.

## Logging

- **morgan** is used for logging all incoming HTTP requests to the console.  
- Errors are logged to the console and returned as JSON via an Express global error handler.

## CORS Configuration

In `app.js`, `cors` is configured to allow requests from `http://localhost:3000` with credentials. Adjust or extend this origin list as needed.

## Integration with Other Services

- Typically used by your **Next.js** front-end or other microservices in the Chatapult project to authenticate users and manage sessions.
- Other services can rely on the JWT token from this Auth Service to authorize user requests.

## Troubleshooting

1. **MongoDB Connection Error**:  
   Check that `MONGODB_URI` is correct and that your MongoDB instance is running or accessible.
2. **JWT Issues**:  
   Ensure `JWT_SECRET` matches the one used by other services (if you share tokens) or is set properly in `.env`.

## Running in Production

- Ensure environment variables are set securely in your production environment.

---

© 2025 Chatapult  
Part of the Chatapult project located at `services/database-service`.