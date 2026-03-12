# Lead Generation Feature – Design & UX/UI

## 1. Where to put it: Sidebar vs Agent extended capability

**Recommendation: Both, with Agent as primary.**

| Option | Pros | Cons |
|--------|------|------|
| **Sidebar only** | Clear “Lead Gen” entry; separate mental model | Duplicated context; user has to re-describe intent if they were already in a chat |
| **Agent only** | One place to “tell the AI what contacts you want”; natural conversation; reuse session/context | Harder to discover if user doesn’t think to ask in chat |
| **Both** | Best discoverability + best flow | Slightly more implementation |

**Suggested implementation:**

1. **Primary: Extended capability inside Agent**  
   - User describes in chat: “Find me 50 product managers in fintech in NYC from LinkedIn” or “Get leads who are good at ML from X.”  
   - Agent uses **lead-generation tools** (same pattern as Stripe/Gmail/Postgres).  
   - When the agent finishes finding leads, it returns structured **lead results**; the UI shows them in an **Excel-like canvas** (see below).

2. **Secondary: Sidebar + Dashboard Quick Action**  
   - **Sidebar:** Add a “Lead Gen” (or “Leads”) item that navigates to `/dashboard/agent?mode=leads` or `/dashboard/leads`.  
   - **Dashboard Quick Actions:** Add “Find leads” that goes to the same destination.  
   - That destination can be either:  
     - **A)** The same Agent page with a **pre-set prompt / mode** (e.g. “I want to find leads…”) and a hint to describe job/skill/source, or  
     - **B)** A dedicated **Lead Gen page** that has a short form (what role, which platforms, filters) and then opens the agent chat with that context and shows the leads canvas when done.  

**Recommendation:** Start with **(A)** – one Agent page, with a **mode** or **starter prompt** when coming from “Lead Gen” in sidebar/Quick Action. Add a dedicated Lead Gen page later if you want a more form-driven flow.

---

## 2. Backend architecture (Anilyst-Backend)

### 2.1 How it fits today

- **Agent:** `app/services/ai_data_analyst_agent.py` – tools in `create_interfaze_tools()`, execution in `execute_function_call()`.
- **New capability:** Add **lead-generation tools** (e.g. `search_leads`, `get_lead_details`, `send_outreach`) and a **lead results** payload in the chat response (same idea as `analysis_results` for charts).

### 2.2 New tools (conceptual)

| Tool | Purpose |
|------|--------|
| `search_leads` | Input: platform (linkedin \| x \| instagram), query (role/skill/industry), filters (location, limit). Calls platform-specific search/API. Returns list of lead IDs + minimal public info. |
| `get_lead_details` | Input: platform, lead_id. Returns name, headline, profile URL, optional extra fields (respecting ToS and privacy). |
| `send_outreach` | Input: platform, lead_id, message template. Sends DM/connection request **only if** user has connected that platform and we have consent/allowlist. Returns success/failure. |

Tool schemas and `execute_function_call` branches follow the same pattern as Stripe/Gmail.

### 2.3 Platform APIs – reality check

- **LinkedIn**  
  - Official “people search” for generic lead lists is **very restricted** (Lead Sync is for ads/events, not arbitrary search).  
  - In practice you’ll need **partner/third-party** (e.g. Linked API, Rapidity, etc.) or **approved use cases**.  
  - Outreach: connection requests / InMail depend on product and permissions; automation is limited by ToS.

- **X (Twitter)**  
  - **DMs:** Supported via API with **user OAuth** (`dm.write`, `dm.read`).  
  - You can send DMs on behalf of the **connected user** (like Gmail/Stripe in your app).  
  - Search: user search / keyword search exists; rate limits and access tiers apply.

- **Instagram**  
  - **Messaging API** is for **Business/Creator** accounts; **users must message you first** (or interact in a way that opens the 24h window).  
  - You **cannot** cold-DM arbitrary users via the official API.  
  - So “reach out on Instagram” is only for **replies** to existing conversations, not outbound lead outreach to new people.

**Implications:**

- **Finding people:** LinkedIn (third-party or restricted official), X (official search where available).  
- **Reaching out:** X DMs ✅ (with user OAuth). LinkedIn (connection/InMail if you have the product). Instagram ❌ for cold outreach; ✅ only for replying.

Store **platform credentials** like Stripe: per-user, server-side only (e.g. OAuth tokens in backend after “Connect LinkedIn/X”). No keys in frontend.

---

## 3. When the agent is done: Excel-like canvas for leads

**Requirement:** Show lead names and details in an **Excel-like format** in a **canvas-like** mode.

### 3.1 Data shape from backend

Agent response should include a structured block for leads (same idea as `analysis_results` for charts), e.g.:

