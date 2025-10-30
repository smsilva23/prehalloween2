# Basic Node.js Server

A simple Express.js server with basic routes and middleware.

## Features

- Express.js framework
- CORS enabled
- JSON body parsing
- Basic API routes
- Error handling
- Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/hello` - Hello API endpoint
- `POST /api/echo` - Echo endpoint (returns received data)

## Usage Examples

### Start the server
```bash
npm start
```

### Test endpoints
```bash
# Welcome message
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health

# Hello API
curl http://localhost:3000/api/hello

# Echo endpoint
curl -X POST http://localhost:3000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Project Structure

```
├── package.json     # Dependencies and scripts
├── server.js        # Main server file
└── README.md        # This file
```
