# Fix Layout Alignment Issue

## Bug: Top header + page body misalignment

**Symptoms (see screenshot):**
- Large empty band above content.
- “Dashboard” header bar and body grid don’t align horizontally with the left nav.
- Page header sits a few pixels lower than the app top-bar; content starts too far down.

---

## Goal (acceptance criteria):
1. Top app bar, page header (“Dashboard”), and main content share the same left/right gutters.
2. No extra vertical gap at the top of the page body (content sits just under the top bar).
3. Layout holds at all breakpoints (≥1280, ≥1536) without 1-px drift.
4. Only the **content pane** scrolls; header/nav remain fixed/sticky.

---

## Implementation

### 1) Normalize the shell layout
Use a 2-column grid with a fixed sidebar and a scrollable main. Set the top bar height as a CSS var for consistent offsets.

```tsx
// LayoutShell.tsx
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-dvw grid grid-cols-[240px_1fr] bg-slate-950 text-slate-200 antialiased">
      {/* Sidebar */}
      <aside className="col-[1] border-r border-slate-800/60 overflow-y-auto">
        {/* ...sidebar... */}
      </aside>

      {/* Main column */}
      <div className="col-[2] grid grid-rows-[auto_auto_1fr] min-w-0">
        {/* Top app bar */}
        <div
          style={{ ['--topbar-h' as any]: '56px' }}
          className="row-[1] h-[var(--topbar-h)] sticky top-0 z-50 border-b border-slate-800/60 
                     bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60"
        >
          <div className="mx-auto max-w-[1400px] px-6 h-full flex items-center">
            {/* ...topbar content... */}
          </div>
        </div>

        {/* Page header (the “Dashboard” bar) */}
        <header className="row-[2] border-b border-slate-800/60 bg-slate-950/60">
          <div className="mx-auto max-w-[1400px] px-6 h-10 flex items-center">
            <h1 className="text-sm tracking-wide text-slate-300">Dashboard</h1>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="row-[3] overflow-y-auto min-h-0">
          <div className="mx-auto max-w-[1400px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 2) Remove double spacing/margins
Audit the first section of the Dashboard page and **remove** any of these on the first child container:
- `mt-*` top margins
- extra spacer divs
- page-level padding that duplicates `py-6` above

```tsx
// Dashboard.tsx (first section)
<section className="space-y-6">  {/* no mt-*, no extra top spacer */}
  {/* ...cards... */}
</section>
```

### 3) Unify gutters and max width
All header/body containers use:
- `mx-auto max-w-[1400px] px-6`
- Do **not** mix `px-4` and `px-6` between bars.
- Sidebar width is fixed `240px` so the vertical borders line up.

### 4) Prevent layout shift from page scrollbar
Ensure only the main pane scrolls:

```css
/* global.css (if needed) */
html, body, #__next { height: 100%; overflow: hidden; } /* or #root */
```

Scrolling happens in `<main className="overflow-y-auto">`.

### 5) Remove sub-pixel drift
Avoid transforms on structural wrappers. If using animated containers, apply transforms to **inner** elements only. Add:

```css
/* Smoother text & consistent rendering */
html { text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
```

---

## QA checklist

- [ ] Top bar height is 56px; page header sits directly beneath (no gap).
- [ ] Left/right borders of sidebar align perfectly with page header/content containers.
- [ ] Resize at 1280/1440/1536/1920 — no 1-px misalignment or wrap.
- [ ] Only the content panel scrolls; headers remain visible.
- [ ] No additional `mt-*` on the first section of the page.