```json
{
  "lead_results": {
    "platform": "linkedin",
    "query": "product managers fintech NYC",
    "leads": [
      {
        "id": "abc123",
        "name": "Jane Doe",
        "headline": "Product Manager at ...",
        "profile_url": "https://linkedin.com/in/...",
        "location": "New York, NY",
        "outreach_status": "not_sent"
      }
    ]
  }
}
```

Frontend can then render this in the leads canvas and later support “Send outreach” that calls `send_outreach` and updates `outreach_status`.

### 3.2 “Canvas-like” and “Excel-like” – UX/UI recommendation

- **Canvas-like** = a **focused, full-surface view** for one output (like a chart or a table), with minimal chrome, optional fullscreen.  
- **Excel-like** = **grid/table** with columns (Name, Headline, Profile URL, Location, Status, Actions), sortable/filterable, optional export.

**Suggested UI:**

1. **Placement**  
   - When the last assistant message contains `lead_results`, show a **“View leads”** (or “Open leads table”) button in the chat bubble.  
   - Clicking it opens a **Leads canvas** (see below).  
   - Optionally, also show a **compact inline table** (first 5 rows + “View all”) in the message, with the same “View all” opening the canvas.

2. **Leads canvas**  
   - **Mode:** A **slide-over panel** (right) or a **full-screen modal** that takes most of the viewport (similar to “maximized chart” in `output-display.tsx`).  
   - **Content:** A **data grid** (Excel-like):
     - Columns: Name, Headline, Location, Profile URL (link), Platform, Outreach status, Actions (e.g. “Send message”, “Open profile”).
     - Sticky header; horizontal scroll if many columns.
     - Sort by column (client-side for small lists; backend later if needed).
     - Optional: simple text filter per column.
   - **Toolbar:** “Export CSV”, “Select all”, “Send outreach to selected” (if you implement batch outreach).
   - **Close:** “Close” or “Back to chat” to return to the agent view.

3. **Component choice**  
   - **Option A (simplest):** Use your existing **shadcn `Table`** inside a scrollable container; add sort/filter with local state.  
   - **Option B:** Use **TanStack Table** (headless) + shadcn styling for a more “spreadsheet-like” feel (sorting, column visibility, future pagination).  
   - **Option C:** Use a grid library (e.g. **AG Grid** or **Tabulator**) if you want Excel-like behavior (keyboard nav, cell focus, etc.).  

**Recommendation:** Start with **Option A or B** (Table or TanStack Table) in a **full-screen modal** or **large slide-over**. Move to Option C only if users ask for heavy spreadsheet behavior.

4. **Visual style**  
   - Reuse dashboard/agent styling: dark theme, `bg-white/5`, borders `border-white/10`, same typography.  
   - Table: alternating row hover, clear column headers, link color for profile URLs.  
   - “Canvas” container: same rounded corners and backdrop as your charts/analysis panels so it feels part of the same product.

5. **Export**  
   - “Export CSV” in the toolbar: map `lead_results.leads` to rows and download (e.g. `name, headline, location, profile_url, platform, outreach_status`).

---

## 4. UX/UI summary

| Aspect | Recommendation |
|--------|----------------|
| **Where to access** | Agent as primary (user describes in chat); sidebar + Quick Action link to Agent with “Lead Gen” mode/starter prompt. |
| **After agent finds leads** | Assistant message includes `lead_results`; show “View leads” → open **Leads canvas**. |
| **Leads canvas** | Full-screen modal or large slide-over; Excel-like **table/grid** (Name, Headline, Location, Profile URL, Platform, Status, Actions). |
| **Table behavior** | Sort by column, optional filter; Export CSV; optional “Send outreach” per row or for selected rows. |
| **Components** | shadcn `Table` or TanStack Table in a scrollable container; reuse existing dark theme and panel styling. |
| **Outreach** | Only for platforms that allow it (X ✅, LinkedIn if you have the product; Instagram only for replies). |

---

## 5. Implementation order (suggested)

1. **Backend**  
   - Add `search_leads` (and optionally `get_lead_details`) with one platform first (e.g. X or a LinkedIn third-party).  
   - Return `lead_results` in the agent response when leads are found.  
   - Add OAuth flow and per-user token storage for that platform (similar to Stripe/Arcade).

2. **Frontend**  
   - Extend `Message` type and chat render to recognize `lead_results`.  
   - Add “View leads” and **Leads canvas** (modal/slide-over + table + Export CSV).  
   - Add sidebar item and Quick Action “Find leads” → Agent with mode/starter prompt.

3. **Outreach**  
   - Add `send_outreach` tool and “Send message” in the leads table; only enable for platforms that allow outbound DMs (e.g. X).  
   - Add consent/allowlist (e.g. “Only reach out to leads I approve”) and show a confirmation before sending.

4. **More platforms**  
   - Add LinkedIn (official or third-party) and document Instagram’s “reply-only” limitation in the UI.

This keeps the feature consistent with your existing agent and dashboard patterns while giving users a clear, Excel-like way to see and act on leads.
