# Design System: Rugged Coastal Professional

## 1. Overview & Creative North Star

### Creative North Star: "The Coastal Monolith"
This design system is built to reflect the enduring, weathered beauty of the Oregon Coast. It moves away from the "disposable" feel of modern web templates toward a philosophy of **Organic Structuralism**. The goal is to balance the utility of a professional directory with the soul of an editorial travel journal. 

Rather than relying on standard grids and loud UI flourishes, we embrace intentional asymmetry, heavy-weight editorial headers, and layered surfaces. The experience should feel like a high-end field guide: structured enough to be authoritative, but organic enough to feel locally-informed. We break the "template" look by using substantial white space (the "mist"), overlapping elements that mimic the coastline's rugged layers, and high-contrast typography scales that command attention.

---

## 2. Colors

The palette is a direct translation of the Pacific Northwest shoreline—misty, deep, and grounded.

### Surface Hierarchy & Nesting
We do not use flat backgrounds. Depth is achieved through a "Stacked Paper" metaphor using the surface-container tiers:
*   **Base Layer:** `surface` (#f4fafe) serves as our "misty sky" canvas.
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries are defined by shifting from `surface` to `surface_container_low` (#eef5f8).
*   **Nesting:** A directory card (`surface_container_lowest`) should sit atop a `surface_container` section. This creates a tactile, physical lift that feels premium and architectural.

### Signature Textures & Gradients
*   **The Driftwood Gradient:** For primary CTAs and hero headers, use a subtle linear gradient transitioning from `primary` (#07343e) to `primary_container` (#244b55) at a 135-degree angle. This adds a "soulful" depth that flat hex codes lack.
*   **Glassmorphism:** For floating navigation or search modules, use `surface_container_low` at 85% opacity with a `20px` backdrop-blur. This simulates the look of sea glass, allowing the rich imagery of the Oregon coast to bleed through the UI subtly.

---

## 3. Typography

The typography strategy pairs the structural reliability of a clean sans-serif with the storytelling authority of a sturdy serif.

*   **Editorial Headings (Instrument):** Used for `display` and `headline` scales. This serif is our "voice." It is intentional, slightly academic, and deeply rugged. Use `regular-400` (3.5rem) with tight letter-spacing for high-impact travel stories.
*   **Utility & Navigation (Instrument):** Used for `title`, `body`, and `label` scales. A modern sans-serif that ensures high readability for directory listings and technical data.
*   **Hierarchy Note:** Always lead with a Instrument headline to ground the page in editorial quality, then transition to Instrument for the "workhorse" information.

---

## 4. Elevation & Depth

We reject the "floating" shadow-heavy look of standard Material Design. Instead, we use **Tonal Layering**.

*   **Ambient Shadows:** If an element must float (like a persistent search bar), use a shadow tinted with `on_surface` (#161d1f).
    *   *Shadow Recipe:* `0px 12px 32px rgba(22, 29, 31, 0.06)`. It should feel like a soft, natural shadow on a cloudy day.
*   **The "Ghost Border" Fallback:** In high-density data areas where separation is required, use the `outline_variant` (#c1c7ca) but cap opacity at 20%. This provides a structural hint without cluttering the visual field.
*   **Rugged Corners:** Use the `md` (0.375rem) or `DEFAULT` (0.25rem) corner scale. Avoid `full` or `xl` rounds; the coast is made of basalt and cliffs, not pebbles. The UI should feel "grounded."

---

## 5. Components

### Search Modules (The Portal)
The central directory tool. Use a `surface_container_lowest` background with a `Ghost Border`. Incorporate `Newsreader` for the prompt ("Find your path...") and `Manrope` for the input text.

### Buttons (The Beacon)
*   **Primary:** Uses the "Driftwood Gradient" (`primary` to `primary_container`). `label-md` uppercase for the text. 
*   **Secondary:** `outline` (#72787a) ghost border with `on_surface` text.
*   **Shape:** Stick to `DEFAULT` (0.25rem) rounding for a professional, sturdy feel.

### Cards & Lists (The Directory)
*   **Constraint:** Zero divider lines. Use `surface_container_low` backgrounds to group related content.
*   **Editorial Overlays:** For travel stories, use large-scale imagery with `Newsreader` headlines overlapping the edge of the image container to break the rigid grid.

### Input Fields
*   **State:** Use `surface_container_highest` for the active background state. 
*   **Error:** Instead of a bright red box, use a 2px left-accent border of `error` (#ba1a1a) to keep the look sophisticated and restrained.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A directory list can be offset from a large editorial image to create visual rhythm.
*   **Do** utilize `tertiary_container` (#574228) for subtle highlights, mimicking the warm tones of beach driftwood or campfire embers.
*   **Do** prioritize white space. The Oregon Coast is vast; the UI should breathe similarly.

### Don't
*   **Don't** use 100% black. Use `on_surface` (#161d1f) for all text to maintain a softer, atmospheric contrast.
*   **Don't** use "pill" shaped buttons. They are too playful for a professional, rugged aesthetic. Stick to structured, slightly rounded rectangles.
*   **Don't** use standard drop shadows. If an element doesn't have a background shift, it shouldn't rely on a heavy shadow to "pop."