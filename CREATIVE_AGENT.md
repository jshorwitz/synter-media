# CREATIVE_AGENT.md — LLM‑Powered Creative for Ads (Search & Display)

An LLM agent that generates **production‑ready ad copy** and **creative variants** for Google Search, Google Display, Reddit, and X/Twitter. It consumes the **Campaign Plan JSON** and produces **channel‑specific assets** (headlines, descriptions, bodies, CTAs, alt text) plus **compliance checks** (length, sensitive terms).

---

## 0) Goals

1) Produce **multiple ad variants** per ad group/campaign (A/B ready).  
2) Enforce **platform limits** (character counts, CTA style, URL presence).  
3) Adapt tone for **developer audiences** (technical, clear, credible).  
4) Output **machine‑readable JSON** and **human‑readable Markdown**.

---

## 1) Inputs

- Campaign Plan JSON (validated by `schemas/campaign_plan.schema.json`)  
- Brand guidelines (optional): voice, banned terms, CTA style  
- Target persona (optional): e.g., “JetBrains plugin developers”

---

## 2) Outputs

### 2.1 JSON (creative bundle)
```jsonc
{
  "google": [{
    "campaign_name": "...",
    "adgroups": [{
      "name": "...",
      "ads": [{
        "headline_1": "...", "headline_2": "...", "headline_3": "...",
        "description": "...",
        "final_url": "https://...",
        "sitelinks": [{"text": "...", "url": "https://..."}],
        "callouts": ["Free Trial", "Repo-Aware AI"]
      },{ /* variant B */ }]
    }]
  }],
  "reddit": [{
    "campaign_name": "...",
    "ads": [{
      "title": "...",
      "body": "...",
      "image_prompt": "abstract jetbrains workspace with code panes",
      "destination_url": "https://...",
      "alt_text": "Developer using JetBrains with AI assistant suggestion panel"
    }]
  }],
  "x": [{
    "campaign_name": "...",
    "ads": [{
      "text": "Repo-aware AI for JetBrains. Fix faster. Try free → https://...",
      "destination_url": "https://..."
    }]
  }]
}
```

### 2.2 Markdown (review doc)
- Per‑channel sections with variant tables and reasons‑to‑believe bullets.

---

## 3) Guardrails & Validation

- **Lengths**: Google headlines ≤30 chars; descriptions ≤90. X tweet ≤280.  
- **Banned terms**: enforce brand list; exclude piracy/NSFW.  
- **Links**: every ad must specify a valid `final_url`/`destination_url`.  
- **Readability**: avoid hype; plain, technical language for devs.  
- **Diversity**: ensure variants are meaningfully different.

---

## 4) Prompt Templates

### 4.1 System
> You are a senior performance copywriter for B2B developer tools. Write concise, technical ad copy that speaks to developer workflows. Obey per‑platform character limits and brand guidelines. Produce JSON and Markdown outputs. Do not invent claims—stick to provided inputs.

### 4.2 User (example)
```
Brand: Amp (ampcode.com)
Persona: JetBrains plugin developers
Constraints: headlines<=30, descriptions<=90, tone=technical
Provide: 3 variants per adgroup for Google; 2 variants per platform for Reddit and X.
```

---

## 5) API Endpoints

- `POST /creative/generate`  
  Body: `{ plan: CampaignPlan, brand_guidelines?, persona? }`  
  Returns: `{ json: CreativeBundle, markdown: string }`

- `POST /creative/validate`  
  Body: `{ bundle: CreativeBundle }`  
  Returns: `{ ok: boolean, errors: string[] }`

---

## 6) Implementation Notes

- Use the **model router**: creative tasks → `LLM_CREATIVE_MODEL`.  
- Build a small **validator** for character counts & required fields.  
- Optionally integrate an **image generation prompt** (for Reddit/Display) via your chosen image tool; store only prompts/URLs here.
