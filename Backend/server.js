import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import config from '../config.json' assert { type: 'json' };

// Import routes
import studentAuth from './routes/studentAuth.js';
import universityAuth from './routes/universityAuth.js';
import credentialRoutes from './routes/credentialRoutes.js';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug logging for paths
console.log('🔍 Debug Info:');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);
console.log(`Resolved uploads path: ${path.resolve(__dirname, 'uploads')}`);

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads directory`);
} else {
  console.log(`✅ Uploads directory already exists`);
}

const app = new Hono();

app.use('*', cors({
  origin: [config.frontend_url, config.backend_url],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Database connected'))
  .catch((error) => console.error('❌ Database error:', error));

app.get('/', (c) => c.json({ message: 'Proofly Backend API' }));

// Debug route to check file system
app.get('/debug', (c) => {
  const debugInfo = {
    cwd: process.cwd(),
    __dirname,
    uploadsDir,
    uploadsExists: fs.existsSync(uploadsDir),
    uploadsDirContents: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : 'Directory does not exist'
  };
  return c.json(debugInfo);
});

// Mount API routes
app.route('/api/student', studentAuth);
app.route('/api/university', universityAuth);
app.route('/api/credentials', credentialRoutes);

// Serve static files from uploads directory
// This serves files at both /uploads/* and /proofly/uploads/* paths
app.use('/uploads/*', serveStatic({ 
  root: path.resolve(__dirname) 
}));
app.use('/proofly/uploads/*', serveStatic({ 
  root: path.resolve(__dirname),
  rewriteRequestPath: (path) => path.replace(/^\/proofly/, '')
}));

const port = process.env.PORT || 3001;
serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server running at ${config.backend_url}`);
console.log(`📁 Serving static files from: ${path.resolve(__dirname, 'uploads')}`);
console.log(`🔍 Visit ${config.backend_url}/debug for filesystem debug info`);
