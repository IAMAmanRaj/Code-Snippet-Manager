# Code Snippet Manager

A full-stack snippet and command manager built for developers who want one place to store, search, organize, and reuse code snippets and terminal commands.

It supports powerful filtering, favorites, recent access tracking, import/export, and metadata like language, framework, category, tags, and platform.

## Features

- 🧩 **Dual Item Types**: Manage both code snippets and terminal commands
- 🔍 **Advanced Search & Filters**: Filter by type, language, category, framework, platform, tags, and favorites
- ⭐ **Favorites & Recent**: Mark important entries and quickly access recently opened items
- 📦 **Import / Export JSON**: Back up your library and import it later
- 📊 **Usage Statistics**: View totals and distribution by type/language/category/framework/platform
- 🌗 **Theme Support**: Light/dark mode UI
- ⚡ **Responsive UX (Desktop-first)**: Dedicated desktop experience with tailored UI components
- ☁️ **Vercel-ready**: Frontend and backend deployment support, including serverless MongoDB connection caching

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Axios
- Framer Motion
- Monaco Editor (`@monaco-editor/react`)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Express Validator
- CORS + dotenv

## Project Structure

```text
code_snippet_manager/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (editor, viewer, list, filters, import/export, etc.)
│   │   ├── hooks/           # Data/theme/toast hooks
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript models
│   │   └── utils/           # Utility helpers
│   ├── .env.example
│   └── vercel.json
├── backend/
│   ├── api/index.js         # Vercel serverless entrypoint
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── db.js                # Cached MongoDB connection for serverless
│   ├── .env.example
│   └── vercel.json
└── CODE_SNIPPET.md          # Conversation history / implementation notes
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas)
- npm

### 1) Install Dependencies

```bash
# frontend
cd frontend
npm install

# backend
cd ../backend
npm install
```

### 2) Configure Environment Variables

Create local env files from examples.

#### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/snippet-manager
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

#### Frontend (`frontend/.env`)

```env
VITE_API_PROXY_TARGET=http://localhost:5000
VITE_API_BASE_URL=
```

Notes:
- In local dev, frontend uses `/api` and Vite proxies to `VITE_API_PROXY_TARGET`.
- In production, set `VITE_API_BASE_URL` to your deployed backend URL.

### 3) Run Locally

```bash
# terminal 1
cd backend
npm run dev
```

```bash
# terminal 2
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## API Endpoints

Base path: `/api/snippets`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get snippets/commands with filters, search, sort, and pagination |
| GET | `/recent` | Get recently accessed items |
| GET | `/favorites` | Get favorite items |
| GET | `/tags` | Get tag counts |
| GET | `/languages` | Get language counts |
| GET | `/categories` | Get category counts |
| GET | `/frameworks` | Get framework counts |
| GET | `/stats` | Get dashboard statistics |
| GET | `/export` | Export all snippets as JSON |
| POST | `/import` | Import snippets from JSON |
| GET | `/:id` | Get a single snippet (also updates access stats) |
| POST | `/` | Create a snippet/command |
| PUT | `/:id` | Update a snippet/command |
| DELETE | `/:id` | Delete a snippet/command |
| PATCH | `/:id/favorite` | Toggle favorite |

Additional backend endpoint:
- `GET /api/health` - service health check

## Data Model (Snippet)

Each item supports:
- `title`, `content`, `description`
- `type`: `snippet` or `command`
- `language`
- `category` (e.g. `hook`, `component`, `utility`, etc.)
- `framework` (e.g. `react`, `nextjs`, `express`, etc.)
- `platform` (`windows`, `linux`, `mac`, `all`, `na`)
- `tags[]`
- `isFavorite`
- `accessCount`, `lastAccessedAt`
- `createdAt`, `updatedAt`

## Vercel Deployment

This repo is set up for split deployments:

- **Frontend project** -> deploy `frontend/`
- **Backend project** -> deploy `backend/`

### Required Environment Variables

#### Backend (Vercel)
- `NODE_ENV=production`
- `MONGODB_URI=<your_mongodb_connection_string>`
- `CORS_ORIGIN=<comma-separated allowed frontend domains>`

#### Frontend (Vercel)
- `VITE_API_BASE_URL=<your_backend_vercel_url>`

The backend uses a standard Vercel serverless Mongo pattern via `backend/db.js` and `backend/api/index.js` to reuse connections across invocations.

## Scripts

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Backend
- `npm run dev` - start with nodemon
- `npm start` - start production server
- `npm run seed` - run seed script

## Build for Production

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## Import JSON Format

Import expects:

```json
{
  "snippets": [
    {
      "title": "Example title",
      "content": "console.log('hello')",
      "type": "snippet",
      "language": "javascript"
    }
  ]
}
```

You can also include optional fields such as `description`, `tags`, `category`, `framework`, `platform`, and `isFavorite`.

## License

ISC
