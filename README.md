# Grogent — The Small Business Growth Agent

<p align="center">
  <!-- <img src="./frontend/public/grogent.png" alt="Agent Face" width="100" style="border-radius:50%;" /> -->
  <a href="https://github.com/APPANAHARINI1234/BizBoost">
  <img src="./frontend/public/grogent.png" alt="Agent Badge" height="80"></a>
</p>

> **Your AI co-pilot for growth** — strategy, content, automation, and customer replies, all with **human-in-the-loop** control. Built for **AgentHack 2025** with  **Portia AI** .

---

## TL;DR

* **Problem:** Small businesses don’t know *where* to grow, *what* to post, or *how* to handle the follow-up.
* **Solution:** An agent that  **analyzes** ,  **creates** ,  **schedules** , and **triages** — with approvals at every step.
* **Why Portia:** Controllable planning → tool calls → **Approve/Reject** → safe execution.
* **Demo flow:** Idea in → platform recommendations → branded post + image → approve → scheduled → inbox triage (stretch).
* **Impact:** Real workflows across Gmail, Calendar, and social APIs.
* **Repo structure & quickstart below**

---

## Table of Contents

1. [Problem](#problem)
2. [Solution](#solution--features)
3. [Why Portia (Portia-Native Design)](#why-portia--portia-native-design)
4. [Architecture](#architecture)
5. [Demo: See It!](#demo-see-it)
6. [Quickstart (Local)](#quickstart-local)
7. [Tech Stack](#tech-stack)
8. [How It Works (Under the Hood)](#how-it-works-under-the-hood)
9. [Judging Criteria ↔ Evidence Map](#judging-criteria--evidence-map)
10. [UX &amp; Accessibility](#ux--accessibility)
11. [Security, Safety &amp; Governance](#security-safety--governance)
12. [Roadmap](#roadmap)
13. [Team](#team)
14. [Acknowledgements](#acknowledgements)

---

## Problem

Small businesses struggle with:

* **Channel focus** — “Instagram? YouTube? Etsy? Where will efforts pay off?”
* **Consistent branding & content** — time-intensive, inconsistent quality.
* **Execution** — posting at the right time across tools is a chore.
* **Follow-up** — inboxes fill with sales leads and support questions.

Existing tools are fragmented, costly, and  **not agentic** . Owners want a **trusted co-pilot** that acts but keeps them in control.

---

## Solution & Features

**Grogent** is an **AI Growth Agent** with four composable modules:

1. **🧠 Intelligence & Strategy**
   * *Platform Opportunity Analyzer* — recommends the best channels for the business.
   * *Trend & Competitor Spotter* — surfaces positioning ideas.
   * *Customer Feedback Analyzer* — what content resonates (engagement signals).
2. **🎨 Content & Branding**
   * *Marketing Kit Generator* — logos/banners/posters from brand cues.
   * *Social Co-pilot* — posts + AI images + trend-aware hashtags, in your tone.
3. **🤖 Action & Automation**
   * *Intelligent Scheduler* — posts at predicted peak windows.
   * *Smart Integrations* — Gmail send, WhatsApp share previews, Calendar blocks.
4. **📬 Inbox Triage (Stretch)**
   * *Lead/Support Classifier* — labels and drafts suggested responses for approval.

> **Control first:** Every action is presented for **Approve / Edit / Reject** before execution.

---

## Why Portia — Portia-Native Design

Grogent is designed around  **Portia’s controllable agent framework** :

* **Structured Planning → Tools → Human Approval → Safe Execution**
* **1000+ Tool Connectivity** (e.g., Gmail, GitHub, Slack, Notion, Google Calendar)
* **Secure Execution** via open-source runtimes & policies
* **Developer-centric SDK** for custom behaviors & integrations

**Why not a generic LLM bot?**

Because Portia provides **oversight, composability, and safety** baked in — exactly what small businesses and judges care about.

---

## Architecture

```
+------------------------------+            +-------------------------+
|   Web UI (React + Tailwind)  | <--------> |   App Server (Node)     |
|  - Approve/Reject Console    |            |  - Portia SDK Orchestr. |
|  - Live Plan Preview         |            |  - Tool Connectors      |
+--------------^---------------+            +-------------^-----------+
               |                                         |
               | human-in-the-loop                      | tool calls
               v                                         v
        +-------------------+                    +-------------------+
        |   Portia Planner  |  plans & routes -> |  Portia Executor  |
        +---------^---------+                    +---------^---------+
                  |                                         |
                  |                                         |
        +---------+------------------------------+----------+--------+
        |   Gmail   |  Google Calendar  | Social APIs |  WhatsApp   |
        +-----------+-------------------+------------+--------------+
```

**Data flow (typical):**

User goal → Portia Plan → Proposed actions (UI) → Approve → Execute tools → Log outcome → Learn from feedback.

---

## Demo: See It!

> **Scenario:** *“Local Handmade Soap Shop wants morning sales boost.”*

1. **Enter business** details → “Handmade Soap Shop” + audience.
2. **Analyze** → Grogent recommends  *Instagram Reels + Etsy storefront optimizations* .
3. **Generate** → Branded Reel cover, caption, and 15 trend-aware hashtags.
4. **Approve** → One-click approve in the console.
5. **Schedule** → Adds a Calendar event; optional Gmail preview to owner.
6. *(Stretch)* **Inbox** → Email “bulk order?” auto-labeled  **Sales Lead** , reply drafted.

**Screens/GIFs (drop files here):**



<img width="1910" height="887" alt="Screenshot 2025-08-24 160507" src="https://github.com/user-attachments/assets/2757e887-8ce9-4d24-b169-bb7df2b7650f" />
---<img width="1899" height="899" alt="Screenshot 2025-08-24 160939" src="https://github.com/user-attachments/assets/f27ecca6-8ba3-4512-9f3c-723887f26d84" />

<img width="1855" height="785" alt="Screenshot 2025-08-24 164522" src="https://github.com/user-attachments/assets/0b7a6715-a534-4929-ab9b-11c019b05a1f" />

## Quickstart (Local)

### Prerequisites

* Node 18+ / pnpm or npm
* A Portia account + API key
* Google API creds (Calendar, Gmail)
* (Optional) Social API tokens / WhatsApp Business sandbox

### 1) Clone & Install

```bash
git clone https://github.com/<you>/grogent
cd grogent
pnpm install         # or: npm install
```

### 2) Configure Env

Create `.env` in the project root:

```env
PORTIA_API_KEY=...
PORTIA_AGENT_ID=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2callback
GMAIL_SENDER=owner@example.com
CALENDAR_ID=primary
SOCIAL_API_KEY=...          # optional
WHATSAPP_SANDBOX_TOKEN=...  # optional
```

### 3) Run Dev

```bash
pnpm dev            # starts server + frontend with proxy
# or
pnpm server         # backend only
pnpm web            # web only
```

### 4) Seed Demo

```bash
pnpm seed:demo
# seeds a sample "Handmade Soap Shop" project and mock competitor data
```

---

## Tech Stack

* **Frontend:** React, Tailwind CSS, Vite
* **Backend:** Node.js, Express 
* **Portia SDK:** for planning, execution, and tool integration
* **Tools:** Google APIs (Gmail, Calendar), Social Media APIs (Instagram, Twitter), WhatsApp Business API

---

## How It Works (Under the Hood)

### Planning (Portia)

* **Plan nodes** : *DiscoverChannels → DraftCampaign → GetApproval → Execute → Measure*
* **Guards** : Every *Execute* node requires approved action payloads.

### Tools (Examples)

* `tool.generateAsset()` → image/poster from brand cues
* `tool.schedulePost()` → creates Calendar block / queue entry
* `tool.sendPreview()` → Gmail draft to the owner
* `tool.classifyInbox()` → Lead/Support/Other + draft reply

### Human-in-the-loop UX

* Unified  **Approval Console** : compare plan vs. diff of proposed changes
* **Edit before execute** : tweak caption, hashtags, time
* **Audit log** : who approved what, when, and the exact executed payload

---

## Judging Criteria ↔ Evidence Map

| Criterion                          | What to Look At     | Evidence                                                                    |
| ---------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| **Potential Impact**         | Problem & Solution  | Real SMB workflow replacing 3–4 tools; measurable time saved               |
| **Creativity & Originality** | Modules + Planner   | *Growth co-pilot*framing; Portia plan nodes chained for end-to-end growth |
| **Learning & Growth**        | Commits / Notes     | Iterative commits, integration notes, tradeoffs in `/docs/notes.md`       |
| **Implementation**           | Architecture / Code | Portia planning + tool calls + approvals + execution + logs                 |
| **Aesthetics & UX**          | Screens/GIFs        | Minimal, intuitive**Approve / Edit / Reject**UI; accessible defaults  |

---

## UX & Accessibility

* Clear **Approve / Edit / Reject** affordances, keyboard-navigable.
* Descriptive labels; input constraints; undo for destructive actions.
* Motion reduced for users with `prefers-reduced-motion`.
* Color contrast meets WCAG AA.

---

## Security, Safety & Governance

* **Scope constraints** : tools limited to whitelisted accounts/resources.
* **Rate limits** : outbound messages/posts throttled per policy.
* **Content filters** : reject prohibited/unsafe content categories.
* **No-surprise rule** : nothing executes without explicit approval.
* **Auditability** : signed action logs with timestamp + approver + payload hash.

---

## Roadmap

* Rich analytics: content ROI, cohort analysis.
* More channels: TikTok scheduling proxy; Instagram DM (Business).
* Mobile companion (React Native) for quick approvals.
* Marketplace of **Growth Playbooks** (templated Portia plans per niche).

---

## Team

* **Appana Harini**
* **E Shelian Gladis**

---

## Acknowledgements

* **Portia AI** — controllable agent framework, tool connectivity, secure execution.
* **WeMakeDevs** — organizing AgentHack 2025.
* Mentors, community, and open-source contributors.

---
