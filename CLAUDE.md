# CLAUDE.md - Solarkits Project Guide

 Always read PLANNING.md at the start of every new conversation, check TASKS.md before starting your work, mark completed tasks to TASKS.md immediately, and add newly discovered tasks to TASKS.md when found.

## Project Context
You are assisting with the development of **solarkits**, a solar energy affiliate website specializing in solar kits, batteries, inverters, and home energy solutions. This document provides essential context for all code generation and development discussions.

## Quick Reference
- **Project Name:** solarkits
- **Type:** Solar energy affiliate website
- **Focus:** Solar kits, panels, batteries, inverters, home energy solutions
- **Primary Platforms:** Amazon & AliExpress affiliates
- **Tech Stack:** HTML5, CSS3, Vanilla JavaScript
- **Hosting:** Static (Netlify/Vercel/GitHub Pages)
- **Design Philosophy:** Clean, fast, trustworthy, mobile-first

## Core Product Vision
Solarkits is a dedicated solar energy platform that helps customers discover affordable and reliable solar products. The site focuses exclusively on solar kits, accessories, home energy solutions, and outdoor solar products. We generate revenue through affiliate commissions while providing value to users through expert curation of quality solar products.

## Key Development Principles

### 1. Performance First
- Target load time: < 2 seconds
- Optimize all images before use
- Minimize JavaScript dependencies
- Use lazy loading for product images
- Implement efficient CSS with minimal bloat

### 2. Mobile-First Responsive Design
- Start with mobile layout (1-2 products per row)
- Scale up to desktop (3 products per row)
- Touch-friendly buttons and navigation
- Readable typography at all sizes

### 3. Trust & Transparency
- Always include affiliate disclaimer
- Clear, honest product descriptions
- Professional, clean design
- No misleading CTAs or dark patterns

## Technical Specifications

### File Structure
```
solarkits/
├── index.html
├── css/
│   ├── styles.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── search.js
│   └── products.js
├── images/
│   ├── products/
│   └── site/
├── pages/
│   ├── about.html
│   ├── contact.html
│   └── disclaimer.html
└── data/
    └── products.json
```

### Design System

#### Colors
- **Primary Background:** #FFFFFF (white)
- **Text:** #333333 (dark gray)
- **Primary Accent:** #FF9800 (Orange - solar theme)
- **Secondary Accent:** #4CAF50 (Green - sustainability)
- **CTA Buttons:**
  - Amazon: #FF9900
  - AliExpress: #E52B50

#### Typography
- **Font Family:** 'Poppins' (Google Fonts)
- **Headers:** Bold, 1.5-2.5rem
- **Body:** Regular, 1rem
- **Product Names:** Semi-bold, 1.1rem

#### Icon System
- **Style:** Professional stroke-based SVG icons (NO emojis)
- **Stroke Width:** 2px consistent
- **Size:** 24px standard, 32px for logos
- **Theme:** Solar panels, energy, clean tech
- **Primary Logo:** Solar panel SVG icon
- **See:** ICON_SYSTEM.md for complete documentation

#### Component Patterns
- **Cards:** Rounded corners (8px), subtle shadow
- **Buttons:** Rounded (4px), hover effects
- **Grid:** CSS Grid or Flexbox
- **Spacing:** Consistent 1rem/2rem padding

### Product Card Template
```html
<div class="product-card">
    <img src="[image]" alt="[product-name]" loading="lazy">
    <h3>[Product Name]</h3>
    <p class="price">Starting at $[XX]</p>
    <div class="cta-buttons">
        <a href="[amazon-link]" class="btn btn-amazon" target="_blank" rel="noopener">
            Buy on Amazon
        </a>
        <a href="[aliexpress-link]" class="btn btn-aliexpress" target="_blank" rel="noopener">
            Buy on AliExpress
        </a>
    </div>
</div>
```

### Categories Structure
1. **Solar Kits** - Complete home & business solar power systems
2. **Solar Accessories** - Batteries, inverters, charge controllers, cables, connectors
3. **Home Energy Solutions** - Solar lamps, fans, pumps, appliances
4. **Outdoor Solar** - Garden lights, camping kits, portable chargers, off-grid gear

### JavaScript Functionality
- **Search:** Client-side filtering of products
- **Category Filter:** Show/hide products by category
- **Lazy Loading:** Load images as user scrolls
- **Analytics:** Track affiliate link clicks (future)

## Content Guidelines

### Product Selection Criteria
- Solar-specific products only (panels, kits, batteries, inverters, accessories)
- High ratings (4+ stars preferred)
- Good commission rates
- Proven reliability and efficiency
- Verified seller reliability
- Clear product specifications and images

### SEO Considerations
- Descriptive page titles
- Meta descriptions for all pages
- Alt text for all images
- Semantic HTML structure
- Clean URL structure
- Schema markup for products (future)

## Compliance Requirements

### Affiliate Disclaimer
Must be visible on:
- Footer of every page
- Dedicated disclaimer page
- Near product listings

Sample text:
> "As an Amazon Associate and AliExpress affiliate, we earn from qualifying purchases. Price and availability information is accurate as of the date/time indicated and may change."

### Legal Compliance
- FTC disclosure requirements
- Amazon Associates terms
- AliExpress affiliate terms
- GDPR/Privacy considerations (if applicable)

## Development Phases

### Phase 1: MVP (Current)
- [ ] Basic site structure
- [ ] 20-30 initial products
- [ ] Core pages (Home, About, Contact, Disclaimer)
- [ ] Mobile-responsive design
- [ ] Manual product updates

### Phase 2: Enhancement
- [ ] 100+ products
- [ ] Advanced search/filter
- [ ] Newsletter integration
- [ ] Basic analytics

### Phase 3: Automation
- [ ] API integration
- [ ] Auto-price updates
- [ ] Admin dashboard
- [ ] User wishlists

## Code Generation Instructions

When generating code for this project:

1. **Always use semantic HTML5**
2. **Implement mobile-first CSS**
3. **Keep JavaScript vanilla unless specifically asked**
4. **Include comments for complex logic**
5. **Follow accessibility best practices**
6. **Optimize for performance**
7. **Include affiliate disclaimers in generated pages**
8. **Use placeholder affiliate links (replace with actual later)**

## Testing Checklist
- [ ] Page loads < 2 seconds
- [ ] Mobile responsive (320px - 1920px)
- [ ] All affiliate links work
- [ ] Search function filters correctly
- [ ] Images load properly
- [ ] Disclaimer visible
- [ ] Cross-browser compatible

## Success Metrics Tracking
1. **Performance:** Load time consistently < 2s
2. **Content:** 100+ products within 3 months
3. **Revenue:** First commission within 30 days
4. **Engagement:** Monitor CTR on affiliate buttons
5. **SEO:** Track organic traffic growth

## Common Commands/Requests

### For Claude Sessions:
- "Generate a product grid component"
- "Create a responsive navigation menu"
- "Build a search function for products"
- "Optimize images for web performance"
- "Create SEO-friendly product pages"
- "Generate sample product data JSON"
- "Build affiliate link tracking system"

## Important Reminders
- **Brand name is "solarkits" but products are diverse**
- **User trust is paramount - no deceptive practices**
- **Performance affects both UX and SEO**
- **Mobile users are likely majority of traffic**
- **Affiliate compliance is non-negotiable**
- **Start simple, iterate based on data**

---

*This document should be referenced at the start of each development session to maintain consistency and alignment with project goals.*