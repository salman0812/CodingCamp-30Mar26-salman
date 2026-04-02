# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a vanilla HTML/CSS/JS single-page application that runs entirely in the browser. It lets users log spending transactions, view a running total balance, visualize category-level spending via a Chart.js pie chart, manage custom categories, sort the transaction list, and receive visual warnings when a configurable spending limit is exceeded. All state is persisted in `localStorage` — there is no backend.

The existing codebase (`index.html`, `css/style.css`, `js/script.js`) already implements a working prototype. This design formalizes the architecture, data models, and correctness properties to guide hardening and any remaining feature work.

---

## Architecture

The app follows a simple **Model → Render** pattern inside a single JS file:

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│  ┌──────────┐   events   ┌──────────────────────┐  │
│  │   DOM    │ ─────────► │   Event Handlers     │  │
│  │ (HTML)   │            │ (addBtn, deleteBtn,  │  │
│  └──────────┘            │  sortSelect, etc.)   │  │
│       ▲                  └──────────┬───────────┘  │
│       │ render()                    │ mutate        │
│       │                  ┌──────────▼───────────┐  │
│       └──────────────────│   In-Memory State    │  │
│                          │  transactions[]      │  │
│                          │  categories[]        │  │
│                          │  spendingLimit       │  │
│                          └──────────┬───────────┘  │
│                                     │ sync          │
│                          ┌──────────▼───────────┐  │
│                          │    localStorage      │  │
│                          │  'transactions'      │  │
│                          │  'categories'        │  │
│                          │  'spendingLimit'     │  │
│                          └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Key design decisions:**

- State lives in three module-level variables (`transactions`, `categories`, `spendingLimit`). Every mutation writes through to `localStorage` immediately.
- A single `render()` function orchestrates `updateBalance()`, `renderList()`, and `renderChart()` — keeping the UI always consistent with state.
- Chart.js is loaded from CDN. The chart instance is stored in `chart` and destroyed/recreated on each render to avoid canvas reuse issues.
- No build step, no bundler, no framework — the app is a static file that opens directly in a browser.

---

## Components and Interfaces

### 1. State Module (in-memory + localStorage)

Responsible for reading/writing the three persisted keys.

| Key | Type | Description |
|---|---|---|
| `transactions` | `Transaction[]` | All recorded spending entries |
| `categories` | `string[]` | All available category labels |
| `spendingLimit` | `number` | Active limit (0 = inactive) |

**Public operations (functions in `script.js`):**

- `addTransaction(name, amount, category)` — validates, appends, persists
- `deleteTransaction(id)` — filters out by id, persists
- `addCategory(name)` — validates uniqueness (case-insensitive), appends, persists
- `setSpendingLimit(value)` — parses, persists

### 2. Validation Layer

Inline validation before any state mutation:

- Transaction: name non-empty, amount is a finite positive number, category non-empty
- Category: name non-empty after trim, not already present (case-insensitive comparison)
- Spending limit: parsed as float; NaN or negative treated as 0 (inactive)

Validation failures surface as inline messages in the UI (not `alert()`).

### 3. Render Pipeline

`render()` calls three sub-renderers in order:

1. **`updateBalance()`** — sums all amounts, formats as `Rp X.XXX`, applies/removes `.over-limit` class
2. **`renderList()`** — sorts a shallow copy of `transactions` per `sortSelect.value`, builds `<li>` elements, applies `.highlight` class when over limit
3. **`renderChart()`** — aggregates amounts per category, destroys previous Chart.js instance, creates new pie chart

### 4. Chart.js Integration

- Library: Chart.js loaded via `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
- Chart type: `'pie'`
- Colors: generated with `hsl(i * 360/n, 70%, 60%)` — evenly spaced hues
- Empty state: when all category totals are 0, Chart.js renders an empty doughnut ring; no special handling needed beyond that

### 5. DOM Structure (existing `index.html`)

```
.container
  .balance-card          ← #total-balance
  .form-card             ← inputs + #add-btn, custom category row
  .bottom-row
    .list-card           ← #sort-select, #transaction-list
    .chart-card          ← #expense-chart (canvas)
