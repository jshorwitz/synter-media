# Fix Rogue Character Overlaying URL Input Placeholder

We still see a **mystery glyph** rendered over the first letter of the placeholder in the URL input. This is almost always caused by **a pseudo‑element (::before/::after) or a background icon** attached to the input wrapper, not by the placeholder text itself.

## Acceptance Criteria
- No extra glyph/character overlays the placeholder at any breakpoint or focus state.
- Placeholder text starts flush with intended left padding and is vertically centered.
- No pseudo‑elements with `content` apply to the input or its wrapper.
- No background image/icon is attached to the input or wrapper unless explicitly desired.

---

## Investigate (DevTools)
1. Inspect the input element and **toggle the `:hov` states** (focus/active).
2. In the **Styles** pane, check for rules adding **`::before` or `::after`** on:
   - the input itself,
   - its immediate wrapper (e.g., `.input`, `.field`, `.url-input`, `.form-control`),
   - any utility classes (Tailwind `before:*` / `after:*`).
3. In **Computed**, look for:
   - `background`, `background-image`, `mask`, `-webkit-mask-image`.
   - `text-indent`, `list-style`, `marker`, `content`.
4. Temporarily disable any suspicious rule and confirm the glyph disappears.

---

## Patch 1 — Remove unintended pseudo‑elements
If a Tailwind utility or CSS sets a pseudo‑element with content, **remove it** or override:

```css
/* Scoped reset for the URL input group */
.url-input,
.url-input * {
  position: relative;
}

.url-input::before,
.url-input::after,
.url-input > *::before,
.url-input > *::after {
  content: none !important;
}
```

If using Tailwind, apply to the wrapper:
```tsx
<div className="url-input before:content-none after:content-none">
  <input /* ... */ />
</div>
```

Search the codebase for any of these patterns and delete/adjust:
```css
.input::before { content: "\e900"; }          /* icon font */
.before\:content-\[\".*\"\] { /* tailwind */ }
.field-icon::before { content: attr(data-icon); }
```

---

## Patch 2 — Remove background/mask icons
If an icon is injected via background or mask:

```css
.url-input,
.url-input input[type="url"] {
  background: none !important;
  -webkit-mask-image: none !important;
  mask-image: none !important;
  background-position: initial !important;
  background-repeat: no-repeat !important;
}
```

---

## Patch 3 — Sanitize placeholder string (safety belt)
Even if the overlay is fixed, strip invisible Unicode from the placeholder at render time.

```tsx
function sanitize(s: string) {
  return s.normalize('NFC').replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, '');
}

<input
  type="url"
  placeholder={sanitize('Enter your website URL (e.g., yoursite.com)')}
  className="..."
/>
```

---

## Patch 4 — Input baseline & padding consistency
Ensure no odd `text-indent`/`padding-left` is creating space for a (now missing) icon.

```css
.url-input input[type="url"] {
  padding-left: 16px;      /* align with design */
  text-indent: 0;
  line-height: normal;
}
```

If the control previously reserved space for an icon, remove that class or set `pl-4` consistently.

---

## Verification Checklist
- [ ] With DevTools, `::before`/`::after` no longer appear on the input/wrapper.
- [ ] `Computed` shows no `background-image`/`mask-image` on the input/wrapper.
- [ ] Placeholder begins with a clean `E` (no overlay) in Chrome, Safari, Firefox.
- [ ] Focus/filled states do not reintroduce the glyph (check component variants).
- [ ] Regression: other inputs using the same component remain styled correctly.

---

## Notes
- If you rely on a **left icon** intentionally, render it as a separate `<svg>` element absolutely positioned in the wrapper with `pointer-events-none`, **not** via `content` or `background-image` on the input:
```tsx
<div className="relative url-input">
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" /* ... */ />
  <input className="pl-9 ..." /* ... */ />
</div>
```
