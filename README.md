# Project Name

## Table of Contents

- [About](#about)
- [Setup](#setup)
- [Running the Project](#installation-and-running-the-project)
- [Architecture](#architecture)
- [Reasoning Behind the Architecture](#reasoning-behind-the-architecture)
- [Flow](#flow)

## About

This project is designed to handle messages and conversations. It integrates various technologies such as mongodb, elasticsearch and kafka to provide a scalable and efficient solution.

## Setup

### Prerequisites

- Node.js (>= 18.x)
- Docker
- PNPM

### Installation and Running the project

1. Running mongodb, elasticsearch and kafka by run command:
   ```
   docker-compose up -d
   ```
2. Running message-api and message-processor
   - create two terminals
   - terminal 1: cd message-api && pnpm i && pnpm run start:dev
   - terminal 1: cd message-api && pnpm i && pnpm run start:dev

### Running Tests

```sh
cd message-api && npm run test
```

## Architecture

The project follows a [Monolithic/Microservices/Clean Architecture] approach:

- **API Layer**: Handles requests and responses.
- **Service Layer**: Contains business logic.
- **Data Layer**: Handles interactions with the database with Mongoose ORM.
- **Message Queue**: Uses Kafka for async processing.
- **Message Search**: Use Elasticsearch
- **Message API**: API Layer to handle request and response,send message to kafka.
- **Message Processor**: API Layer process message that received and index it to Elasticsearch.

## Reasoning Behind the Architecture

1. **Scalability**:

   - The architecture follows a modular approach, making it easy to scale individual components.

   - Using a message queue (Kafka) allows asynchronous processing, preventing API bottlenecks.

   - Elasticsearch enables efficient searching and indexing, ensuring fast retrieval of messages even with large datasets.

2. **Maintainability**:

   - The API, Service, and Data layers are well-separated, following the SOLID principles for better code organization.

   - Mongoose ORM simplifies database interactions, reducing direct database queries and ensuring schema consistency.

   - Message API and Message Processor are decoupled, making it easy to update or replace components without affecting the entire system.

3. **Performance**:

   - Asynchronous processing via Kafka prevents blocking operations, improving API response times.

   - Elasticsearch optimizes full-text search, making message lookups fast and efficient.

   - Using PNPM for package management improves dependency resolution and speeds up installations.

## Flow

1. A request is received by the API.
2. The request is validated and passed to the service layer.
3. The service layer processes the request and interacts with the database/message queue if necessary.
4. The response is returned to the client.
