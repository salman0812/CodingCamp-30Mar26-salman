# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly web application that enables users to track daily spending. Users can log transactions with a name, amount, and category; view a running total balance; visualize spending distribution via a pie chart; manage custom categories; sort transactions; and receive visual alerts when spending exceeds a configured limit. All data persists locally in the browser via LocalStorage.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single spending entry consisting of an item name, a monetary amount, and a category.
- **Category**: A label used to group transactions (e.g., Food, Transport, Fun).
- **Custom_Category**: A user-defined Category added at runtime.
- **Transaction_List**: The rendered list of all recorded Transactions.
- **Balance**: The sum of all Transaction amounts currently stored.
- **Spending_Limit**: An optional numeric threshold set by the user against which the Balance is compared.
- **Pie_Chart**: A circular chart that displays the proportion of spending per Category.
- **LocalStorage**: The browser's built-in key-value persistence mechanism used to store Transactions, Categories, and the Spending_Limit across sessions.
- **Sort_Order**: The user-selected ordering applied to the Transaction_List (default, amount ascending, amount descending, or category alphabetical).

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to submit a new spending entry with a name, amount, and category, so that I can record my daily expenses.

#### Acceptance Criteria

1. THE App SHALL provide an input form containing a text field for item name, a numeric field for amount, and a dropdown for category selection.
2. WHEN the user submits the form with a valid item name, a positive numeric amount, and a selected category, THE App SHALL append a new Transaction to the Transaction_List and persist it to LocalStorage.
3. WHEN the user submits the form and any required field (item name, amount, or category) is empty or invalid, THE App SHALL display an inline validation message and SHALL NOT create a Transaction.
4. WHEN a Transaction is successfully added, THE App SHALL clear all form input fields.

---

### Requirement 2: Display Total Balance

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much I have spent overall.

#### Acceptance Criteria

1. THE App SHALL display the Balance as the sum of all Transaction amounts.
2. WHEN a Transaction is added or deleted, THE App SHALL recalculate and update the Balance immediately.
3. THE App SHALL format the Balance using the Indonesian Rupiah locale (e.g., "Rp 15.000").

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to remove an incorrect or unwanted transaction, so that my records stay accurate.

#### Acceptance Criteria

1. THE Transaction_List SHALL render a delete control for each Transaction.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from LocalStorage.
3. WHEN a Transaction is deleted, THE App SHALL recalculate the Balance and refresh the Pie_Chart.

---

### Requirement 4: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending broken down by category, so that I can understand where my money goes.

#### Acceptance Criteria

1. THE App SHALL render a Pie_Chart that displays one segment per Category that has at least one Transaction.
2. WHEN a Transaction is added or deleted, THE App SHALL update the Pie_Chart to reflect the current spending distribution.
3. THE Pie_Chart SHALL label each segment with the Category name and SHALL display a legend.
4. WHEN no Transactions exist, THE App SHALL render an empty or placeholder state for the Pie_Chart.

---

### Requirement 5: Manage Custom Categories

**User Story:** As a user, I want to create my own spending categories, so that I can organize expenses in a way that fits my lifestyle.

#### Acceptance Criteria

1. THE App SHALL provide a text input and an "Add" button for creating a Custom_Category.
2. WHEN the user submits a non-empty, unique category name, THE App SHALL add the Custom_Category to the category dropdown and persist it to LocalStorage.
3. WHEN the user submits a category name that already exists (case-insensitive), THE App SHALL display a validation message and SHALL NOT create a duplicate Category.
4. WHEN the user submits an empty category name, THE App SHALL display a validation message and SHALL NOT create a Category.
5. WHEN the App initializes, THE App SHALL load all persisted Categories from LocalStorage and populate the category dropdown.

---

### Requirement 6: Sort Transactions

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can quickly find and review specific entries.

#### Acceptance Criteria

1. THE App SHALL provide a sort control with the options: Default (insertion order), Amount Ascending, Amount Descending, and Category Alphabetical.
2. WHEN the user changes the Sort_Order, THE App SHALL re-render the Transaction_List in the selected order without modifying the underlying stored data.
3. WHILE a Sort_Order other than Default is active and a new Transaction is added, THE App SHALL re-render the Transaction_List in the current Sort_Order.

---

### Requirement 7: Set and Enforce a Spending Limit

**User Story:** As a user, I want to set a spending limit and receive a visual warning when I exceed it, so that I can stay within my budget.

#### Acceptance Criteria

1. THE App SHALL provide a numeric input field for the user to set a Spending_Limit.
2. WHEN the user sets a Spending_Limit, THE App SHALL persist it to LocalStorage.
3. WHEN the Balance exceeds the Spending_Limit and the Spending_Limit is greater than zero, THE App SHALL apply a distinct visual highlight to the Balance display.
4. WHEN the Balance exceeds the Spending_Limit and the Spending_Limit is greater than zero, THE App SHALL apply a distinct visual highlight to each Transaction item in the Transaction_List.
5. WHEN the Balance is less than or equal to the Spending_Limit, THE App SHALL remove any over-limit visual highlights.
6. WHEN the Spending_Limit is set to zero or left empty, THE App SHALL treat the limit as inactive and SHALL NOT apply over-limit highlights.

---

### Requirement 8: Persist Data Across Sessions

**User Story:** As a user, I want my transactions, categories, and spending limit to be saved between browser sessions, so that I do not lose my data on page refresh.

#### Acceptance Criteria

1. WHEN the App initializes, THE App SHALL load all Transactions, Categories, and the Spending_Limit from LocalStorage.
2. WHEN a Transaction is added or deleted, THE App SHALL synchronize the updated Transaction collection to LocalStorage.
3. WHEN a Custom_Category is added, THE App SHALL synchronize the updated Category list to LocalStorage.
4. WHEN the Spending_Limit is changed, THE App SHALL synchronize the updated Spending_Limit to LocalStorage.

---

### Requirement 9: Mobile-Friendly Layout

**User Story:** As a user on a mobile device, I want the app to be usable on a small screen, so that I can log expenses on the go.

#### Acceptance Criteria

1. THE App SHALL use a responsive layout that adapts to viewport widths of 320px and above.
2. WHEN the viewport width is 600px or less, THE App SHALL stack the Transaction_List and Pie_Chart vertically.
3. THE App SHALL render all interactive controls (inputs, buttons, dropdowns) at a minimum touch target size of 44x44 CSS pixels.
