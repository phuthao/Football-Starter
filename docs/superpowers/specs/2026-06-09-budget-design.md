# Budget / Finance Module — Design Spec
_Date: 2026-06-09_

## Overview

Add a Budget/Finance module to the Football Team Randomizer app. One admin manages all data (players, teams, budget) across multiple devices via Supabase sync. No multi-user system — a single hardcoded password protects the account.

---

## Goals

1. Track income and expenses per football session
2. Maintain a cumulative fund balance (tồn quỹ) across all sessions
3. Dashboard view of budget summary
4. Share bill per session (PNG export + clipboard text)
5. Data persists across devices (phone ↔ computer) via Supabase

---

## Data Model

### New types (added to `src/types.ts`)

```typescript
export type IncomeType = 'fund' | 'match' | 'sponsor'
export type ExpenseType = 'pitch' | 'water' | 'other'

export interface IncomeItem {
  type: IncomeType
  amount: number           // VNĐ, 0 if not used
}

export interface ExpenseItem {
  type: ExpenseType
  label?: string           // required when type === 'other'
  amount: number           // VNĐ
}

export interface BudgetEntry {
  id: string
  createdAt: string        // ISO 8601
  sessionId?: string       // links to HistoryEntry.id (optional)
  note?: string            // e.g. "Nạp quỹ đầu mùa"
  income: IncomeItem[]     // always 3 items (fund/match/sponsor), amount=0 if unused
  expenses: ExpenseItem[]  // pitch + water always present, then N 'other' items
}
```

### AppState additions

```typescript
budget: BudgetEntry[]
budgetEditorOpen: boolean
editingBudget: BudgetEntry | null
budgetExportOpen: boolean
exportingBudget: BudgetEntry | null
```

### Derived value (not stored)

```
tồnQuỹ = Σ income[i].amount − Σ expense[i].amount   (across ALL BudgetEntry[])
netEntry = Σ income − Σ expenses                      (per BudgetEntry)
```

### localStorage key

`ftr.budget` — serialized `BudgetEntry[]`

---

## Auth & Sync

### Credentials

- Stored in `.env`: `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`
- Never shown in UI; login screen only has a password field
- Supabase `signInWithPassword` called automatically with the hardcoded email

### Auth flow

```
App launch
  → Supabase session exists?  → Yes → load from Supabase (skip login screen)
                              → No  → show login screen
Login screen
  → user enters password
  → correct → Supabase signIn → merge localStorage → Supabase → enter app
  → wrong   → show error message
```

### Sync strategy

| State | Data source | Write target |
|---|---|---|
| Offline (not logged in) | localStorage | localStorage |
| Online (logged in) | Supabase | Supabase + localStorage cache |
| First login | localStorage | merge up to Supabase, then Supabase primary |

Merge rule on first login: Supabase wins on conflict (same `id`), local-only entries are uploaded.

### Supabase schema

Three tables, all with `user_id` (Supabase auth UID) for row-level security:

```sql
create table players (
  id text primary key,
  user_id uuid references auth.users not null,
  data jsonb not null
);

create table budget (
  id text primary key,
  user_id uuid references auth.users not null,
  data jsonb not null
);

create table sessions (
  id text primary key,
  user_id uuid references auth.users not null,
  data jsonb not null
);

-- Row Level Security: user can only read/write their own rows
alter table players enable row level security;
alter table budget  enable row level security;
alter table sessions enable row level security;

create policy "own rows" on players  for all using (auth.uid() = user_id);
create policy "own rows" on budget   for all using (auth.uid() = user_id);
create policy "own rows" on sessions for all using (auth.uid() = user_id);
```

`data` is a `jsonb` column holding the full TypeScript object — avoids schema migrations when types evolve.

---

## UI

### Navigation

Tab **Lịch sử** gets a segment control at the top: `Đội | Ngân sách`

No new bottom nav tab — budget lives inside the existing History tab.

### Budget Screen (`src/screens/BudgetScreen.tsx`)

