# ☀️ Solarkits - Solar Energy Solutions

A modern, high-performance solar energy affiliate website showcasing curated solar kits, batteries, inverters, and home energy solutions from Amazon and AliExpress.

## 🚀 Features

- **Lightning Fast** - Optimized for sub-2-second load times
- **Mobile-First Design** - Fully responsive across all devices
- **Solar Categories** - Solar Kits, Accessories, Home Energy, Outdoor Solar
- **Smart Search** - Real-time solar product filtering and search
- **Affiliate Integration** - Amazon Associates & AliExpress affiliate links
- **SEO Optimized** - Solar energy keywords, semantic HTML, performance-focused
- **Clean UI/UX** - Modern solar-themed design with smooth animations

## 📁 Project Structure

```
solarkits/
├── index.html              # Main homepage
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── main.js            # Core functionality
│   ├── products.js        # Product management
│   └── search.js          # Search functionality
├── images/
│   ├── products/          # Product images
│   └── site/              # Site assets
├── pages/
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   └── disclaimer.html    # Affiliate disclaimer
├── data/
│   └── products.json      # Product catalog
├── CLAUDE.md              # AI assistant context
├── PLANNING.md            # Strategic planning
└── TASK.md                # Development tasks
```

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Fonts:** Google Fonts (Poppins)
- **Hosting:** Netlify/Vercel compatible
- **CDN Ready:** CloudFlare compatible

## 📦 Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/solarkits.git
   cd solarkits
   ```

2. **Open with a local server**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server

   # Using VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **View in browser**
   ```
   http://localhost:8000
   ```

## 🌐 Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Build settings: None required (static site)
3. Publish directory: `/` (root)
4. Deploy!

### Vercel

1. Import your GitHub repository
2. Framework Preset: Other
3. Root Directory: `./`
4. Deploy!

### GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `(root)`
4. Save

## 📝 Adding Products

Edit `data/products.json` to add new products:

```json
{
  "id": "unique-id",
  "name": "Solar Product Name",
  "category": "solar-kits",
  "tags": ["home-system", "off-grid"],
  "image": {
    "thumb": "image-url",
    "full": "image-url"
  },
  "price": {
    "amount": 99.99,
    "currency": "USD",
    "display": "Starting at $99.99"
  },
  "affiliates": {
    "amazon": {
      "url": "affiliate-link",
      "available": true
    },
    "aliexpress": {
      "url": "affiliate-link",
      "available": true
    }
  },
  "metadata": {
    "dateAdded": "2025-10-03",
    "lastUpdated": "2025-10-03",
    "clicks": 0,
    "featured": false
  }
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `css/styles.css`:

```css
:root {
  --color-primary: #FF9800;
  --color-secondary: #4CAF50;
  --color-accent: #FFC107;
  /* ... */
}
```

### Categories

Solar product categories:
- **solar-kits** - Complete home & business solar systems
- **solar-accessories** - Batteries, inverters, controllers, cables
- **home-energy** - Solar lamps, fans, pumps, appliances
- **outdoor-solar** - Garden lights, camping gear, portable chargers

Update in:
- `index.html` (Category buttons)
- `js/products.js` (getCategoryName function)
- `data/products.json` (Product categories)

## 🔧 Configuration

### Affiliate Links

1. Sign up for affiliate programs:
   - [Amazon Associates](https://affiliate-program.amazon.com)
   - [AliExpress Affiliates](https://portals.aliexpress.com)

2. Replace placeholder links in `data/products.json` with your affiliate links

### Analytics

Add your Google Analytics ID in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## ⚡ Performance

Current performance targets:
- Load time: < 2 seconds
- Lighthouse score: > 90
- Mobile-friendly: Yes
- SEO score: > 95

### Optimization Checklist

- ✅ Minified CSS/JS
- ✅ Lazy loading images
- ✅ CDN delivery
- ✅ Responsive images
- ✅ Optimized fonts
- ✅ Efficient caching

## 📄 Legal & Compliance

- ✅ Affiliate disclosure on all pages
- ✅ FTC compliant disclaimers
- ✅ Privacy policy (create before launch)
- ✅ Terms of service (create before launch)
- ✅ Cookie consent (if needed)

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss proposed changes.

## 📊 Roadmap

### Phase 1 - MVP ✅
- [x] Basic site structure
- [x] Solar product display system
- [x] Search & filter functionality
- [x] Responsive design
- [x] Initial solar products (16)

### Phase 2 - Enhancement
- [ ] Add 100+ solar products
- [ ] Newsletter integration (solar tips & deals)
- [ ] Advanced filters (wattage, voltage, capacity)
- [ ] Solar product comparison feature
- [ ] Solar education blog section

### Phase 3 - Automation & Tools
- [ ] API integration (Amazon/AliExpress)
- [ ] Automated price updates
- [ ] Solar system sizing calculator
- [ ] Energy savings calculator
- [ ] Admin dashboard

## 📞 Contact

- Website: [solarkits.com](https://solarkits.com)
- Email: contact@solarkits.com
- Issues: [GitHub Issues](https://github.com/yourusername/solarkits/issues)

## 📜 License

This project is for educational and commercial use. Please ensure compliance with affiliate program terms of service.

## 🙏 Acknowledgments

- Amazon Associates Program
- AliExpress Affiliate Program
- Google Fonts
- Solar energy community
- Placeholder image services

---

**Built with ☀️ for a sustainable future**

*Powering homes and lives with clean, reliable solar energy*

*Last Updated: October 3, 2025*
