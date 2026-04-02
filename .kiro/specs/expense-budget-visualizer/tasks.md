# Tasks: Expense & Budget Visualizer

## Task List

- [ ] 1. Refactor script.js to extract pure logic functions
  - [ ] 1.1 Extract calculateBalance(transactions) returning sum of amounts
  - [ ] 1.2 Extract formatRupiah(amount) returning Rp-prefixed id-ID locale string
  - [ ] 1.3 Extract validateTransaction(name, amount, category) returning {valid, errors}
  - [ ] 1.4 Extract validateCategory(name, existing) returning {valid, error}
  - [ ] 1.5 Extract sortTransactions(transactions, sortOrder) returning sorted shallow copy
  - [ ] 1.6 Extract buildChartData(transactions, categories) returning {labels, data, colors}
  - [ ] 1.7 Wrap all localStorage reads and writes in try/catch with fallback to defaults

- [ ] 2. Replace alert-based validation with inline messages
  - [ ] 2.1 Add validation message elements to index.html for the transaction form
  - [ ] 2.2 Add validation message element for the custom category input
  - [ ] 2.3 Update addBtn handler to call validateTransaction and show or clear inline messages
  - [ ] 2.4 Update addCategoryBtn handler to call validateCategory and show or clear inline messages

- [ ] 3. Fix case-insensitive duplicate category check
  - [ ] 3.1 Update addCategoryBtn handler to compare lowercased new name against lowercased existing categories

- [ ] 4. Harden spending limit highlight logic
  - [ ] 4.1 Ensure renderList applies .highlight to each li only when total > spendingLimit and spendingLimit > 0
  - [ ] 4.2 Ensure updateBalance applies .over-limit only when total > spendingLimit and spendingLimit > 0
  - [ ] 4.3 Ensure both classes are removed when the condition is not met

- [ ] 5. Set up test infrastructure
  - [ ] 5.1 Create package.json with vitest and fast-check as dev dependencies
  - [ ] 5.2 Create vitest.config.js with jsdom environment
  - [ ] 5.3 Create tests/unit and tests/property directory structure

- [ ] 6. Write unit tests
  - [ ] 6.1 tests/unit/transactions.test.js covering add valid, add invalid, delete, and balance recalculation
  - [ ] 6.2 tests/unit/categories.test.js covering add valid, reject same-case duplicate, reject different-case duplicate, reject empty
  - [ ] 6.3 tests/unit/formatting.test.js covering format 0, 15000, and 1500000
  - [ ] 6.4 tests/unit/sorting.test.js covering all four sort modes and default insertion order
  - [ ] 6.5 tests/unit/spendingLimit.test.js covering limit persistence, highlight applied, highlight removed, and limit zero inactive

- [ ] 7. Write property-based tests
  - [ ] 7.1 tests/property/transactions.prop.js for P1 valid add persisted, P2 invalid rejected, P3 form cleared, P4 balance equals sum, P6 delete control per item, P7 delete removes from state and storage
  - [ ] 7.2 tests/property/formatting.prop.js for P5 Rupiah format holds for any non-negative amount
  - [ ] 7.3 tests/property/categories.prop.js for P9 valid category persisted, P10 duplicate or empty rejected, P11 categories loaded on init
  - [ ] 7.4 tests/property/sorting.prop.js for P12 sort order correct and stored data unchanged
  - [ ] 7.5 tests/property/spendingLimit.prop.js for P13 limit persisted, P14 highlights when over limit, P15 no highlights when within limit or limit zero
  - [ ] 7.6 tests/property/chart.prop.js for P8 chart labels equal categories with non-zero spending
