# BusyBench-Style SaaS: Features & Build Plan (for Claude Code)

> Goal: recreate the **BusyBench** freemium experience—focused on computer/phone repair shops—then extend it with a modern, cloud-first stack.

---

## 1) Reference: BusyBench Free-Tier Feature Set

Grounded in third-party snapshots (BusyBench’s own site is gone). Use this as the MVP contract:

- **Users:** 1 active user.  
- **Unlimited:** customers, repair tickets, invoices, estimates, outbound emails.  
- **Core modules:** CRM (customers), repair/ticket tracking, inventory, invoicing/estimates, POS basics listed as product capabilities.

### Paid Plan (everything unlocked)
- Multiple users.  
- Ticket overview dashboards & reporting.  
- Customer map (geocoded addresses).  
- Scheduling & calendar integration.  
- POS features.  
- SLA alerts, recurring invoices, automations, follow-up emails.  
- Payment gateway integration (e.g., Authorize.net, Stripe, PayPal).  
- Setup assist & priority support.  

---

## 2) Product Scoping (MVP mirrors Free Tier)

### 2.1 Modules (MVP)
- **Auth & Org**
  - Single org, **1 active user** cap; soft-delete users.
- **Customers (CRM-lite)**
  - Create/edit customer, contacts, devices. Search & tags.
- **Tickets (Repairs)**
  - Intake form, status (New/In Progress/Waiting Parts/Ready/Picked Up), SLA target date (display only), time logs, attachments, internal notes, public updates via email.
- **Inventory**
  - Items/parts with SKU, cost, price, qty, low-stock threshold, basic adjustments.
- **Estimates & Invoices**
  - Line items (labor/parts/discounts/tax), convert estimate→invoice, PDF output, email send, record payments (manual), basic tax settings.
- **Email Outbound**
  - Unlimited notifications (ticket updates, estimates, invoices) via SMTP/OAuth integration throttled per-minute.

### 2.2 Non-functional (MVP)
- Roles: **Owner** (the single user) with full rights.  
- Performance: sub-200ms p50 for standard reads at 10k records.  
- Security: OWASP ASVS L1, MFA optional; row-level tenancy.  
- Audit: change history for tickets, invoices.  
- Localization: currency, date/time formats; EN first.

---

## 3) Paid Version Features (all unlocked)

- **Dashboards & Reporting:** ticket overview, revenue, parts usage, staff time reports.  
- **Customer Map:** geocoded addresses + map view.  
- **Scheduling/Calendar:** technician calendar, Google Calendar sync.  
- **POS:** register mode, receipt print, cash management, barcode scan.  
- **Automations:** SLA alerts, follow-up emails, recurring invoices.  
- **Payments:** integration with Authorize.net, Stripe, PayPal.  
- **Multi-user support.**  
- **Priority Support & Setup Assist.**

---

## 4) Architecture

- **Frontend:** React + TypeScript (Next.js App Router), TanStack Query, Zod, Tailwind.  
- **Backend:** Node.js (NestJS) or Python (FastAPI). Pick one; samples assume **NestJS**.  
- **DB:** Postgres (row-level security), Prisma ORM.  
- **Search:** Postgres trigram index; optional Meilisearch later.  
- **Queue:** In-app cron for MVP; move to BullMQ/Redis for automations.  
- **Email:** Postmark/SES via SMTP & OAuth.  
- **Files/PDF:** S3-compatible (Backblaze/Bucket) + pdfmake or Playwright print-to-PDF.  
- **Auth:** JWT + refresh; MFA TOTP.  
- **Infra:** Docker, Fly.io or Railway for MVP; Terraform later.  
- **Observability:** OpenTelemetry → Grafana Cloud; Sentry.

---

## 5) Data Model (key tables)

- `org(id, plan, active_user_limit, ...)`  
- `user(id, org_id, role, status, ...)`  
- `customer(id, org_id, name, email, phone, address_json, tags[])`  
- `device(id, customer_id, make, model, serial, imei, notes)`  
- `ticket(id, org_id, customer_id, device_id, status, priority, intake_json, sla_target_at, assigned_to, timestamps)`  
- `inventory_item(id, org_id, sku, name, cost, price, qty, reorder_level)`  
- `estimate(id, org_id, customer_id, totals_json, status)`  
- `invoice(id, org_id, customer_id, estimate_id?, totals_json, balance_due, status)`  
- `line_item(id, parent_type, parent_id, item_type, ref_inventory_id?, desc, qty, unit_price, tax_rate)`  
- `payment(id, invoice_id, method, amount, ref)`  
- `email_log(id, org_id, to, subject, template, payload_json, status)`  
- `audit_log(id, org_id, entity, entity_id, actor_id, before, after)`

