const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Snippet = require('./models/Snippet');

const sampleSnippets = [
  {
    title: 'Start Dev Server with Host',
    content: 'npm run dev -- --host',
    description: 'Start Vite dev server and expose to network for testing on other devices',
    type: 'command',
    language: 'shell',
    platform: 'all',
    tags: ['npm', 'vite', 'development', 'network'],
    isFavorite: true,
  },
  {
    title: 'Find Listening Ports (Windows)',
    content: 'netstat -ano | findstr LISTENING',
    description: 'Find all listening ports on Windows with their process IDs',
    type: 'command',
    language: 'shell',
    platform: 'windows',
    tags: ['network', 'ports', 'debug'],
    isFavorite: false,
  },
  {
    title: 'Start MongoDB',
    content: 'mongod --dbpath /data/db',
    description: 'Start MongoDB server with custom data directory',
    type: 'command',
    language: 'shell',
    platform: 'all',
    tags: ['mongodb', 'database', 'server'],
    isFavorite: true,
  },
  {
    title: 'React useState Hook',
    content: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(c => c - 1)}>
        Decrement
      </button>
    </div>
  );
}

export default Counter;`,
    description: 'Basic React useState hook example with counter component',
    type: 'snippet',
    language: 'typescript',
    category: 'hook',
    framework: 'react',
    platform: 'na',
    tags: ['react', 'hooks', 'useState', 'state-management'],
    isFavorite: true,
  },
  {
    title: 'Express API Route Template',
    content: `const express = require('express');
const router = express.Router();

// GET all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create item
router.post('/', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;`,
    description: 'Full CRUD Express router template with async/await and error handling',
    type: 'snippet',
    language: 'javascript',
    category: 'api',
    framework: 'express',
    platform: 'na',
    tags: ['express', 'nodejs', 'api', 'rest', 'crud'],
    isFavorite: true,
  },
  {
    title: 'Docker Compose MERN Stack',
    content: `version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - PORT=5000
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:`,
    description: 'Docker Compose configuration for MERN stack application',
    type: 'snippet',
    language: 'yaml',
    category: 'config',
    framework: 'none',
    platform: 'na',
    tags: ['docker', 'docker-compose', 'mern', 'mongodb', 'deployment'],
    isFavorite: false,
  },
  {
    title: 'Git Stash with Message',
    content: 'git stash push -m "WIP: feature description"',
    description: 'Stash changes with a descriptive message for later retrieval',
    type: 'command',
    language: 'shell',
    platform: 'all',
    tags: ['git', 'stash', 'version-control'],
    isFavorite: false,
  },
  {
    title: 'Kill Process on Port (Linux/Mac)',
    content: 'lsof -ti:3000 | xargs kill -9',
    description: 'Find and kill process running on a specific port',
    type: 'command',
    language: 'shell',
    platform: 'linux',
    tags: ['linux', 'process', 'port', 'kill'],
    isFavorite: false,
  },
  {
    title: 'TypeScript Interface Example',
    content: `interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  roles: Role[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

type Permission = 'read' | 'write' | 'delete' | 'admin';

// Usage with generics
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Example function
async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
    description: 'TypeScript interface patterns with generics and utility types',
    type: 'snippet',
    language: 'typescript',
    category: 'type',
    framework: 'none',
    platform: 'na',
    tags: ['typescript', 'interface', 'types', 'generics'],
    isFavorite: true,
  },
  {
    title: 'Tailwind CSS Button Styles',
    content: `<!-- Primary Button -->
<button class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Primary
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
  Secondary
</button>

<!-- Outline Button -->
<button class="px-4 py-2 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Outline
</button>

<!-- Danger Button -->
<button class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
  Delete
</button>

<!-- Button with Icon -->
<button class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>
  Add Item
</button>`,
    description: 'Reusable Tailwind CSS button styles with hover, focus, and transition effects',
    type: 'snippet',
    language: 'html',
    category: 'style',
    framework: 'none',
    platform: 'na',
    tags: ['tailwindcss', 'css', 'buttons', 'ui', 'design'],
    isFavorite: false,
  },
  {
    title: 'MongoDB Aggregation Pipeline',
    content: `db.orders.aggregate([
  // Stage 1: Match orders from last 30 days
  {
    $match: {
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      status: 'completed'
    }
  },
  // Stage 2: Lookup user details
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }
  },
  // Stage 3: Unwind user array
  {
    $unwind: '$user'
  },
  // Stage 4: Group by user
  {
    $group: {
      _id: '$userId',
      userName: { $first: '$user.name' },
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: '$total' },
      avgOrderValue: { $avg: '$total' }
    }
  },
  // Stage 5: Sort by total spent
  {
    $sort: { totalSpent: -1 }
  },
  // Stage 6: Limit to top 10
  {
    $limit: 10
  },
  // Stage 7: Project final fields
  {
    $project: {
      _id: 0,
      userId: '$_id',
      userName: 1,
      totalOrders: 1,
      totalSpent: { $round: ['$totalSpent', 2] },
      avgOrderValue: { $round: ['$avgOrderValue', 2] }
    }
  }
]);`,
    description: 'MongoDB aggregation pipeline for finding top customers by revenue',
    type: 'snippet',
    language: 'javascript',
    category: 'data-fetching',
    framework: 'none',
    platform: 'na',
    tags: ['mongodb', 'aggregation', 'database', 'analytics'],
    isFavorite: false,
  },
  {
    title: 'Python FastAPI CRUD',
    content: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4

app = FastAPI()

# Models
class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: str

# In-memory database
items_db: dict[str, Item] = {}

# Routes
@app.get("/items", response_model=List[Item])
def get_items():
    return list(items_db.values())

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]

@app.post("/items", response_model=Item, status_code=201)
def create_item(item: ItemCreate):
    item_id = str(uuid4())
    db_item = Item(id=item_id, **item.dict())
    items_db[item_id] = db_item
    return db_item

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: str, item: ItemCreate):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item = Item(id=item_id, **item.dict())
    items_db[item_id] = db_item
    return db_item

