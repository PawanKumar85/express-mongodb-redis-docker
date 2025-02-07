# Express Task API with MongoDB, Redis, and JWT Authentication

This project is a production-ready RESTful API built using Express, MongoDB, Redis, and JWT for user authentication and caching. The application allows users to register, log in, create tasks, update tasks, and perform task CRUD operations, with efficient caching using Redis.

## Features

- **User Authentication**: Register, log in, and log out using JWT tokens.
- **Task Management**: Create, read, update, and delete tasks.
- **Redis Caching**: Caches task data to improve performance.
- **Dockerized Setup**: Easily deployable using Docker and Docker Compose.
- **Redis GUI**: Redis Commander is included for managing Redis via a GUI.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js (for local development)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PawanKumar85/express-mongodb-redis-docker.git
cd express-mongodb-redis-docker
```

### 2. Configure Environment Variables

Create a .env file in the root of the project and set the following environment variables:

```env
# MongoDB connection string
MONGODB_URI=mongodb://mongodb:27017/redis-api

# Redis configuration
MONGODB_URI=mongodb://mongodb:27017/redis-api
REDIS_HOST=redis
REDIS_PORT=6379
NODE_ENV=production
JWT_SECRET=jwt-secret
CACHE_EXPIRY=3600

# Port for Express app (optional, defaults to 5000)
PORT=5000

# Node environment
NODE_ENV=production
```

## #3. Build and Run with Docker Compose

Use Docker Compose to build and run all services:

```bash
docker-compose up --build -d
```

This command will:

- Build the Express application image.
- Start the MongoDB, Redis, and Redis Commander services.
- Connect all containers through a custom Docker network.

## #4. Access the Application

- **Express API**: [http://localhost:5000](http://localhost:5000)
- **Redis Commander (GUI)**: [http://localhost:8081](http://localhost:8081)

## #5. API Endpoints

### User Endpoints

- **Register**: `POST /api/users/register`
- **Login**: `POST /api/users/login`
- **Logout**: `POST /api/users/logout`

### Task Endpoints (Protected; Requires JWT Authentication)

- **Create Task**: `POST /api/task/`
- **Get All Tasks**: `GET /api/task/`
- **Get Task by ID**: `GET /api/task/:id`
- **Update Task**: `PATCH /api/task/:id`
- **Delete Task**: `DELETE /api/task/:id`

## #6. Building for Production

You can build the production image locally with:

```bash
docker build -t express-app:latest .
```

Or use Docker Compose:

```bash
docker-compose up --build -d
```

## Project Structure

```
├│ config
  ├│ db.js          # MongoDB connection setup
  ├│ redis.js          # Redis client configuration
├│ controllers
  ├│ auth.controller.js      # Authentication logic
  ├│ task.controller.js      # Task CRUD operations
├│ middlewares
  ├│ auth.middleware.js     # JWT authentication middleware
├│ models
  ├│ user.model.js      # Mongoose User schema and model
  ├│ task.model.js      # Mongoose Task schema and model
├│ routes
  ├│ user.routes.js      # User authentication routes
  ├│ task.routes.js      # Task management routes
├│ services
  ├│ redis.service.js     # Redis caching service functions
├│ .env          # Environment variables (not committed)
├│ Dockerfile          # Dockerfile for the Express app
├│ docker-compose.yml      # Docker Compose file for multi-container deployment
├│ package.json         # Node.js project metadata and dependencies
├│ server.js         # Application entry point
```