```
┌──────────────────────────────────────┐
│  DASHBOARD CARD  (teal gradient)     │
│  Tổng Thu      Tổng Chi    Tồn Quỹ  │
│  2,500,000 ₫  800,000 ₫  1,700,000 ₫│
└──────────────────────────────────────┘

[ Entry list — newest first ]

┌──────────────────────────────────────┐
│ ⚽ Trận 08/06  (linked to session)   │
│ Thu 500,000 ₫ · Chi 300,000 ₫        │
│                          +200,000 ₫ →│
├──────────────────────────────────────┤
│ 💰 Nạp quỹ đầu mùa                  │
│ Thu 2,000,000 ₫ · Chi 500,000 ₫      │
│                        +1,500,000 ₫ →│
└──────────────────────────────────────┘

                         [ + Thêm khoản ]  ← FAB bottom-right
```

Tapping an entry opens BudgetEditor for editing.

Negative `tồnQuỹ` displays in normal color (no warning per spec).

### BudgetEditor Sheet (`src/components/BudgetEditor.tsx`)

Full-height bottom sheet.

```
┌──────────────────────────────────────┐
│ Thêm khoản / Sửa khoản        [✕]   │
├──────────────────────────────────────┤
│ Gắn trận  [dropdown: none / sessions]│
│ Ghi chú   [text input]               │
│                                      │
│ ── THU ─────────────────────────── │
│ Tiền quỹ      [            500,000] │
│ Tiền trận     [            300,000] │
│ Tài trợ       [                  0] │
│                                      │
│ ── CHI ─────────────────────────── │
│ Tiền Sân      [            200,000] │
│ Tiền Nước     [             50,000] │
│ [tên khoản ]  [             30,000] │  ← 'other' rows
│ [tên khoản ]  [                  0] │
│              [ + Thêm khoản khác  ] │
│                                      │
│ [ Tóm tắt: Thu 800,000 · Chi 280,000 · Net +520,000 ] │
│                                      │
│ [           Lưu khoản              ] │
│ [           Xoá khoản              ] │  ← only when editing
└──────────────────────────────────────┘
```

All amount fields: numeric input, suffix `₫`, formatted with thousand separators on blur.

### Share Bill (`src/components/BudgetExportSheet.tsx`)

Opened from a share button (📤) on each BudgetEntry row.

**PNG export** — canvas render matching app color scheme:

```
┌────────────────────────────┐
│  ⚽ BILL TRẬN  08/06/2026  │
│ ────────────────────────── │
│  THU                        │
│    Tiền quỹ    500,000 ₫   │
│    Tiền trận   300,000 ₫   │
│ ────────────────────────── │
│  CHI                        │
│    Tiền Sân    200,000 ₫   │
│    Tiền Nước    50,000 ₫   │
│    Mua bóng     30,000 ₫   │
│ ────────────────────────── │
│  Kỳ này:      +520,000 ₫   │
│  Tồn quỹ:   1,700,000 ₫   │
└────────────────────────────┘
```

**Copy text** — clipboard button copies formatted plain text (same layout as above, no emoji borders).

---

## New Files

| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | Supabase client init, auth helpers |
| `src/lib/sync.ts` | push/pull per table, merge-on-first-login logic |
| `src/screens/BudgetScreen.tsx` | Dashboard + entry list |
| `src/components/BudgetEditor.tsx` | Add/edit sheet |
| `src/components/BudgetExportSheet.tsx` | PNG + copy text share |

## Modified Files

| File | Change |
|---|---|
| `src/types.ts` | Add `BudgetEntry`, `IncomeItem`, `ExpenseItem`, `IncomeType`, `ExpenseType`; extend `AppState` |
| `src/lib/storage.ts` | Add `loadBudget()`, `saveBudget()` |
| `src/store/AppContext.tsx` | Add budget actions; add auth state + sync triggers |
| `src/screens/HistoryScreen.tsx` | Add segment control `Đội | Ngân sách`; render `BudgetScreen` |
| `src/App.tsx` | Add auth gate (login screen); wire BudgetExportSheet |
| `.env.example` | Add `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

---

## Out of Scope

- Multi-user / role system
- Budget per-player breakdown
- Recurring income/expense templates
- Budget analytics / charts
- Push notifications