@app.delete("/items/{item_id}")
def delete_item(item_id: str):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]
    return {"message": "Item deleted"}`,
    description: 'Basic CRUD API with FastAPI, Pydantic models, and in-memory database',
    type: 'snippet',
    language: 'python',
    category: 'api',
    framework: 'fastapi',
    platform: 'na',
    tags: ['python', 'fastapi', 'api', 'rest', 'crud'],
    isFavorite: false,
  },
  {
    title: 'React Custom Hook - useFetch',
    content: `import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}`,
    description: 'Custom React hook for data fetching with loading and error states',
    type: 'snippet',
    language: 'typescript',
    category: 'hook',
    framework: 'react',
    platform: 'na',
    tags: ['react', 'hooks', 'fetch', 'custom-hook', 'data-fetching'],
    isFavorite: true,
  },
  {
    title: 'React Error Boundary Component',
    content: `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`,
    description: 'React Error Boundary component for graceful error handling',
    type: 'snippet',
    language: 'typescript',
    category: 'error-handling',
    framework: 'react',
    platform: 'na',
    tags: ['react', 'error-boundary', 'error-handling', 'component'],
    isFavorite: false,
  },
  {
    title: 'Next.js API Route Handler',
    content: `import { NextRequest, NextResponse } from 'next/server';

interface Item {
  id: string;
  name: string;
}

// GET /api/items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    // Your database logic here
    const items: Item[] = [];
    
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Your database logic here
    const newItem: Item = { id: '1', name: body.name };
    
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}`,
    description: 'Next.js 13+ App Router API route handler with error handling',
    type: 'snippet',
    language: 'typescript',
    category: 'api',
    framework: 'nextjs',
    platform: 'na',
    tags: ['nextjs', 'api', 'app-router', 'typescript'],
    isFavorite: true,
  },
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/snippet-manager';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop existing indexes to avoid conflicts
    console.log('Dropping existing indexes...');
    try {
      await Snippet.collection.dropIndexes();
      console.log('Indexes dropped successfully');
    } catch (indexError) {
      console.log('No indexes to drop or error dropping indexes (this is okay for first run)');
    }

    // Clear existing data
    console.log('Clearing existing snippets...');
    await Snippet.deleteMany({});

    // Ensure indexes are created
    console.log('Creating indexes...');
    await Snippet.createIndexes();
    console.log('Indexes created');

    // Insert sample snippets
    console.log('Inserting sample snippets...');
    await Snippet.insertMany(sampleSnippets);

    console.log(`Successfully seeded ${sampleSnippets.length} snippets!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();