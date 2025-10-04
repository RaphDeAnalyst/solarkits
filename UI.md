# Visual Development & Design Alignment

goal:
  - Apply the **color palette, typography, spacing, and UI design system** of https://www.sunrun.com/ across the entire site.
  - For the **blog page only**, use the **layout and card arrangement** from https://us.sunpower.com/blog as the structural reference.

workflow:
  - open design_reference: https://www.sunrun.com/ with Playwright
  - open blog_layout_reference: https://us.sunpower.com/blog with Playwright
  - open local_site: http://localhost:3000 with Playwright

  - capture screenshots at breakpoints:
      - mobile: 375px
      - tablet: 768px
      - desktop: 1200px

  - extract & compare:
      - From Sunrun: colors, typography, spacing, buttons, navbars, footers, global UI polish.
      - From sunpower Blog: blog card grid (2-column on desktop, stacked on mobile), featured images, metadata placement (date, category, author), padding/margin between cards.

  - tasks:
      - Align **global site styles** (colors, fonts, spacing) with Sunrun’s design system.
      - For `/blog` page:
          - Implement a responsive card grid similar to sunpower’s:
              - Desktop: 2–3 columns with consistent card height and spacing.
              - Tablet: 2 columns.
              - Mobile: 1 column stacked cards.
          - Each blog card should include featured image, title, metadata, and excerpt like sunpower.
      - Produce a TODO list of CSS / component updates for the blog page.

constraints:
  - Do **not** copy images, branding, or logos.
  - Use sunpower blog only for **layout inspiration** (card arrangement and spacing).
  - Keep content structure consistent with my own site’s blog data.
