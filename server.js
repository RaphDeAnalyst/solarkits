/**
 * SolarKits Admin Panel - Backend Server
 * Express.js server with API routes for product management
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - Required for Vercel and rate limiting
app.set('trust proxy', 1);

// Security & Performance Middleware
// Compression for all responses
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024 // Only compress responses > 1KB
}));

// Security headers with helmet (disabled CSP for development)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to prevent CSS/JS blocking issues
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit login attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== CLEAN URL REWRITES ====================
// Rewrite clean URLs to actual HTML files (matches vercel.json)
app.use((req, res, next) => {
  const rewrites = {
    '/blog': '/pages/blog.html',
    '/about': '/pages/about.html',
    '/contact': '/pages/contact.html',
    '/categories': '/pages/categories.html',
    '/solar-kits': '/pages/solar-kits.html',
    '/solar-accessories': '/pages/solar-accessories.html',
    '/home-energy': '/pages/home-energy.html',
    '/outdoor-solar': '/pages/outdoor-solar.html',
    '/disclaimer': '/pages/disclaimer.html',
    '/privacy': '/pages/privacy.html',
    '/terms': '/pages/terms.html'
  };

  // Handle exact matches
  if (rewrites[req.path]) {
    req.url = rewrites[req.path];
  }

  // Handle blog post URLs: /blog/slug -> /pages/blog-post.html
  else if (req.path.startsWith('/blog/') && req.path !== '/blog/') {
    req.url = '/pages/blog-post.html';
  }

  next();
});

// Static files with caching headers
app.use(express.static('.', {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Don't cache HTML files aggressively
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    // Cache CSS and JS for 1 month
    else if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
    // Cache images for 1 year
    else if (path.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './images/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/login', authLimiter, (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

// Check authentication status
app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// ==================== PUBLIC API ROUTES (No Auth) ====================

// Public products endpoint
app.get('/api/public/products', (req, res) => {
  const data = readProducts();
  res.json(data);
});

// Public blog endpoints
app.get('/api/public/blog', (req, res) => {
  const data = readBlogPosts();
  res.json(data);
});

app.get('/api/public/blog/:id', (req, res) => {
  const data = readBlogPosts();
  const post = data.posts.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

// ==================== PRODUCTS API ROUTES ====================

const PRODUCTS_FILE = './data/products.json';

// Helper function to read products
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return { products: [] };
  }
}

// Helper function to write products
function writeProducts(data) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing products:', error);
    return false;
  }
}

// Get all products
app.get('/api/products', requireAuth, (req, res) => {
  const data = readProducts();
  res.json(data);
});

// Get single product
app.get('/api/products/:id', requireAuth, (req, res) => {
  const data = readProducts();
  const product = data.products.find(p => p.id === req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Create new product
app.post('/api/products', requireAuth, (req, res) => {
  const data = readProducts();
  const newProduct = req.body;

  // Generate ID if not provided
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

  // Set metadata
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

// Update product
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

// Delete product
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

const BLOG_FILE = './data/blog.json';

// Helper function to read blog posts
function readBlogPosts() {
  try {
    const data = fs.readFileSync(BLOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return { posts: [] };
  }
}

// Helper function to write blog posts
function writeBlogPosts(data) {
  try {
    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing blog posts:', error);
    return false;
  }
}

// Get all blog posts
app.get('/api/blog', requireAuth, (req, res) => {
  const data = readBlogPosts();
  res.json(data);
});

// Get single blog post
app.get('/api/blog/:id', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const post = data.posts.find(p => p.id === req.params.id);

  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: 'Blog post not found' });
  }
});

// Create new blog post
app.post('/api/blog', requireAuth, (req, res) => {
  const data = readBlogPosts();
  const newPost = req.body;

  // Generate ID if not provided
  if (!newPost.id) {
    const maxId = data.posts.reduce((max, p) => {
      const num = parseInt(p.id.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    newPost.id = `blog-${String(maxId + 1).padStart(3, '0')}`;
  }

  // Set date if not provided
  if (!newPost.date) {
    newPost.date = new Date().toISOString().split('T')[0];
  }

  // Generate slug if not provided
  if (!newPost.slug) {
    newPost.slug = newPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  data.posts.unshift(newPost); // Add to beginning

  if (writeBlogPosts(data)) {
    res.json({ success: true, post: newPost });
  } else {
    res.status(500).json({ error: 'Failed to save blog post' });
  }
});

// Update blog post
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

// Delete blog post
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

// ==================== IMAGE UPLOAD ROUTES ====================

// Upload image(s)
app.post('/api/upload', requireAuth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const fileUrls = req.files.map(file => `images/products/${file.filename}`);
  res.json({ success: true, files: fileUrls });
});

// Delete image
app.delete('/api/images/:filename', requireAuth, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'images', 'products', filename);

  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ success: true, message: 'Image deleted' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== START SERVER ====================

// Only start server if not running on Vercel (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🌞 SolarKits Admin Panel Server       ║
╠═══════════════════════════════════════════╣
║   Server running on port ${PORT}            ║
║   Main Site:  http://localhost:${PORT}/   ║
║   Admin Panel: http://localhost:${PORT}/admin ║
╚═══════════════════════════════════════════╝
    `);
  });
}

// Export for Vercel serverless functions
module.exports = app;