```

---

## Data Models

### Transaction

```js
{
  id: number,       // Date.now() at creation — unique enough for single-user local app
  name: string,     // non-empty, trimmed
  amount: number,   // positive finite float
  category: string  // must exist in categories[]
}
```

### Category

A plain `string[]` stored under the key `'categories'` in localStorage. Default seed: `['Food', 'Transport', 'Fun']`.

Invariants:
- No duplicates (case-insensitive)
- No empty strings

### SpendingLimit

A single `number` stored under `'spendingLimit'`. `0` means inactive.

### localStorage Schema

```
localStorage['transactions']  = JSON.stringify(Transaction[])
localStorage['categories']    = JSON.stringify(string[])
localStorage['spendingLimit'] = String(number)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid transaction persisted to localStorage

*For any* valid transaction (non-empty name, positive amount, existing category), after calling `addTransaction`, the transaction should appear in `localStorage['transactions']` and the in-memory `transactions` array.

**Validates: Requirements 1.2, 8.2**

---

### Property 2: Invalid transaction rejected — list unchanged

*For any* input where at least one required field (name, amount, or category) is empty or invalid, calling the add handler should leave the `transactions` array at the same length as before.

**Validates: Requirements 1.3**

---

### Property 3: Form fields cleared after successful add

*For any* valid transaction submission, after the add completes, the item name input, amount input, and category select should all be empty/reset.

**Validates: Requirements 1.4**

---

### Property 4: Balance equals sum of transaction amounts

*For any* collection of transactions, the value displayed in `#total-balance` (parsed back to a number) should equal the arithmetic sum of all `transaction.amount` values.

**Validates: Requirements 2.1, 2.2, 3.3**

---

### Property 5: Balance formatted as Indonesian Rupiah

*For any* non-negative total amount, the formatted balance string should start with `"Rp"` and use the `id-ID` locale number format (period as thousands separator, no decimal for whole numbers).

**Validates: Requirements 2.3**

---

### Property 6: Every transaction item renders a delete control

*For any* non-empty `transactions` array, after `renderList()`, every `<li>` element in `#transaction-list` should contain exactly one delete button.

**Validates: Requirements 3.1**

---

### Property 7: Delete removes transaction from state and localStorage

*For any* transaction that exists in the list, calling `deleteTransaction(id)` should result in that transaction no longer being present in the in-memory array or in `localStorage['transactions']`.

**Validates: Requirements 3.2**

---

### Property 8: Chart labels match categories with non-zero spending

*For any* set of transactions, the labels in the Chart.js dataset should exactly equal the subset of categories whose summed transaction amounts are greater than zero.

**Validates: Requirements 4.1, 4.2, 4.3**

---

### Property 9: Valid new category persisted and available in dropdown

*For any* non-empty category name that does not already exist (case-insensitive), after `addCategory`, the name should appear in `categories[]`, in `localStorage['categories']`, and as an `<option>` in `#item-category`.

**Validates: Requirements 5.2, 8.3**

---

### Property 10: Duplicate or empty category name rejected

*For any* category name that is either empty/whitespace or already present in `categories[]` (case-insensitive), calling the add handler should leave `categories[]` at the same length as before.

**Validates: Requirements 5.3, 5.4**

---

### Property 11: Categories loaded from localStorage on initialization

*For any* `categories` array written to `localStorage['categories']` before the script initializes, the in-memory `categories` variable should equal that array after initialization, and all entries should appear in `#item-category`.

**Validates: Requirements 5.5, 8.1**

---

### Property 12: Sort order applied correctly without mutating stored data

*For any* set of transactions and any sort option (amount-asc, amount-desc, category), the rendered list order should match the expected sort, and the underlying `transactions` array should remain in its original insertion order.

**Validates: Requirements 6.2, 6.3**

---

### Property 13: Spending limit persisted to localStorage

*For any* numeric value set via the spending limit input, `localStorage['spendingLimit']` should equal that value after the change event fires.

**Validates: Requirements 7.2, 8.4**

---

### Property 14: Over-limit highlights applied when balance exceeds active limit

