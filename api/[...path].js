/**
 * Vercel Serverless API Handler
 * Only handles API routes - static files are served by Vercel directly
 */

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser for stateless auth (works in serverless environment)
app.use(cookieParser(process.env.SESSION_SECRET || 'your-secret-key-change-this'));

// File paths (using __dirname works in both local and Vercel environments)
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const BLOG_FILE = path.join(__dirname, '..', 'data', 'blog.json');

// Helper functions
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return { products: [] };
  }
}

function writeProducts(data) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products:', error);
    return false;
  }
}

function readBlogPosts() {
  try {
    const data = fs.readFileSync(BLOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return { posts: [] };
  }
}

function writeBlogPosts(data) {
  try {
    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing blog posts:', error);
    return false;
  }
}

// Authentication middleware (cookie-based for serverless compatibility)
function requireAuth(req, res, next) {
  if (req.signedCookies && req.signedCookies.authenticated === 'true') {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ==================== AUTHENTICATION ROUTES ====================

app.post('/api/login', authLimiter, (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD || password === 'admin123') {
    // Set signed cookie (works in serverless)
    res.cookie('authenticated', 'true', {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('authenticated');
  res.json({ success: true, message: 'Logged out' });
});

app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: req.signedCookies.authenticated === 'true' });
});

// ==================== PRODUCTS API ROUTES ====================

app.get('/api/products', requireAuth, (req, res) => {
  const data = readProducts();
  res.json(data);
});

app.get('/api/products/:id', requireAuth, (req, res) => {
  const data = readProducts();
  const product = data.products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', requireAuth, (req, res) => {
  const data = readProducts();
  const newProduct = req.body;

  if (!newProduct.id) {
    const prefix = newProduct.category.split('-')[0] || 'p';
    const maxId = data.products
      .filter(p => p.id.startsWith(prefix))
      .reduce((max, p) => {
        const num = parseInt(p.id.split('-')[1]);
        return num > max ? num : max;
      }, 0);
    newProduct.id = `${prefix}-${String(maxId + 1).padStart(3, '0')}`;
  }

  const today = new Date().toISOString().split('T')[0];
  newProduct.metadata = {
    dateAdded: today,
    lastUpdated: today,
    lastPriceCheck: today,
    clicks: 0,
    featured: newProduct.metadata?.featured || false
  };

  data.products.push(newProduct);

  if (writeProducts(data)) {
    res.json({ success: true, product: newProduct });
  } else {
    res.status(500).json({ error: 'Failed to save product' });
  }
});

app.put('/api/products/:id', requireAuth, (req, res) => {
  const data = readProducts();
  const index = data.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...data.products[index],
    ...req.body,
    metadata: {
      ...data.products[index].metadata,
      ...req.body.metadata,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  };

  data.products[index] = updatedProduct;

  if (writeProducts(data)) {
    res.json({ success: true, product: updatedProduct });
  } else {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  const data = readProducts();
  const index = data.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  data.products.splice(index, 1);

  if (writeProducts(data)) {
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== BLOG API ROUTES ====================

app.get('/api/blog', requireAuth, (req, res) => {
  const data = readBlogPosts();
  res.json(data);
});

app.get('/api/blog/:id', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const post = data.posts.find(p => p.id === req.params.id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

app.post('/api/blog', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const newPost = req.body;

  if (!newPost.id) {
    const maxId = data.posts.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    newPost.id = `blog-${String(maxId + 1).padStart(3, '0')}`;
  }

  if (!newPost.date) {
    newPost.date = new Date().toISOString().split('T')[0];
  }

  if (!newPost.slug) {
    newPost.slug = newPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  data.posts.unshift(newPost);

  if (writeBlogPosts(data)) {
    res.json({ success: true, post: newPost });
  } else {
    res.status(500).json({ error: 'Failed to save blog post' });
  }
});

app.put('/api/blog/:id', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const index = data.posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Blog post not found' });
  }

  const updatedPost = {
    ...data.posts[index],
    ...req.body
  };

  data.posts[index] = updatedPost;

  if (writeBlogPosts(data)) {
    res.json({ success: true, post: updatedPost });
  } else {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

app.delete('/api/blog/:id', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const index = data.posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Blog post not found' });
  }

  data.posts.splice(index, 1);

  if (writeBlogPosts(data)) {
    res.json({ success: true, message: 'Blog post deleted' });
  } else {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Export for Vercel
module.exports = app;
