# SolarKits Icon System

## Design Philosophy

The SolarKits icon system uses **clean, professional, minimal SVG icons** that convey trust and expertise in renewable energy. All icons follow a consistent style with:

- **Stroke-based design** (no filled icons)
- **2px stroke width** for consistency
- **24x24px base size** (scales to 32x32px for logos)
- **Professional, geometric shapes**
- **Solar/energy theme** where applicable

---

## Icon Library

### Primary Logo Icon
**Solar Panel Icon**
```svg
<svg class="logo__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M6 6h4v4H6zM14 6h4v4h-4zM6 12h4v4H6zM14 12h4v4h-4z"/>
</svg>
```
**Usage:** Logo (navigation, footer)
**Represents:** Solar panels, clean energy technology

---

### Functional Icons

#### Search Icon
```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
```
**Usage:** Search button
**Location:** Header navigation

#### Scroll to Top Icon
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```
**Usage:** Scroll to top button
**Location:** Bottom right of page

---

### Content Icons

#### Checkmark (Success/Completion)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="20 6 9 17 4 12"/>
</svg>
```
**Usage:** Lists, completed items
**Location:** About page "What We Do" section

#### Energy/Layers Icon
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>
```
**Usage:** Trust, transparency, stacked values
**Location:** About page values, disclaimer banner

#### Lightning Bolt (Energy/Speed)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
</svg>
```
**Usage:** Speed, performance, energy
**Location:** About page "Speed & Performance" value

#### Shield (Protection/Trust)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
</svg>
```
**Usage:** Sustainability, protection, reliability
**Location:** About page "Sustainable Future" value

#### Info/Alert Circle
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>
```
**Usage:** Information, expertise, alerts
**Location:** About page "Solar Expertise" value

#### Info Icon (Inverted)
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
</svg>
```
**Usage:** Disclaimers, important notices
**Location:** About page affiliate disclosure

#### Email/Contact Icon
```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
</svg>
```
**Usage:** Contact, questions, email
**Location:** Disclaimer page contact section

---

## Color System

### Icon Colors
- **Primary icons:** `var(--color-primary)` (#FF9800)
- **White icons:** `currentColor` on dark backgrounds
- **Warning icons:** `var(--color-warning)` (#FF9800)
- **Info icons:** `var(--color-info)` (#2196F3)

### CSS Implementation
```css
.logo__icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
  flex-shrink: 0;
}
```

---

## Usage Guidelines

### ✅ DO:
- Use stroke-based SVG icons
- Maintain 2px stroke width
- Keep icons at 24px or 32px size
- Use `flex-shrink: 0` to prevent squishing
- Use `currentColor` for inheriting colors
- Align with solar/energy theme

### ❌ DON'T:
- Use emojis (☀️, 📧, 🤝, ⚡, etc.)
- Use filled/solid icons
- Mix different icon styles
- Use animated icons
- Use childish or playful icons
- Exceed 32px size

---

## Adding New Icons

When adding new icons:

1. **Source:** Use professional icon libraries (Feather Icons, Lucide, Heroicons)
2. **Format:** SVG with stroke-based design
3. **Stroke width:** 2px
4. **Viewbox:** 24x24
5. **Color:** Use `currentColor` or CSS variables
6. **Test:** Ensure consistent visual weight

### Example Template:
```html
<svg width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2">
    <!-- Icon paths here -->
</svg>
```

---

## Icon Replacement Map

| Old (Emoji) | New (SVG) | Usage |
|------------|-----------|--------|
| ☀️ | Solar panel | Logo |
| ℹ️ | Info circle | Disclaimers |
| 📧 | Email envelope | Contact |
| 🤝 | Layers/trust | Values |
| ⚡ | Lightning bolt | Speed/energy |
| 💎 | Info circle | Expertise |
| 🌱 | Shield | Sustainability |
| ✓ | Checkmark | Lists |

---

## File Locations

All icon implementations are in:
- `index.html` (logo, search, scroll-to-top, disclaimer)
- `pages/about.html` (logo, values icons, lists)
- `pages/contact.html` (logo)
- `pages/disclaimer.html` (logo, contact icon)

---

## Related Files
- `css/styles.css` - Icon styling
- `CLAUDE.md` - Design documentation
- `PLANNING.md` - Visual design strategy
- `TASK.md` - Design implementation tasks

---

*Last Updated: October 3, 2025*
*Design System Version: 2.0 - Professional Icons*
