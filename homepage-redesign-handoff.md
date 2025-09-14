# Homepage Redesign Handoff

**Objective**  
Redesign the homepage to a **clean, minimal marketing layout** (inspired by [ampcode.com](https://ampcode.com/)), with a fast hero, clear CTAs, and a **below-the-fold product demo (GIF/video)**. Keep the d3.js background but **subtly masked/overlaid** so it never competes with the copy.

---

## Acceptance Criteria
1. Header is compact, sticky, and 1 line high; hero is **two columns** (copy left, visual right) on ≥lg screens; single column on mobile.  
2. Primary CTA row: URL input + “Get Started” button (fixed placeholder issue, no stray glyphs).  
3. d3.js animation **stays in the right column**, blurred/opacity-gated, with a mask/gradient so text is always AAA-readable.  
4. Below the fold: **“See it work”** section with a short autoplay, muted, looping **MP4** (with GIF fallback) that demonstrates the product.  
5. Sections below: value props, logos/social proof, feature highlights, stats, footer—with generous whitespace and consistent gutters.  
6. CLS < 0.05, LCP < 2.5s on desktop; lazy-load noncritical assets.  

---

## Information Architecture (top → bottom)
1. **Header** (logo, Features, Pricing, Docs, Support, Log in, Sign up)  
2. **Hero** (headline + subcopy + CTA input; visual right = masked d3 canvas)  
3. **“See it work” demo** (video/GIF showing agent optimizing ads)  
4. **Three value props** (orchestration, real-time optimization, insights)  
5. **Logos/social proof** (brand bar)  
6. **Feature highlights** (3–6 cards)  
7. **Stats/metrics**  
8. **Footer**  

---

## Layout & Spacing
- Page container: `mx-auto max-w-[1200px] lg:max-w-[1280px] px-6 lg:px-8`  
- Grid for hero (≥lg): `grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`  
- Vertical rhythm: `py-16 lg:py-24` per section  
- Typography scale (Tailwind): `text-6xl/none` (hero), `text-lg` (subcopy), `text-sm` (eyebrow)  

---

## Hero Implementation (React + Tailwind)
```tsx
export default function Home() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI Media Agent</p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-semibold">
              <span className="text-lime-400">Think faster.</span><br/>Decide smarter.
            </h1>
            <p className="mt-5 text-slate-300 max-w-xl">
              Synter orchestrates paid media across every channel with real-time optimization and clear insights.
            </p>

            {/* URL input + CTA */}
            <form className="mt-7" onSubmit={/* handle */ undefined}>
              <div className="relative flex w-full lg:max-w-xl items-center rounded-2xl ring-1 ring-slate-800 bg-slate-900/80 backdrop-blur">
                <input
                  type="url"
                  inputMode="url"
                  className="flex-1 bg-transparent px-4 py-4 text-base placeholder:text-slate-500 focus:outline-none"
                  placeholder="Enter your website URL (e.g., yoursite.com)"
                />
                <button type="submit" className="m-1 shrink-0 rounded-xl bg-lime-500 px-4 py-2.5 text-slate-900 font-medium">
                  Get Started →
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">We’ll analyze your site and start optimizing in minutes.</p>
            </form>

            {/* Secondary CTAs */}
            <div className="mt-6 flex gap-3">
              <a className="rounded-xl ring-1 ring-slate-800 px-4 py-2.5">Watch Demo</a>
              <a className="rounded-xl ring-1 ring-slate-800 px-4 py-2.5">View Docs</a>
            </div>
          </div>

          {/* Visual (d3 canvas with mask/overlay) */}
          <div className="relative h-[360px] lg:h-[520px]">
            <D3Orbit className="absolute inset-0" />
            {/* Mask / scrim overlay */}
            <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_80%_at_60%_50%,_#000_60%,_transparent_100%)] opacity-90" />
            <div className="pointer-events-none absolute inset-0 bg-slate-950/30 mix-blend-multiply" />
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## Below-the-Fold “See It Work” Demo
```tsx
function Demo() {
  return (
    <section id="demo" className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <h2 className="text-2xl lg:text-3xl font-semibold">See Synter optimize your campaigns</h2>
        <p className="mt-3 text-slate-300 max-w-2xl">
          Watch the agent balance budget and bids across Google, Meta, Reddit, LinkedIn—live.
        </p>

        <div className="mt-8 rounded-2xl ring-1 ring-slate-800 overflow-hidden bg-slate-900">
          <video
            className="w-full h-auto block"
            autoPlay
            muted
            loop
            playsInline
            poster="/demo/poster.jpg"
            preload="metadata"
          >
            <source src="/demo/synter-demo.mp4" type="video/mp4" />
            <img src="/demo/synter-demo.gif" alt="Product demo" />
          </video>
        </div>
      </div>
    </section>
  );
}
```

**Performance notes**  
- Encode MP4 (H.264) ~24–30 fps, 1200–1400px wide, ~2–4 Mbps. Provide WebM if available.  
- Use `IntersectionObserver` to lazy-mount the `<video>` only when scrolled into view.  

---

## Value Props / Logos / Features
- Three compact value props (icon + label + one line).  
- Logos row: grayscale, equal height, `opacity-60 hover:opacity-100`.  
- Feature cards: 3–6, use `grid lg:grid-cols-3 gap-6`, each with short headline + 2 lines max.  

---

## Styles & Tokens
- Background: `#0B1220` (slate-950 vibe)  
- Accent: Lime 500 for CTAs + metric highlights  
- Borders: `ring-1 ring-slate-800/60`  
- Shadows: subtle only on interactive elements  
- Consistent gutters: `px-6 lg:px-8` across sections  

---

## Accessibility & SEO
- Headline `<h1>` only in hero; `<h2>` for other sections.  
- Inputs/buttons have accessible names; color contrast ≥ 4.5:1 for text.  
- Add `meta` description and Open Graph/Twitter cards.  
- Lazy-load noncritical images/animation; preconnect to fonts/CDN.  

---

## Cleanup / Removal
- Remove excess decorative layers behind hero text.  
- Eliminate duplicate launchers/badges in corners.  
- Ensure only the hero visual column hosts the d3 canvas; **no full-page overlay**.  

---

## QA Checklist
- [ ] Hero aligns to 2-column layout ≥lg; collapses cleanly on mobile.  
- [ ] d3 animation is visually subtle; copy remains readable over any background.  
- [ ] Demo auto-plays (muted) and loops; no layout shift; lazy loads.  
- [ ] Primary CTA row is keyboard accessible; no stray characters in placeholder.  
- [ ] LCP image/video and fonts load fast; Lighthouse: CLS < 0.05, LCP < 2.5s.  
- [ ] All sections share consistent max-width and gutters.  
