# English Learning Chatbot API

Production-grade Node.js API for an AI-powered English learning chatbot with RAG (Retrieval-Augmented Generation), topic-restricted conversations, and MongoDB vector search.

## Features

- **Topic-Restricted Chat**: Bot only answers questions within the context of the selected topic
- **RAG with Vector Search**: Uses MongoDB Atlas vector search to retrieve relevant content chunks
- **Streaming & Non-Streaming**: Both response types supported
- **Conversation History**: Persistent chat history per user/topic
- **Admin API**: Full CRUD for topic management
- **VTT Support**: Parse and process video transcript files
- **Production Ready**: Rate limiting, logging, error handling, health checks

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Node.js API    │────▶│   MongoDB   │
└─────────────┘     │   (Express)      │     │   Atlas     │
                    └────────┬─────────┘     └─────────────┘
                             │
                    ┌────────▼─────────┐
                    │  OpenAI API      │
                    │  (GPT-4o-mini)   │
                    └──────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account with vector search enabled
- OpenAI API key

### Installation

```bash
git clone https://github.com/macrobian88/english-learning-chatbot-api.git
cd english-learning-chatbot-api
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Docker

```bash
docker build -t english-chatbot-api .
docker run -p 3000:3000 --env-file .env english-chatbot-api
```

## API Endpoints

### Chat APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Full response |
| `POST` | `/api/chat/stream` | Streaming response (SSE) |

### Conversation APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List user conversations |
| `GET` | `/api/conversations/:topic_id` | Get conversation history |
| `DELETE` | `/api/conversations/:topic_id` | Clear conversation |

### Admin APIs (requires API key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/topics` | Create topic |
| `GET` | `/api/admin/topics` | List topics |
| `GET` | `/api/admin/topics/:topic_id` | Get topic |
| `PUT` | `/api/admin/topics/:topic_id` | Update topic |
| `DELETE` | `/api/admin/topics/:topic_id` | Delete topic |
| `POST` | `/api/admin/topics/bulk` | Bulk upload |

## MongoDB Atlas Setup

Create vector search index on `chunks` collection:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "topic_id": {
        "type": "token"
      }
    }
  }
}
```

Name: `chunk_vector_index`

## License

MIT
