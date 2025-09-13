# BUILD.md — Synter Settings Panel (Credits, Team, Sharing)

> **Purpose:** Step‑by‑step directions for a coding agent to build a **modern Settings panel** for **Synter** with three core capabilities:
>
> 1. **Purchase Credits**, 2) **Add Team Members**, 3) **Share Reports** — plus policies, auditability, and notifications.

---

## Table of Contents

* [Scope & Deliverables](#scope--deliverables)
* [Architecture & Tech Choices](#architecture--tech-choices)
* [Environment & Secrets](#environment--secrets)
* [Data Model (DB Schema)](#data-model-db-schema)
* [API Contracts](#api-contracts)
* [RBAC & Policies](#rbac--policies)
* [Frontend Implementation](#frontend-implementation)
* [Billing & Credits Flow](#billing--credits-flow)
* [Team Management Flow](#team-management-flow)
* [Report Sharing Flow](#report-sharing-flow)
* [Audit & Notifications](#audit--notifications)
* [Analytics Events](#analytics-events)
* [Edge Cases](#edge-cases)
* [Testing & Acceptance Criteria](#testing--acceptance-criteria)
* [Observability & SLOs](#observability--slos)
* [Rollout & Feature Flags](#rollout--feature-flags)
* [Definition of Done](#definition-of-done)
* [Future Extensions (Out of Scope v1)](#future-extensions-out-of-scope-v1)

---

## Scope & Deliverables

**In scope (v1)**

* Settings IA: **Overview**, **Billing & Credits**, **Team & Roles**, **Sharing & Access**, **Notifications**, **Audit Log**.
* **Buy credits** (packages + custom), **Auto‑Recharge** (threshold + top‑up), **Payment methods**, **Invoices**.
* **Invite members** (bulk), **Role changes**, **Member removal**, **Ownership transfer**.
* **Share reports** by email and by **link** (workspace/public), with **expiry**, optional **password**, **revoke**, and **policy controls**.
* **Audit events** for purchases, invites, role changes, shares.
* **Accessibility** (WCAG 2.2 AA), **i18n**‑ready copy, **perf** budgets.

**Out of scope (v1)**

* POs/Net terms procurement, **SCIM/SSO**, advanced per‑feature entitlements, report **edit** permission. (Plan for v1.x+.)

---

## Architecture & Tech Choices

> These are **defaults**. If your stack differs, keep the **interfaces** and behavior identical.

* **Frontend:** Next.js 14 (App Router), TypeScript, React Server Components where useful, React Query for client data, CSS Modules or Tailwind (either is fine), Headless UI or Radix for accessible primitives.
* **Backend:** Next.js API routes (Node 20) or a separate Fastify/Express service. TypeScript throughout.
* **DB:** PostgreSQL 14+. ORM: Prisma.
* **Payments:** Stripe (tokenized; PCI handled by provider).
* **Email:** Postmark/SendGrid (provider adapter pattern).
* **Auth:** Existing Synter auth; expose `user.id`, `role`, `workspace_id` via server session.
* **Validation:** Zod.
* **Feature flags:** Config table + server gate.
* **Queues/Webhooks:** Stripe webhooks; optional BullMQ/Redis for email batching.

**Repo layout**

```
/apps/web
  /app
    /settings (routes)
  /components
  /lib
  /pages/api (if using Pages router for webhooks)
  /styles
/packages
  /api (typed server SDK & route handlers)
  /db (prisma schema & client)
/infra
  docker, terraform (optional)
```

---

## Environment & Secrets

Create `.env` with:

```
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
BILLING_PUBLIC_PRICE_IDS=price_1k,price_5k,price_10k
EMAIL_PROVIDER=postmark
POSTMARK_API_TOKEN=...
# App
APP_URL=https://app.synter.com
ENCRYPTION_KEY=32-byte-base64
```

---

## Data Model (DB Schema)

> Use Prisma or SQL equivalent. IDs are UUID v7. Money in **cents**. Credits as **integers**.

```prisma
model Workspace {
  id              String   @id @default(uuid())
  name            String
  domain          String?
  ownerId         String
  sharingPolicy   Json     // { allowExternalLinks, allowPublicLinks, requirePassword, defaultExpiryDays, memberCanInvite }
  createdAt       DateTime @default(now())
  users           User[]
  creditWallet    CreditWallet?
  paymentMethods  PaymentMethod[]
  invoices        Invoice[]
  invites         Invite[]
  reports         Report[]
  auditEvents     AuditEvent[]
}

model User {
  id            String   @id @default(uuid())
  workspaceId   String   @index
  email         String   @unique
  name          String?
  role          Role
  status        UserStatus @default(ACTIVE)
  lastActiveAt  DateTime?
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
}

enum Role { OWNER BILLING_ADMIN ADMIN MEMBER VIEWER }
enum UserStatus { ACTIVE DISABLED }

model PaymentMethod {
  id           String   @id @default(uuid())
  workspaceId  String   @index
  brand        String
  last4        String
  expMonth     Int
  expYear      Int
  isDefault    Boolean  @default(false)
  providerRef  String   // Stripe pm_...
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}

model CreditWallet {
  id           String   @id @default(uuid())
  workspaceId  String   @unique
  balance      Int      @default(0) // credits
  autoEnabled  Boolean  @default(false)
  threshold    Int?     // credits
  topupAmount  Int?     // credits
  ledger       CreditLedger[]
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}

model CreditLedger {
  id           String   @id @default(uuid())
  walletId     String   @index
  delta        Int
  reason       LedgerReason
  refType      String?  // invoice|report|manual
  refId        String?
  createdAt    DateTime @default(now())
  metadata     Json?
  wallet       CreditWallet @relation(fields: [walletId], references: [id])
}
enum LedgerReason { PURCHASE AUTO_RECHARGE CONSUMPTION REFUND ADJUSTMENT PROMO }

model Invoice {
  id           String   @id @default(uuid())
  workspaceId  String   @index
  totalCents   Int
  taxCents     Int
  currency     String
  status       String    // paid|open|void
  providerId   String    // Stripe invoice id
  pdfUrl       String?
  createdAt    DateTime  @default(now())
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}

model Invite {
  id           String   @id @default(uuid())
  workspaceId  String   @index
  email        String
  role         Role
  status       InviteStatus @default(PENDING)
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}
enum InviteStatus { PENDING ACCEPTED CANCELED EXPIRED }

model Report {
  id            String   @id @default(uuid())
  workspaceId   String   @index
  ownerUserId   String
  title         String
  createdAt     DateTime @default(now())
  accesses      ReportAccess[]
  shareLinks    ShareLink[]
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
}

model ReportAccess {
  id           String   @id @default(uuid())
  reportId     String   @index
  granteeType  GranteeType
  granteeId    String?  // user id
  email        String?
  permission   ReportPermission
  expiresAt    DateTime?
  lastViewedAt DateTime?
  createdAt    DateTime @default(now())
  report       Report   @relation(fields: [reportId], references: [id])
}
enum GranteeType { USER EMAIL LINK }
enum ReportPermission { VIEW SHARE } // SHARE = "View + Can Share"

model ShareLink {
  id           String   @id @default(uuid())
  reportId     String   @index
  scope        LinkScope
  token        String   @unique
  expiresAt    DateTime?
  passwordHash String?
  revokedAt    DateTime?
  createdAt    DateTime @default(now())
  report       Report   @relation(fields: [reportId], references: [id])
}
enum LinkScope { WORKSPACE PUBLIC }

model AuditEvent {
  id           String   @id @default(uuid())
  workspaceId  String   @index
  actorUserId  String
  action       String   // e.g., billing.purchase_succeeded
  targetType   String
  targetId     String?
  context      Json?
  createdAt    DateTime @default(now())
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
}
```

---

## API Contracts

> Base: `/api/v1` — All routes enforce **workspace membership** and **role** checks. Requests/Responses JSON. Use **idempotency keys** for purchases.

### Billing & Credits

* **GET** `/billing/wallet`
  → `{ balance, burnRateDaily, daysRemaining, autoRecharge:{enabled,threshold,topupAmount} }`

* **POST** `/billing/purchase`
  `{"packageCredits"?:number,"customCredits"?:number,"promoCode"?:string,"paymentMethodId"?:string,"taxInfo"?:{country,vatId},"enableAutoRecharge"?:boolean,"topup"?:{threshold,amount}}`
  → `{ invoiceId, wallet:{balance}, receiptUrl }`

* **POST** `/billing/auto-recharge`
  `{"enabled":boolean,"threshold"?:number,"topupAmount"?:number}`
  → `{ enabled, threshold, topupAmount }`

* **GET** `/billing/payment-methods`
  → `[ { id, brand, last4, expMonth, expYear, isDefault } ]`

* **POST** `/billing/payment-methods` (tokenized `pm_...`)
  `{"providerRef":string}` → `{ id }`

* **DELETE** `/billing/payment-methods/:id` → `{ ok:true }`

* **GET** `/billing/invoices`
  → `[ { id,totalCents,taxCents,currency,status,createdAt,pdfUrl } ]`

### Team & Roles

* **GET** `/team/members` → `[ { id,name,email,role,lastActiveAt } ]`
* **POST** `/team/invites`
  `{"invites":[{"email":string,"role":Role}]}` → `{ invites:[{email,role,status,inviteId}] }`
* **GET** `/team/invites` → `[ { id,email,role,status,expiresAt } ]`
* **POST** `/team/members/:id/role` `{"role":Role}` → `{ id,role }`
* **DELETE** `/team/members/:id` `{"reassignToUserId"?:string}` → `{ ok:true }`
* **POST** `/team/transfer-ownership` `{"toUserId":string}` → `{ ok:true }`

### Sharing & Access

* **GET** `/sharing/policy`
  → `{ allowExternalLinks:boolean, allowPublicLinks:boolean, requirePassword:boolean, defaultExpiryDays:number, memberCanInvite:boolean }`

* **POST** `/sharing/policy` `{ ... }` → `{ ... }`

* **POST** `/reports/:id/share/email`
  `{"invites":[{"email":string,"permission":"VIEW"|"SHARE","expiresAt"?:string}],"message"?:string}`
  → `{ sent:[...], failed:[{email,reason}] }`

* **POST** `/reports/:id/share/link`
  `{"scope":"WORKSPACE"|"PUBLIC","expiresAt"?:string,"password"?:string}`
  → `{ linkId, url, scope, expiresAt }`

* **DELETE** `/reports/:id/share/link/:linkId` → `{ ok:true }`

* **GET** `/reports/:id/access`
  → `{ users:[{userId,permission,lastViewedAt}], links:[{linkId,scope,expiresAt,revokedAt}] }`

* **POST** `/reports/:id/access/revoke`
  `{"userId"?:string,"email"?:string,"linkId"?:string}` → `{ ok:true }`

### Errors (common)

* 400 `invalid_argument`, 401 `unauthorized`, 403 `forbidden`, 404 `not_found`, 409 `conflict`, 422 `validation_failed`, 500 `internal_error`.

---

## RBAC & Policies

**Roles**

* **Owner:** All actions incl. transfer ownership.
* **Billing Admin:** Payment methods, purchases, invoices, auto‑recharge.
* **Admin:** Invite/remove members (not Owner), change roles, set sharing policy.
* **Member:** View own usage; can share reports they own; invites if policy `memberCanInvite = true`.
* **Viewer:** Read‑only.

**Middleware**

* Attach `req.context = { userId, workspaceId, role }`.
* Central `requireRole(...allowed)` and `enforcePolicy(policyKey)` guards server‑side.

---

## Frontend Implementation

**Routes (Next.js App Router)**

```
/settings
  /overview
  /billing
    /purchase
    /payment-methods
    /invoices
  /team
    /members
    /invites
  /sharing
    /policy
    /manage
  /notifications
  /audit
```

**Shared UI components**

* `Card`, `Table`, `Badge`, `Modal`, `Drawer`, `Tooltip`, `InlineEdit`, `CopyField`, `Toast`.
* Form inputs with inline validation; disabled primary CTAs until valid.
* **Accessibility:** All interactive elements keyboard reachable; ARIA for modals, toasts, tooltips; contrast ≥ 4.5:1.

**Overview page (summary cards)**

* **Credits**: balance, sparkline (last 30 days), "Top up" CTA.
* **Team**: total members, pending invites, "Invite people".
* **Sharing**: external links count, "Manage sharing".

---

## Billing & Credits Flow

### UX

* **Balance & Usage:** Large balance number; daily burn; **days remaining**; low‑balance banner.
* **Purchase Modal/Drawer:** Package buttons (1k/5k/10k) + custom; promo; tax/VAT; choose payment method; **enable Auto‑Recharge** inline (threshold/top‑up).
* **Payment Methods:** Add (tokenized), set default, remove non‑default.
* **Invoices:** Table with date, amount, status; download receipt PDF.

### Backend tasks

1. **Wallet read**: compute `burnRateDaily` from last 30d ledger consumption.
2. **Purchase**:

   * Validate package/custom credits; create Stripe PaymentIntent.
   * On success: create Invoice, **increment wallet**, ledger entry `{ delta:+credits, reason:PURCHASE }`.
   * Send receipt email; audit `billing.purchase_succeeded`.
   * Idempotency by `Idempotency-Key`.
3. **Auto‑Recharge**:

   * Persist `{enabled,threshold,topupAmount}`.
   * Trigger: when post‑action balance `< threshold` → enqueue top‑up purchase via default payment method.
   * Failure policy: after 3 consecutive failures, disable auto‑recharge; notify Owner + Billing Admin.

---

## Team Management Flow

### UX

* **Members** table: name, email, role (inline dropdown), last active, actions (remove).
* **Invite** modal: multiline emails/CSV; role selector; optional message; show pending with resend/cancel.
* **Ownership transfer**: select Admin, confirmation modal.

### Backend tasks

1. **Invites**:

   * Validate emails vs domain policy (if enabled).
   * Create tokens (unguessable), expiry 14 days.
   * Send email with accept link.
   * Audit `team.invite_sent`.
2. **Accept invite** (separate route): create `User`, set role; delete invite; audit `team.invite_accepted`.
3. **Role changes**: enforce constraints (cannot demote Owner; Owner transfer flow required).
4. **Member removal**: require report ownership reassignment or auto‑assign to Owner/Admin.

---

## Report Sharing Flow

### UX

* **Per‑Report Share panel** (open from report page or `/settings/sharing/manage`):

  * Share by **email**: permission `View` or `View + Can Share`, optional message, optional expiry.
  * **Link share**: scope `Workspace` or `Public` (if policy allows), **expiry picker**, optional **password**, **copy URL**, **revoke**.
  * **Access list**: users + links with last viewed; revoke any entry.

* **Sharing Policy** page:

  * Toggles: `allowExternalLinks`, `allowPublicLinks`, `requirePassword`, `defaultExpiryDays`, `memberCanInvite`.
  * Disabled states show tooltips if blocked by role/policy.

### Backend tasks

1. **Policy CRUD**; enforce in all share routes.
2. **Email share**: create `ReportAccess` (granteeType EMAIL or USER if existing).
3. **Link share**: create `ShareLink` with 128‑bit token; if password, store `passwordHash` (argon2id).
4. **Access/Revocation**:

   * Revoke by user/email/link → delete/mark revoked; audit.
   * Expiry enforcement at access time; show “Link inactive” screen if expired/revoked.
5. **Access gate**:

   * `WORKSPACE` links require logged‑in user in same workspace.
   * `PUBLIC` links require token, and if password set then challenge; rate‑limit attempts; lock after N failures.

---

## Audit & Notifications

**AuditEvent** written for:

* `billing.purchase_started/succeeded/failed`
* `billing.auto_recharge_enabled/fired/failed`
* `team.invite_sent/accepted/role_changed/member_removed`
* `sharing.policy_changed/report_shared_email/share_link_created/share_link_revoked/report_access_revoked`

**Emails**

* Receipt (purchase/top‑up), Low balance, Invite, Share, Share revoked/expired.
* Keep **content minimal**; log metadata only.

---

## Analytics Events

Emit structured analytics (client + server):

* **Billing**: `billing_wallet_viewed`, `billing_purchase_started/succeeded`, `auto_recharge_enabled/fired/failed`
* **Team**: `team_invite_sent/accepted`, `team_role_changed`, `team_member_removed`
* **Sharing**: `report_shared_email`, `share_link_created/revoked`, `report_viewed_via_share`
* **Audit mirrored** where helpful.

Payloads include `workspaceId`, `userRole`, relevant IDs, and numeric fields (e.g., `credits`, `topupAmount`).

---

## Edge Cases

* Declined card / network error → informative inline error; do not create partial ledger entries.
* Auto‑recharge failures → disable after 3 tries; notify Owner & Billing Admin.
* Duplicate invite for existing member → `409 conflict` with suggestion to change role.
* Domain‑restricted invites → block external emails; show policy hint.
* Removed user with report access → access revoked automatically; ownership reassignment as needed.
* Link access after revoke/expiry → “Link inactive” page with owner contact CTA.
* Concurrent role changes → optimistic concurrency; last write wins; toast with actor attribution.

---

## Testing & Acceptance Criteria

> Use **Jest** (unit), **Playwright** (E2E), **Supertest** (API). Seed test data.

### Billing & Credits

* [ ] **Balance view** renders correct balance, burn rate, and days remaining with empty and non‑empty ledger.
* [ ] **Purchase 5k credits** succeeds; wallet increments; invoice created; receipt email enqueued; ledger `{PURCHASE,+5000}`.
* [ ] **Auto‑recharge** triggers at threshold; creates invoice; updates balance; receipt email; audit entry.
* [ ] **Declined card** → 402/422 path; no ledger change; retry allowed.

### Team & Roles

* [ ] **Bulk invite 10**; one duplicate reported; 9 pending created; emails enqueued.
* [ ] **Accept invite** creates `User` with correct role; pending removed; audit recorded.
* [ ] **Role change** Member→Admin updates capabilities immediately; guarded by RBAC; audit logged.
* [ ] **Remove member** prompts ownership reassignment; reassignment succeeds; access updated.

### Sharing

* [ ] **Share by email (View)** → invitee can access; `lastViewedAt` updates on first open.
* [ ] **Workspace link** blocks non‑workspace users.
* [ ] **Public link** with password + 7‑day expiry denies access after day 7; early revoke works.
* [ ] **Policy disables public links** → UI disabled; server 403 if attempted via API.

### Accessibility & Perf

* [ ] Keyboard navigable modals, forms, menus; focus traps correct; labels/ARIA present.
* [ ] TTI ≤ 2s on 3G Fast for Settings pages; P95 action latency ≤ 400ms (server).

---

## Observability & SLOs

* **Logging:** Structured JSON with `requestId`, `workspaceId`, `actorUserId`, latency, outcome.
* **Tracing:** Wrap purchase, invite, share flows; propagate `requestId`.
* **Metrics:** Purchase success rate, auto‑recharge failures, invite acceptance rate, link‑view counts.
* **SLOs:** Checkout path availability ≥ 99.9% monthly. Error budget alerts to #oncall.

---

## Rollout & Feature Flags

* Flags: `settings_v2`, `credits_autorecharge`, `sharing_policies`.
* Gradual enable: Owners & Billing Admins → Admins → Members.
* Migration:

  * Create `CreditWallet` per workspace; backfill starting ledger `ADJUSTMENT`.
  * Map legacy shares to `ShareLink`/`ReportAccess` as applicable.
* Deprecate legacy settings 2 weeks after workspace enablement.

---

## Definition of Done

* All endpoints implemented with **RBAC**, **input validation**, **unit + E2E** tests.
* UI matches UX spec, responsive down to 320px, **WCAG 2.2 AA** checks pass.
* **Stripe** integration tested in test mode incl. webhook signature verification & idempotency.
* **Emails** fire on purchase, invite, share; templates localized; unsubscribe not required for transactional.
* **Audit** entries present for all critical actions.
* **Dashboards** live for key metrics; alerts configured for failure spikes.
* Security review complete: token lengths, password hashing (argon2id), rate limits for link password attempts.

---

## Future Extensions (Out of Scope v1)

* SSO & SCIM provisioning
* Role templates and granular entitlements
* Cost centers/tags & internal chargebacks
* Slack alerts for usage thresholds
* Report embed codes and signed iframes
* Cross‑workspace credit transfers

---

# Agent Task List (Sequential)

1. **Scaffold repo** with Next.js + TypeScript + Prisma; set up `.env`.
2. **Implement Prisma schema** above; run migrations; seed dev data.
3. **Add RBAC middleware** and policy loader (`sharingPolicy`).
4. **Build Billing APIs** (`/billing/*`), integrate Stripe; implement **webhook** handler.
5. **Implement Wallet math** (burn rate & days remaining) and **Auto‑Recharge** worker.
6. **Build Team APIs** (`/team/*`), invite tokens, acceptance flow.
7. **Build Sharing APIs** (`/sharing/*`, `/reports/:id/*`), password hashing, rate limiting.
8. **Implement Audit logging** across flows; add analytics event emitters.
9. **Create Settings UI** routes & components; connect to APIs; add optimistic updates where safe.
10. **Add Emails** (provider adapter), templates for receipt/invite/share.
11. **Write Tests** (unit, API, E2E) per acceptance list; fix regressions.
12. **Wire Observability** (logs, traces, metrics); set SLO dashboards.
13. **Gate with feature flags**, execute staged rollout plan.
14. **Finalize Accessibility & Perf** passes; ship.

---

## Sample Type Definitions (frontend)

```ts
export type Role = 'OWNER'|'BILLING_ADMIN'|'ADMIN'|'MEMBER'|'VIEWER';

export interface Wallet {
  balance: number;
  burnRateDaily: number;
  daysRemaining: number;
  autoRecharge: { enabled: boolean; threshold?: number; topupAmount?: number };
}

export interface SharingPolicy {
  allowExternalLinks: boolean;
  allowPublicLinks: boolean;
  requirePassword: boolean;
  defaultExpiryDays: number;
  memberCanInvite: boolean;
}
```

## Security Notes (must‑do)

* Never store PAN; only `providerRef` from Stripe.
* Enforce server‑side authorization for **every** write.
* Link tokens ≥ 128 bits random; password attempts rate‑limited + exponential backoff.
* Encrypt sensitive fields at rest with `ENCRYPTION_KEY`.

---

**End of BUILD.md**
