# Design System Document: The Scholarly Minimalist

## 1. Overview & Creative North Star: "The Digital Curator"
The Creative North Star for this design system is **"The Digital Curator."** In a world of cluttered EdTech platforms, we reject the "dashboard-of-widgets" aesthetic. Instead, we treat educational content with the reverence of a high-end editorial publication. 

This system moves beyond standard SaaS layouts by utilizing **Intentional Asymmetry** and **Tonal Depth**. We break the rigid grid by allowing hero elements to bleed into margins and using typography scales that create a rhythmic, melodic hierarchy. The goal is a "Quiet Authority"—a UI that feels structured and usable, yet possesses a soul through sophisticated layering and expansive white space.

---

## 2. Colors & Surface Architecture
We utilize a spectrum of deep blues and soft greys to establish trust and cognitive ease.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for secondary sections sitting on a `surface` background. This creates a "seamless" interface that feels modern and expansive.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper or frosted glass.
*   **Level 0 (Foundation):** `surface` (#f7f9fb) – The base canvas.
*   **Level 1 (Sub-section):** `surface-container-low` (#f2f4f6) – Used for sidebar backgrounds or grouped content areas.
*   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) – Use this for primary content cards to make them "pop" against the grey background.
*   **Level 3 (Interactive Elements):** `surface-container-highest` (#e0e3e5) – Reserved for hover states or inactive input fields.

### The "Glass & Gradient" Rule
To elevate the "SaaS" feel, floating elements (like navigation bars or modal headers) should use **Glassmorphism**:
*   **Fill:** `surface` at 80% opacity.
*   **Effect:** Backdrop-blur (12px to 20px).
*   **Signature Texture:** Main CTAs should not be flat. Use a subtle linear gradient (45°) transitioning from `on-primary-container` (#497cff) to `surface-tint` (#0053db) to provide a "liquid" depth.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headline) with **Inter** (Body/Labels) to balance character with legibility.

*   **Display (Manrope):** High-contrast sizing (e.g., `display-lg` at 3.5rem) should be used for course titles or progress milestones, creating an "Editorial" impact.
*   **Body (Inter):** All instructional text uses `body-md` (0.875rem) with a generous line-height (1.6) to prevent eye strain during long reading sessions.
*   **Labels (Inter):** Micro-copy uses `label-sm` (0.6875rem) in `on-surface-variant` to maintain a clean, metadata-focused aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are a fallback, not a first choice. We achieve hierarchy through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The subtle delta in hex values creates a natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a "Start Lesson" button), use a shadow with a 24px blur, 0px spread, and 6% opacity. The shadow color must be a tinted version of `on-surface` (#191c1e), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#c6c6cd) at 15% opacity. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons & Chips
*   **Primary Action:** Gradient fill (Primary to Surface-Tint), `xl` roundedness (0.75rem). No border.
*   **Secondary Action:** `surface-container-high` background with `on-primary-fixed-variant` text.
*   **Chips:** Use `secondary-container` (#86f2e4) for "In Progress" states and `tertiary-fixed` (#e2dfff) for "Completed." Roundedness should be `full` (9999px) for a soft, pill-shaped feel.

### Input Fields
*   **Default State:** Background `surface-container-low`, border `none`.
*   **Active State:** Background `surface-container-lowest`, "Ghost Border" (15% `outline-variant`), and a 2px left-accent of `surface-tint`.

### Learning Cards & Lists
*   **Forbid Dividers:** Do not use horizontal lines between list items. Instead, use `spacing-4` (1.4rem) of vertical white space or alternating backgrounds of `surface` and `surface-container-low`.
*   **Progress Indicators:** Use a `secondary` (#006a61) track with a soft `surface-variant` background.

### Contextual Components
*   **The "Focus Mode" Overlay:** A full-screen `surface` container with 95% opacity and a high backdrop-blur, used when a student enters a quiz to remove all UI "noise."

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetric Padding:** Allow lesson content to have 20% more padding on the left than the right to create an editorial, "book-like" feel.
*   **Embrace White Space:** If you think there is enough space, add 20% more. Space is the luxury of this system.
*   **Leverage Color Tokens:** Use `on-secondary-container` (#006f66) for success messages to maintain the professional teal-indigo palette.

### Don't:
*   **Don't use 100% Black:** Even for dark mode, the darkest background should be `inverse-surface` (#2d3133) to maintain "inkiness" rather than "void."
*   **Don't use "Default" Shadows:** Avoid the Figma/Sketch default drop shadows. They look "cheap" and break the curated aesthetic.
*   **Don't over-decorate:** Avoid icons for the sake of icons. Use them only as functional signposts.