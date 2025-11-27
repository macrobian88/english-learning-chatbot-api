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

## Quick Start

```bash
git clone https://github.com/macrobian88/english-learning-chatbot-api.git
cd english-learning-chatbot-api
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Chat APIs
- `POST /api/chat` - Full response
- `POST /api/chat/stream` - Streaming response (SSE)

### Conversation APIs
- `GET /api/conversations` - Get user's conversation list
- `GET /api/conversations/:topic_id` - Get specific conversation
- `DELETE /api/conversations/:topic_id` - Clear conversation

### Admin APIs (requires API key)
- `POST /api/admin/topics` - Create new topic
- `GET /api/admin/topics` - List all topics
- `PUT /api/admin/topics/:topic_id` - Update topic
- `DELETE /api/admin/topics/:topic_id` - Delete topic

## MongoDB Atlas Setup

Create a vector search index on the `chunks` collection with name `chunk_vector_index`.

## License

MIT
