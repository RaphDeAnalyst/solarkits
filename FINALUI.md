# Design & Layout Alignment Prompt

Please perform the following using Playwright and your agent capabilities:

## 1. Extract style + layout from reference site

- Open **https://www.sunrun.com/** via Playwright.  
- Inspect and capture:
  - Full color scheme: primary, secondary, accent, background, text colors.
  - Typography: font families, sizes, weights, line heights.
  - Spacing and layout: margins, padding, grid gaps, container widths.
  - Major structural elements: header, footer, nav, cards, buttons, forms.

- Then open **https://www.sunrun.com/go-solar-center/solar-articles/what-homeowners-need-to-know-about-uninterruptible-power-supply** via Playwright.  
- Capture the blog/article layout:
  - Hero image + title placement.
  - Sectioning: how content is broken into headings, subheadings, paragraphs.
  - Sidebar or related content areas.
  - Footer or post metadata (author, date, tags, share links).

## 2. Apply styles + layout to your project

- Open **http://localhost:3000** (your dev site) via Playwright.  
- Implement:
  - The extracted color scheme (buttons, backgrounds, text, accents).
  - Typography and line spacing rules.
  - Spacing, margins, grid layout, and container structure.
  - Blog post layout (for your new blog page): hero + image + title, section layout, metadata, share links — matching the Sunrun article’s format.

## 3. Verify and report mismatches

- After implementing changes, run Playwright checks again:
  - Compare style/layout of localhost vs Sunrun home & article pages (side-by-side screenshots).
  - Highlight mismatches (colors off, spacing off, element differences).
  - Output a TODO list of remaining changes to align your site with the reference.

## Constraints & clarifications

- Do **not** copy images, logos, copyright content, or branded assets.  
- Use the reference site only for **style, layout, and structure inspiration**, not content duplication.  
- Preserve your own content, affiliate product links, and site logic.  
- Provide a final summary with screenshot evidence and a list of required adjustments.
