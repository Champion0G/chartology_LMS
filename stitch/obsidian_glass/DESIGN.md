# Design System Specification: The Scholarly Precision Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Observatory"**

This design system is built to transcend the standard "Learning Management System" aesthetic. We are moving away from the cluttered, boxy layouts of traditional education platforms and toward a high-end, editorial experience that feels like a premium financial terminal crossed with a sophisticated digital library.

The "Digital Observatory" concept relies on **Atmospheric Depth**. By utilizing high-blur glassmorphism and intentional asymmetry, we create a sense of looking through a lens. We avoid rigid grids in favor of "floating" modularity, where information feels curated rather than just displayed. The brand personality—sophisticated and high-trust—is reinforced by an expansive use of white space (or "dark space" in this context) and authoritative, oversized typography.

---

## 2. Colors & Surface Philosophy
The palette is a study in deep-sea tonality, using `surface` (`#0b1326`) as our infinite canvas.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this system, explicit 1px solid lines are prohibited for sectioning. Boundaries must be defined through:
1.  **Background Shifts:** Placing a `surface_container_low` card on a `surface` background.
2.  **Tonal Transitions:** Using the hierarchy of `surface_container` tiers to denote importance.
3.  **Soft Light:** Using the `outline_variant` at 10% opacity only when absolutely necessary for accessibility.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted material.
*   **Base:** `surface` (#0b1326) - The foundation.
*   **Low Importance:** `surface_container_low` (#131b2e) - Secondary sidebar or background panels.
*   **Medium Importance:** `surface_container` (#171f33) - Main content areas.
*   **High Importance:** `surface_container_highest` (#2d3449) - Active state cards or focused modals.

### The "Glass & Gradient" Rule
To achieve the "Ultra-Premium" feel, use **Glassmorphism** for all floating UI elements (Modals, Hover Tooltips, Navigation Bars).
*   **Recipe:** `surface_variant` at 40% opacity + `backdrop-filter: blur(24px)`.
*   **Signature Gradients:** Headers and primary CTAs should utilize a transition from `primary` (`#adc6ff`) to `secondary` (`#d0bcff`) to create a "vibrant chrome" effect that feels tech-forward.

---

## 3. Typography
We utilize a dual-typeface system to balance scholarly authority with technical precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity. Use `display-lg` (3.5rem) with `-0.04em` letter spacing for hero sections. Headlines should always use the "Gradient Text" effect (Primary to Secondary) to draw the eye.
*   **Titles & Body (Inter):** The workhorse. Inter provides maximum legibility for complex course data.
    *   **Body-lg:** Used for instructional content; ensure a line-height of 1.6 for readability.
    *   **Label-sm:** Use for "Metadata" (e.g., "Course Duration") with `0.05em` tracking and All-Caps to signify a scholarly, indexed look.

---

## 4. Elevation & Depth
Hierarchy is conveyed through **Tonal Layering** and **Ambient Shadows**, never through structural rigidity.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft "recessed" look. To "lift" an object, move up the surface scale rather than adding a stroke.
*   **Ambient Shadows:** For floating glass cards, use a shadow with a blur radius of `40px` and an opacity of 6%, using the color `on_primary_fixed` (#001a42). This mimics a soft glow rather than a harsh drop shadow.
*   **Ghost Borders:** If a container requires definition against a similar background, use a 1px border of `outline_variant` (#45464d) set to 15% opacity.

---

## 5. Components

### The Crosshair Cursor (Desktop Only)
To lean into the "Chartology" name, the standard cursor is replaced by a specialized "Precision Crosshair" when hovering over interactive content or data visualizations.
*   **Visual:** Two perpendicular 1px lines (`primary` at 40% opacity) that extend 20px from a center 4px dot.
*   **Logic:** The crosshair snaps subtly to the nearest data point or grid line, providing a tactile, high-instrument feel.

### Buttons
*   **Primary:** A gradient fill (`primary` to `secondary`) with `on_primary_fixed` text. Roundedness: `md` (0.75rem).
*   **Secondary (Glass):** `surface_variant` at 20% opacity with a `backdrop-blur`. No fill.
*   **Interaction:** On hover, the `surface_tint` should create a subtle outer glow.

### Glassmorphic Cards
*   **Style:** No borders. Background: `surface_container_high` at 60% opacity.
*   **Separation:** Forbid dividers. Use Spacing `8` (2.75rem) to separate content blocks within the card.

### Input Fields
*   **State:** Default state is `surface_container_lowest` with a "Ghost Border."
*   **Active:** The border transitions to a 1px `primary` solid, and the background blurs slightly. Text remains `on_surface`.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. For example, a `display-lg` header justified left with a `body-md` description offset to the right.
*   **Do** use the Spacing Scale religiously. Consistent use of `Spacing 6` (2rem) and `Spacing 10` (3.5rem) creates the "Premium" breathing room.
*   **Do** treat data as art. Charts should use `primary`, `secondary`, and `tertiary` tokens with soft, rounded line joins.

### Don't
*   **Don't** use 100% opaque black or grey for shadows. Always tint shadows with the background hue.
*   **Don't** use dividers or lines to separate list items. Use a background shift to `surface_container_low` on hover instead.
*   **Don't** use standard "Success Green" or "Warning Yellow" unless they are adjusted to match the neon-vibrant tone of the palette (use `tertiary` for accents instead).
*   **Don't** crowd the screen. If a page feels "busy," increase the spacing to the next tier in the scale (`16` or `20`).

---

## 7. Interaction States
*   **Hover:** Elements should not just "change color." They should "glow" or "lift." Use `surface_bright` to indicate an active hover state.
*   **Transition:** All state changes must use a `300ms cubic-bezier(0.4, 0, 0.2, 1)` transition to feel smooth and intentional, never "snappy" or jarring.