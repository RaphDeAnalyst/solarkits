# How to Add Affiliate Links

## Quick Reference Guide

### Amazon Associates Link Format
```
https://amazon.com/dp/PRODUCT-ID?tag=YOUR-TAG-20
```

### AliExpress Affiliate Link Format
```
https://s.click.aliexpress.com/e/_YOUR-TRACKING-CODE
```

---

## Step-by-Step Process

### 1. Get Your Affiliate Tags

#### Amazon Associates
- Login: https://affiliate-program.amazon.com
- Find your tag in: **Account Settings** → **Manage Your Tracking IDs**
- Format: `yourname-20`

#### AliExpress
- Login: https://portals.aliexpress.com
- Use: **Links** → **Deeplink Generator**

---

### 2. Find Products & Generate Links

#### Amazon Method 1: SiteStripe (Easiest)
1. Browse Amazon while logged into Associates
2. SiteStripe toolbar appears at top
3. Click **Get Link** → Copy **Full Link**

#### Amazon Method 2: Manual
1. Find product on Amazon
2. Copy ASIN (found in product details)
3. Create link: `https://amazon.com/dp/ASIN?tag=yourname-20`

#### AliExpress Method
1. Find product on AliExpress
2. Copy product URL
3. Go to affiliate dashboard → **Deeplink Generator**
4. Paste URL → Generate → Copy affiliate link

---

### 3. Update products.json

Replace placeholder URLs with real affiliate links:

**Example Solar Kit:**
```json
{
  "id": "sk-001",
  "name": "100W Solar Panel Kit",
  "affiliates": {
    "amazon": {
      "url": "https://amazon.com/dp/B08XYZABC?tag=yourname-20",
      "available": true
    },
    "aliexpress": {
      "url": "https://s.click.aliexpress.com/e/_ABC123",
      "available": true
    }
  }
}
```

**If product not available on one platform:**
```json
"aliexpress": {
  "url": "",
  "available": false
}
```

---

### 4. Update Product Images

Replace placeholder images with real product images:

```json
"image": {
  "thumb": "https://your-cdn.com/images/solar-panel-thumb.jpg",
  "full": "https://your-cdn.com/images/solar-panel-full.jpg"
}
```

**Image Sources:**
- Download from product pages
- Use Amazon/AliExpress product images
- Optimize with: TinyPNG, Squoosh, or ImageOptim
- Upload to: Your own hosting, Cloudinary, or ImgBB

---

### 5. Bulk Update Template

Use this template for each product:

```json
{
  "id": "UNIQUE-ID",
  "name": "PRODUCT NAME",
  "category": "solar-kits|solar-accessories|home-energy|outdoor-solar",
  "tags": ["tag1", "tag2"],
  "image": {
    "thumb": "IMAGE-URL-400x300",
    "full": "IMAGE-URL-800x600"
  },
  "price": {
    "amount": 99.99,
    "currency": "USD",
    "display": "Starting at $99"
  },
  "affiliates": {
    "amazon": {
      "url": "AMAZON-AFFILIATE-LINK",
      "available": true
    },
    "aliexpress": {
      "url": "ALIEXPRESS-AFFILIATE-LINK",
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

---

## Testing Your Links

### Before Going Live:

1. **Test Each Link:**
   - Click Amazon link → Verify your tag appears in URL
   - Click AliExpress link → Verify tracking works

2. **Check Affiliate Dashboard:**
   - Amazon: View clicks in **Reports** tab
   - AliExpress: Check **Statistics** for tracking

3. **Validate Format:**
   - Amazon links must include `?tag=yourname-20`
   - AliExpress links should be shortened tracking links

---

## Tools & Resources

### Link Generators
- **Amazon Associates**: https://affiliate-program.amazon.com/home/tools
- **AliExpress**: https://portals.aliexpress.com/links/deeplink

### Link Checkers
- Test your links open correctly
- Check affiliate tags are present
- Verify redirects work

### Browser Extensions
- **Amazon Associates SiteStripe** (built-in when logged in)
- **AliExpress Affiliate Helper** (Chrome/Firefox)

---

## Common Issues & Solutions

### Problem: Links don't include affiliate tag
**Solution:**
- Amazon: Make sure to use `?tag=yourname-20`
- AliExpress: Always use generated deeplinks, not direct URLs

### Problem: Product unavailable
**Solution:**
```json
"available": false
```

### Problem: Want to update all links later
**Solution:** Just edit `data/products.json` - changes appear immediately

---

## Best Practices

✅ **DO:**
- Always test links before publishing
- Use deep links (direct to product)
- Keep affiliate tags consistent
- Update products.json regularly
- Track performance in dashboards

❌ **DON'T:**
- Share raw affiliate URLs publicly (they can be hijacked)
- Use expired product links
- Forget to add `rel="noopener noreferrer"` (already in code)
- Mix up Amazon and AliExpress links

---

## Quick Start Checklist

- [ ] Get Amazon Associate tag
- [ ] Get AliExpress affiliate account
- [ ] Find 10 solar products on each platform
- [ ] Generate affiliate links
- [ ] Update products.json
- [ ] Replace placeholder images
- [ ] Test all links
- [ ] Deploy to live site
- [ ] Monitor affiliate dashboards

---

*Need help? Check the platform documentation:*
- Amazon: https://affiliate-program.amazon.com/help
- AliExpress: https://portals.aliexpress.com/help
