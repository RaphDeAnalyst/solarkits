Improved Prompt for Claude Code

System / Developer Instruction:
You are an expert full-stack web developer experienced in SEO optimization, Playwright automation, responsive design, and code refactoring. Your task is to refactor and enhance an existing website according to the following specifications.

🧩 Task Overview

Refactor and improve the website with a focus on SEO-friendly URLs, consistent visuals, and optimized blog content behavior.

✅ Requirements
1. SEO-Friendly URL Refactor

Remove /pages/ from all URLs.

Remove .html extensions.

Use lowercase letters and hyphens for multi-word URLs.

Update routes as follows:

Blog listing page → /blog

Single blog posts → /blog/[slug]

Product pages → /products/[slug]

Update internal links, sitemap, and navigation accordingly.

Add 301 redirects from old URLs to new ones to preserve SEO ranking.

2. Optimize Blog Images

Automatically resize or constrain both featured images and inline (body) images to a consistent size on upload or render.

Ensure the dimensions match standard blog image ratios (e.g., Medium-style layout).

Maintain visual quality while minimizing file size for performance.

3. Brand Consistency

Ensure the logo and favicon appear correctly across all pages (main site and admin dashboard).

4. Admin UI Update

Change the background color of the admin login page from purple to gray (#f0f0f0 or similar neutral tone).

5. Default Featured Image Sizing

Use Playwright to open:
https://www.sunrun.com/go-solar-center/solar-articles/what-homeowners-need-to-know-about-uninterruptible-power-supply
Extract the featured image size used on that page.

Apply that size as the default featured image dimension for all blog posts.

Set inline images to a standard height consistent with modern blogging platforms (e.g., Medium).

6. Blog Post Loading Issue

When opening a blog post, the template preview image (C:\Users\rapha\Desktop\solarkits\blogtemplate.pngblogtemplate.png) currently appears before the actual content.

Ensure the page bypasses or removes this placeholder and directly loads the intended blog content.

⚙️ Deliverables

Updated code snippets or full component files for all affected parts.

Description of where each modification was made (files, lines, or components).

Brief summary of SEO and performance improvements after changes.

💬 Notes

If any configuration or framework-specific assumptions are required (e.g., Next.js, Nuxt, or static site generator), state them clearly before implementation.