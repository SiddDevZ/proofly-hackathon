import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { serveStatic } from '@hono/node-server/serve-static';
import config from '../config.json' assert { type: 'json' };

// Import routes
import studentAuth from './routes/studentAuth.js';
import universityAuth from './routes/universityAuth.js';
import credentialRoutes from './routes/credentialRoutes.js';

dotenv.config();

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
app.route('/api/student', studentAuth);
app.route('/api/university', universityAuth);
app.route('/api/credentials', credentialRoutes);

app.use('/uploads/*', serveStatic({ root: './' }));

const port = process.env.PORT || 3001;
serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Server running at ${config.backend_url}`);