---

## 6) API Surface (selected)

- **Auth:** `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/mfa/*`  
- **Customers:** `GET/POST /customers`, `GET/PATCH /customers/:id`, `/customers/:id/devices`  
- **Tickets:** `GET/POST /tickets`, `PATCH /tickets/:id/status`, `/tickets/:id/comment`, `/tickets/:id/email`  
- **Inventory:** `GET/POST /inventory`, `PATCH /inventory/:id`, `/inventory/:id/adjust`  
- **Estimates/Invoices:** `POST /estimates`, `POST /estimates/:id/convert`, `POST /invoices/:id/email`, `POST /invoices/:id/payments`  
- **PDF:** `GET /pdf/estimate/:id`, `GET /pdf/invoice/:id`  
- **Org/Plan:** `GET /org`, plan limits enforced via middleware.

---

## 7) Plan-Limit Enforcement

- **Free:** single active user, watermark on PDFs.  
- **Paid:** removes user limit, watermark, and unlocks all features.  
- Rate-limit emails per minute to prevent abuse (but no monthly cap).

---

## 8) Dev Workflow in Claude Code

1. **Repo layout**
   ```
   /apps/web        # Next.js
   /apps/api        # NestJS
   /packages/ui     # shared components
   /packages/types  # zod schemas & TS types
   /infra           # docker-compose, fly.toml
   ```
2. **Kickoff prompts (Claude)**
   - Generate a NestJS module for Tickets with Prisma models (ticket, line_item). Include CRUD, status transition guard, and service tests.
   - Create a Next.js page for /tickets with TanStack table, filters, pagination, and optimistic update on status change.
   - Build a PDF renderer for invoices using Playwright: server route that returns A4 PDF with company header, items table, totals.
3. **Tasks backlog (MVP)**
   - [ ] Auth & org bootstrap; RLS policies in Prisma migrations.  
   - [ ] Customers + devices CRUD + search.  
   - [ ] Ticket intake form and workflow; email templates.  
   - [ ] Inventory CRUD + adjustments.  
   - [ ] Estimates→Invoice conversion; totals calc; PDF.  
   - [ ] Email sending + logs.  
   - [ ] Audit trail middleware.  
   - [ ] Plan guard middleware + PDF watermark.  
   - [ ] Seed script & demo org.  
   - [ ] E2E smoke (Playwright): create customer→ticket→estimate→invoice→email.

---

## 9) UX Notes

- **Ticket Board:** Kanban by status; quick actions; SLA date chip.  
- **Estimate/Invoice Editor:** dynamic lines, tax selector, part picker from inventory.  
- **Inventory:** inline qty adjust; low-stock badges.  
- **Email Templates:** liquid-style variables ({{customer.name}}, {{ticket.id}}).  
- **Accessibility:** keyboard first, ARIA on tables/kanban.

---

## 10) Security & Compliance

- Per-org tenancy via `org_id` + RLS.  
- Encrypted secrets (Doppler/SOPS).  
- File upload AV scan (ClamAV sidecar) before persistence.  
- Audit log immutable append (hash chain optional).  
- GDPR basics: data export & delete per org.

---

## 11) Analytics & Telemetry

- Events: ticket_created, invoice_sent, payment_recorded, email_bounced.  
- North-star: **Tickets closed** and **Invoices paid** per active org.

---

## 12) Deployment

- **Local:** `docker compose up` (api, web, pg, redis, mailhog, clamav).  
- **Prod (MVP):** Fly.io Postgres + S3 bucket; rolling deploy; daily backups.  
- **CI:** GitHub Actions—lint, typecheck, unit, e2e (ephemeral DB), build & push.

---

## 13) Migration Path (for ex-BusyBench users)

- CSV importers for customers, devices, inventory, and invoices; ticket import with best-effort mapping.  
- Email domain verification wizard.

---

## 14) Roadmap (first 90 days)

- **Week 1–2:** Auth/org, DB schema, Customers/Inventory CRUD.  
- **Week 3–4:** Tickets + email notifications; Estimates/Invoices core.  
- **Week 5–6:** PDF, payments (manual), audit logs, plan limits.  
- **Week 7–8:** UX polish, accessibility, telemetry, seed/demo.  
- **Week 9–10:** Beta; feedback loop; fix & harden.  
- **Week 11–12:** Launch free + paid version with full unlock.

---

## 15) Acceptance Criteria (MVP)

- Create customer → create ticket → email update → add parts from inventory → create estimate → convert to invoice → generate PDF → mark paid.  
- All actions available to a single active user (free); attempts to activate a second user are blocked unless on paid plan.  
- 99.9% uptime in small-scale prod; cold starts < 2s.

---
