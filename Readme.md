# Node.js(TypeScript) app with PostrgreSQL(No ORM) and Redis appliction in Docker/Compose

This repository contains a Node.js application that uses PostgreSQL and Redis, and is Dockerized for easy deployment.

## Getting Started

Follow these steps to run the Node.js application with PostgreSQL and Redis in Docker:

1. Clone this repository:

   ```bash
   git clone https://github.com/tazbin/blog-website-backend-nodejs-REST-API app
   ```
2. Navigate to the repository:
    ```bash
   cd app
   ```
3. make a `.env` file and set the values
4. build docker images & run containers
    ```bash
   docker-compose up --build
   ```
5. view running containers
    ```bash
   docker ps
   ```

#### You can stop the running containers anytime using this command
```bash
   docker-compose down 
   ```