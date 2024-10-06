# Chatapult: Launch Your Skills With AI Dialogue

## Overview

Chatapult is a microservices-based application that leverages multiple services to provide a robust and scalable architecture. This repository contains all the necessary services and configuration files to run the full application.

## Project Structure

The project is structured as follows:

```
Chatapult/
├── README.md
├── .gitattributes
├── .gitignore
├── docker-compose.yml
├── services/
│   ├── frontend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── database-service/
│   └── ai-inference-service/
├── nginx/
├── shared/
├── scripts/
└── docs/
```

### Main Components

- `services/frontend`: A Next.js application that serves as the user interface for Chatapult.
- `services/api-gateway`: Routes incoming requests to the correct backend services.
- `services/auth-service`: Handles authentication and authorization for the application.
- `services/database-service`: Responsible for managing and interacting with the application's database.
- `services/ai-inference-service`: Provides AI/ML capabilities by handling model inference and predictions.
- `nginx`: Configured as a reverse proxy to handle traffic distribution among the microservices.
- `shared`: Contains reusable utilities and constants that are shared across multiple services.
- `scripts`: Shell scripts for automating build, deployment, and other tasks.
- `docs`: Documentation for the application, including architectural overviews and API specifications.

## Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/seanchan123/Chatapult.git
   cd Chatapult
   ```

2. **Install Dependencies for Each Service**
   Navigate to each service in `services/` and install dependencies:
   ```bash
   cd services/frontend
   npm install
   ```

   Repeat for `api-gateway`, `auth-service`, and `database-service`.

3. **Run the Application with Docker Compose**
   Use the `docker-compose.yml` to build and run all services:
   ```bash
   docker-compose up --build
   ```

## Running Individual Services

### Frontend
To run the Next.js frontend locally:
```bash
cd services/frontend
npm run dev
```

### API Gateway
To start the API Gateway:
```bash
cd services/api-gateway
npm start
```

### Auth Service
To start the Auth Service:
```bash
cd services/auth-service
npm start
```

### Database Service
To start the Database Service:
```bash
cd services/database-service
npm start
```

### AI Inference Service
To start the AI Inference Service:
```bash
cd services/ai-inference-service
python app.py
```

## Contribution

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a pull request**

# License

This project is proprietary and confidential. All rights reserved.

Unauthorized copying of this file, via any medium, is strictly prohibited.
The code contained herein is the property of Singapore Institute of Technology / University of Glasgow.

You may not use, distribute, modify, or reproduce any portion of this code
without explicit written permission from Singapore Institute of Technology / University of Glasgow.