*For any* state where the total balance exceeds a spending limit that is greater than zero, `#total-balance` should have the `.over-limit` CSS class and every `<li>` in `#transaction-list` should have the `.highlight` CSS class.

**Validates: Requirements 7.3, 7.4**

---

### Property 15: Over-limit highlights absent when balance is within limit or limit is inactive

*For any* state where the total balance is less than or equal to the spending limit, or where the spending limit is zero, neither `#total-balance` nor any `<li>` in `#transaction-list` should carry the over-limit/highlight CSS classes.

**Validates: Requirements 7.5, 7.6**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty/whitespace item name | Show inline validation message; block submission |
| Non-positive or non-numeric amount | Show inline validation message; block submission |
| No category selected | Show inline validation message; block submission |
| Duplicate category name (case-insensitive) | Show inline validation message; block addition |
| Empty category name | Show inline validation message; block addition |
| `localStorage` unavailable (private browsing, quota exceeded) | Wrap `localStorage` writes in try/catch; degrade gracefully (state still works in-memory for the session) |
| Chart.js CDN unavailable | Chart canvas remains blank; all other features continue to work |
| Corrupted `localStorage` JSON | `JSON.parse` wrapped in try/catch; fall back to empty array / default values |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- **Unit tests** cover specific examples, integration points, and edge cases
- **Property-based tests** verify universal properties across randomly generated inputs

### Property-Based Testing

**Library:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, no build step required via CDN or npm)

**Configuration:** Each property test runs a minimum of **100 iterations**.

**Tag format:** Each test must include a comment:
```
// Feature: expense-budget-visualizer, Property N: <property text>
```

Each correctness property above maps to exactly one property-based test:

| Property | Test description | fast-check arbitraries |
|---|---|---|
| P1 | Valid transaction add → in state + localStorage | `fc.string()`, `fc.float({min:0.01})`, `fc.constantFrom(...categories)` |
| P2 | Invalid input → list length unchanged | `fc.oneof(emptyString, negativeFloat, fc.constant(''))` |
| P3 | Form cleared after add | same as P1 |
| P4 | Balance = sum of amounts | `fc.array(transactionArb)` |
| P5 | Balance formatted as Rupiah | `fc.float({min:0})` |
| P6 | Every list item has delete button | `fc.array(transactionArb, {minLength:1})` |
| P7 | Delete removes from state + localStorage | `fc.array(transactionArb, {minLength:1})` + pick random id |
| P8 | Chart labels = categories with spend > 0 | `fc.array(transactionArb)` |
| P9 | New category persisted + in dropdown | `fc.string({minLength:1})` filtered for uniqueness |
| P10 | Duplicate/empty category rejected | existing category name or whitespace string |
| P11 | Categories loaded from localStorage on init | `fc.array(fc.string({minLength:1}))` |
| P12 | Sort correct + stored data unchanged | `fc.array(transactionArb)` + `fc.constantFrom('amount-asc','amount-desc','category')` |
| P13 | Spending limit persisted | `fc.float({min:0})` |
| P14 | Over-limit highlights present when balance > limit > 0 | `fc.array(transactionArb, {minLength:1})` + limit < sum |
| P15 | No highlights when balance ≤ limit or limit = 0 | `fc.array(transactionArb)` + limit ≥ sum or limit = 0 |

### Unit Tests

Unit tests focus on:

- **Specific examples**: adding a "Coffee / Rp 15000 / Food" transaction and verifying the exact rendered output
- **Edge cases**: empty localStorage on first load, single transaction, all transactions in one category
- **Integration**: full add → delete → balance cycle
- **Error conditions**: each invalid input combination triggers the correct validation message

### Test File Structure

```
tests/
  unit/
    transactions.test.js   ← add, delete, balance calculation
    categories.test.js     ← add, duplicate check, load from storage
    formatting.test.js     ← Rupiah locale formatting
    sorting.test.js        ← all four sort modes
    spendingLimit.test.js  ← limit persistence, highlight logic
  property/
    transactions.prop.js   ← P1–P4, P6–P8
    categories.prop.js     ← P9–P11
    sorting.prop.js        ← P12
    spendingLimit.prop.js  ← P13–P15
    formatting.prop.js     ← P5
```
