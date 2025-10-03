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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

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
app.post('/api/login', (req, res) => {
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
