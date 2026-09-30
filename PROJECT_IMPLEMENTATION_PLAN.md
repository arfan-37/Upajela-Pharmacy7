# PROJECT_IMPLEMENTATION_PLAN.md
## Upazila Pharmacy Management System — Master Implementation Plan

**Created:** 2026-08-13
**Status:** Analysis Complete — Ready for Implementation
**Scope:** All bugs, data inconsistencies, security issues, and production-readiness gaps identified across the entire codebase.

---

## 0. CRITICAL FIXES (Block Everything Else)

These are showstopper bugs that will cause data loss, crashes, or incorrect financial calculations.

### Task 0.1 — Fix mockData.js Array Syntax Errors
**Files:** `src/utils/mockData.js`
**Severity:** Critical
**Description:** `initialCompanies`, `initialCustomers`, and `initialTransactions` arrays start with a stray comma (`[,`) creating a hole at index 0. When localStorage is empty, the first element is `undefined`, causing `normalizeCompany(undefined)` and `normalizeCustomer(undefined)` to produce empty ghost records.

**Fix:**
- Remove the stray comma after the opening bracket on lines 776, 1116, and 1532.
- Change `export const initialCompanies = [,` to `export const initialCompanies = [`
- Change `export const initialCustomers = [,` to `export const initialCustomers = [`
- Change `export const initialTransactions = [,` to `export const initialTransactions = [`

**Testing:**
- Clear localStorage and reload the app.
- Verify companies list shows exactly the seed companies (no empty ghost row).
- Verify customers list shows exactly the seed customers.
- Verify transactions list shows exactly the seed transactions.

---

### Task 0.2 — Fix Stale State in `generateDailyReport` After Returns
**Files:** `src/App.jsx`
**Severity:** Critical
**Description:** In `handleProcessReturn`, `generateDailyReport()` is called with the current `returns` state variable. However, `setReturns(prev => [...returnRecords, ...prev])` is asynchronous. The `returns` variable in the closure still holds the OLD value, so the newly processed return is NOT included in the regenerated daily report.

**Fix:**
- Compute the updated returns array first: `const updatedReturns = [...returnRecords, ...returns];`
- Pass `updatedReturns` to `generateDailyReport`.
- Then call `setReturns(updatedReturns);`

**Testing:**
- Process a return for an item that was sold today.
- Open Financial Reports and verify the return appears in today's report.
- Verify `totalReturnRefunds` and `totalDueAdjusted` increase correctly.

---

### Task 0.3 — Eliminate Nested State Updates (`setShopBalance` inside `setCustomers`)
**Status:** ✅ COMPLETED
**Files:** `src/App.jsx`, `src/components/CustomerPanel.jsx`
**Severity:** Critical
**Description:** Three handlers call `setShopBalance` inside the `setCustomers` updater function:
1. `handleRecordCustomerSale` (line ~561) - **ALREADY FIXED** ✅
2. `handleReceivePayment` (line ~621) - **FIXED** ✅
3. `handleProcessReturn` (line ~654) - **ALREADY FIXED** ✅

This violates React state update rules and can cause race conditions, lost updates, or React warnings in StrictMode.

**Fix Applied:**
- Compute all values first in a temporary variable before calling `setCustomers`.
- Call `setShopBalance` separately after `setCustomers`.

**Testing:**
- Perform a cash sale and verify shop balance increases correctly.
- Receive a customer payment and verify shop balance increases.
- Process a return with cash refund and verify shop balance decreases.
- Check browser console for React state update warnings — there should be none.

---

### Task 0.4 — Fix Returns Not Updating `dueEntries`
**Files:** `src/App.jsx`
**Severity:** Critical
**Description:** When a return is processed for a due/partial sale, `handleProcessReturn` updates `paymentHistory` with a return entry but does NOT update `dueEntries`. Over time, `dueEntries` becomes out of sync with `paymentHistory`, showing stale due amounts in Customer Panel history.

**Fix:**
- Inside `handleProcessReturn`, after computing `newDue` and `cashRefund`, append a return entry to `dueEntries`:
  ```js
  const nextDueEntries = [
    ...(normalized.dueEntries || []),
    {
      id: `return-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: 'return',
      createdAt: new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      invoiceNumber: originalTransaction.id,
      products: returnItems.map(r => ({ ... })),
      totalAmount: totalRefund,
      cashAmount: cashRefund,
      dueAmount: 0,
      totalOutstandingDue: newDue,
      paymentType: 'return'
    }
  ];
  ```
- Include `dueEntries: nextDueEntries` in the returned customer object.

**Testing:**
- Create a due sale for a customer.
- Process a partial return.
- Open Customer Panel -> View History.
- Verify the return appears in both `dueEntries` and `paymentHistory` with correct amounts.

---

### Task 0.5 — Fix Return Inventory/Medicine History Stock Values
**Files:** `src/App.jsx`
**Severity:** High
**Description:** In `handleProcessReturn`, inventory and medicine history records for returns hardcode `previousStock: 0` and `newTotalStock: 0`. This makes the history useless for auditing — it shows the stock went from 0 to 0 instead of the actual before/after values.

**Fix:**
- Before updating batches, capture the actual previous stock for each batch.
- After updating, capture the actual new stock.
- Use these real values in `addInventoryHistoryRecord` and `addMedicineHistoryRecord`.

**Testing:**
- Process a return for a medicine with known batch stock (e.g., batch has 10 units, return 2).
- Open Inventory -> View History for that medicine.
- Verify the return record shows `Previous Stock: 10`, `Added/Removed: +2`, `Current Stock: 12`.

---

### Task 0.6 — Fix Financial Reports `dueCollected` Double-Counting
**Files:** `src/utils/financialReports.js`
**Severity:** High
**Description:** In `updateCustomerMetrics`, return entries with `type: 'return'` add `cashPaid` to `dueCollected`. This is wrong — cash refunds should NOT increase "due collected". Additionally, `buildReportFromTransactions` does NOT recalculate `totalDueCollected` and `totalCustomerDueCreated`; it retains stale values from the existing report object.

**Fix:**
- In `updateCustomerMetrics`, remove the block that adds `cashRefund` to `dueCollected` for returns.
- In `buildReportFromTransactions`, explicitly calculate `totalDueCollected` and `totalCustomerDueCreated` from the day's customer payment entries, OR ensure `updateCustomerMetrics` fully overwrites these fields (which it already does, but `buildReportFromTransactions` was setting them to stale values).

**Testing:**
- Create a cash sale (no due).
- Process a return with cash refund.
- Open Financial Reports for today.
- Verify `Due Collected` does NOT increase because of the return.
- Verify `Return Refunds` shows the cash refund amount.

---

### Task 0.7 — Fix POS Cart Stale Stock Reference
**Status:** ✅ COMPLETED
**Files:** `src/components/POS.jsx`
**Severity:** High
**Description:** When items are added to cart, the cart item copies the medicine object including `stock`. If stock changes elsewhere (another sale, restock), the cart item's `stock` field becomes stale. The quantity update handlers (`updateCartQty`, `updateCartStrips`, `updateCartLoose`) use this stale `stock` to enforce limits, allowing overselling.

**Fix Applied:**
- Removed stock storage from cart items
- Updated quantity handlers to look up current medicine stock from `medicines` prop instead of cart item
- Cart now validates against real-time inventory

**Testing:**
- Add medicine with 5 stock to cart
- Reduce stock to 2 elsewhere
- Try to increase cart quantity - should be capped at 2
- Verify real-time stock validation working

---

### Task 0.8 — Fix Company Transaction Edit Loses `dueDate`
**Status:** ✅ COMPLETED
**Files:** `src/App.jsx`
**Severity:** Medium
**Description:** `handleEditCompanyTransaction` creates a new transaction object that omits `dueDate`. If a company purchase had a due date, it is permanently lost after editing.

**Fix Applied:**
- Added `dueDate: tx.dueDate` to transaction editing logic
- Ensure `dueDate` is preserved when editing company transactions

**Testing:**
- Create company purchase with due date
- Edit the purchase amount
- Verify due date is preserved in Company Panel history

---

### Task 0.9 — Fix Reports Print Duplicate Sales Transactions
**Status:** ✅ COMPLETED
**Files:** `src/components/Reports.jsx`
**Severity:** Medium
**Description:** `handlePrint` renders `report.salesTransactions` twice in the print HTML (lines 184–236 and 222–236). This causes duplicate rows in printed reports.

**Fix Applied:**
- Removed duplicate block (lines 222–236)
- Reports now print clean, non-duplicated sales data

**Testing:**
- Generate report with sales transactions
- Click Print
- Verify each sale appears exactly once in print preview

---

### Task 0.10 — Fix `selectedCustomer` Stale Reference in Returns
**Status:** ✅ COMPLETED
**Files:** `src/components/Returns.jsx`
**Severity:** Medium
**Description:** `selectedCustomer` is stored in local state via `selectCustomer(customer)`. If the parent `customers` prop updates (e.g., due amount changes from a payment), the local `selectedCustomer` object does not refresh. This can show stale due amounts in the refund breakdown.

**Fix Applied:**
- Added `useEffect` hook in Returns component to synchronize `selectedCustomer` with `customers` prop
- When `customers` array changes, refetches the current `selectedCustomer` data
- Ensures Returns UI always shows current customer information

**Testing:**
- Select a customer in Returns
- In another panel, receive a payment for that customer
- Return to Returns - verify refund breakdown shows updated due amount

---

## 1. DATA CONSISTENCY & BUSINESS LOGIC

### Task 1.1 — Enforce `expectedTotal` for Companies
**Files:** `src/App.jsx` (`normalizeCompany`)
**Severity:** Medium
**Description:** `normalizeCustomer` enforces `totalPurchaseAmount >= cashPaid + dueAmount`, but `normalizeCompany` does not. This can lead to inconsistent company balances where `totalPurchaseAmount < amountPaid + dueAmount`.

**Fix:**
- Add the same guard to `normalizeCompany`:
  ```js
  const expectedTotal = Number((amountPaid + dueAmount).toFixed(2));
  if (totalPurchaseAmount < expectedTotal) {
    totalPurchaseAmount = expectedTotal;
  }
  ```

**Testing:**
- Manually edit a company's `totalPurchaseAmount` to a low value via dev tools.
- Reload app and verify it auto-corrects.

---

### Task 1.2 — Prevent ID Collisions for Generated IDs
**Files:** `src/App.jsx`
**Severity:** Medium
**Description:** Generated IDs use `Date.now()` + random suffix. In high-frequency scenarios (rapid clicks, multi-tab), collisions are possible. Colliding IDs break `buildTransactionIndex` and customer lookups.

**Fix:**
- Replace `Date.now()` with `crypto.randomUUID()` where available, or use a monotonic counter stored in a ref.
- For customer/medicine/company IDs, include a role prefix and a longer random suffix.

**Testing:**
- Rapidly create 50 customers and verify all IDs are unique.
- Rapidly create 50 transactions and verify all IDs are unique.

---

### Task 1.3 — Preserve `dueDate` on Company Transaction Edit
**Files:** `src/App.jsx`
**Severity:** Medium
**Description:** Task 0.8 covers the immediate fix. Additionally, ensure `paymentDate` logic is correct: if `amountPaid >= totalAmount`, set `paymentDate` to the purchase date; otherwise, clear it only if it was previously set.

**Testing:**
- Edit a fully-paid purchase to become partially paid.
- Verify `paymentDate` is cleared.
- Edit it back to fully paid.
- Verify `paymentDate` is restored.

---

### Task 1.4 — Fix `getOldestOutstandingDueDate` Mutation
**Files:** `src/utils/customerHistory.js`
**Severity:** Low
**Description:** `getOldestOutstandingDueDate` mutates the `pendingDues` array in place using `shift()` and direct property modification. If the same history array is reused elsewhere, this causes subtle bugs.

**Fix:**
- Clone `pendingDues` at the start: `const pending = [...pendingDues];`
- Operate on the clone.

**Testing:**
- Call `getOldestOutstandingDueDate` twice with the same customer history.
- Verify both calls return the same result (no side effects).

---

### Task 1.5 — Standardize `dueEntries` vs `paymentHistory` Sync
**Files:** `src/App.jsx`, `src/utils/customerHistory.js`
**Severity:** Medium
**Description:** Sales add to both `dueEntries` and `paymentHistory`. Payments add to both. Returns add to `paymentHistory` only (Task 0.4 fixes the immediate bug). Over time, the two arrays can diverge.

**Fix:**
- After every mutation to `paymentHistory`, rebuild `dueEntries` from the rebuilt timeline, keeping only the entries needed for the UI (sales and payments, with running totals).
- OR, deprecate `dueEntries` entirely and compute it on-the-fly in `CustomerPanel` from `paymentHistory`.

**Testing:**
- Perform a sale, payment, and return.
- Verify `dueEntries` and `paymentHistory` contain matching entries.

---

### Task 1.6 — Fix `normalizeCompany` Missing `expectedTotal` Guard
**Files:** `src/App.jsx`
**Severity:** Low
**Description:** Covered in Task 1.1.

---

## 2. SECURITY

### Task 2.1 — Replace Hardcoded Passwords with Configurable Auth
**Files:** `src/components/Login.jsx`, `src/App.jsx`
**Severity:** High
**Description:** Passwords are hardcoded as `'admin'` and `'staff'`. Anyone can read the source and log in as Admin.

**Fix:**
- Move passwords to environment variables (`VITE_ADMIN_PASSWORD`, `VITE_STAFF_PASSWORD`) or a config file.
- Hash passwords using a simple client-side hash (e.g., SHA-256 via Web Crypto API) so plaintext is not in localStorage.
- Add a configurable user management screen for Admin to change passwords.

**Testing:**
- Change the admin password.
- Verify old password no longer works.
- Verify new password works.

---

### Task 2.2 — Implement Session Timeout
**Files:** `src/App.jsx`
**Severity:** Medium
**Description:** Sessions never expire. If a user leaves the browser open, anyone can access the system.

**Fix:**
- Store login timestamp in localStorage.
- On mount, check if session is older than X hours (e.g., 8 hours).
- Auto-logout and require re-authentication.
- Reset timer on user activity.

**Testing:**
- Log in, wait past timeout, refresh page.
- Verify redirected to login screen.

---

### Task 2.3 — Secure FinanceAuth PIN
**Files:** `src/components/FinanceAuth.jsx`
**Severity:** Medium
**Description:** PIN is stored in plain text in localStorage. It can be read or modified by anyone with browser access.

**Fix:**
- Store a salted hash of the PIN instead of the PIN itself.
- When verifying, hash the input and compare.
- Add a PIN change feature in FinanceAuth.

**Testing:**
- Set a PIN.
- Verify localStorage stores a hash, not the plain PIN.
- Verify PIN change works.

---

### Task 2.4 — Add Input Sanitization
**Files:** All components with text inputs
**Severity:** Medium
**Description:** User inputs (customer names, medicine names, etc.) are stored and rendered without sanitization. While XSS is limited in a localStorage-only app, it can still occur if data is exported/printed.

**Fix:**
- Sanitize text inputs before storing (strip HTML tags, escape special characters).
- Use `textContent` instead of `innerHTML` where possible.
- Sanitize data before rendering in print/CSV export.

**Testing:**
- Enter `<script>alert(1)</script>` as a customer name.
- Verify it renders as text, not executed script.

---

## 3. PRODUCTION READINESS

### Task 3.1 — Add Error Boundaries
**Files:** `src/App.jsx` (new `ErrorBoundary.jsx`)
**Severity:** High
**Description:** Any uncaught error in a component crashes the entire app with no recovery.

**Fix:**
- Create an `ErrorBoundary` component.
- Wrap each major view (POS, Inventory, Reports, etc.) in its own boundary.
- Show a recovery UI with a "Reload" button.

**Testing:**
- Simulate an error in POS by throwing in a useEffect.
- Verify the rest of the app remains functional.

---

### Task 3.2 — Add Data Validation on localStorage Load
**Files:** `src/App.jsx`, `src/utils/`
**Severity:** High
**Description:** If localStorage data is corrupted (e.g., manual edit, storage quota exceeded), `JSON.parse` fails silently and returns fallback data, potentially mixing old seed data with partial saved data.

**Fix:**
- Add schema validation for loaded data (check required fields, types).
- If validation fails, show a recovery modal: "Data corrupted. Reset to defaults or attempt repair?"
- Backup localStorage before any write operation.

**Testing:**
- Manually corrupt `shabab_medicines` in localStorage.
- Reload app and verify graceful fallback.

---

### Task 3.3 — Add Data Export / Backup Feature
**Files:** `src/components/Settings.jsx` (new)
**Severity:** Medium
**Description:** Users have no way to backup their data. If localStorage is cleared, all data is lost.

**Fix:**
- Add a Settings/Debug panel (Admin only) with:
  - "Export All Data" -> downloads a JSON backup.
  - "Import Data" -> uploads and merges a JSON backup.
  - "Reset to Seed Data" -> clears localStorage and reloads.

**Testing:**
- Export data.
- Clear localStorage.
- Import data.
- Verify all records are restored.

---

### Task 3.4 — Add Concurrency Lock for localStorage
**Files:** `src/utils/storageLock.js` (new)
**Severity:** Medium
**Description:** If the user opens the app in two tabs, both read and write localStorage simultaneously, causing lost updates.

**Fix:**
- Use `storage` event listener to detect changes from other tabs and reload state.
- Use a simple timestamp-based lock: before writing, check if the stored `lastModified` is newer than the state's `lastModified`. If so, reload instead of overwriting.

**Testing:**
- Open app in two tabs.
- Make a sale in tab A.
- Verify tab B detects the change and updates.

---

### Task 3.5 — Improve CSV Export Robustness
**Files:** `src/components/Reports.jsx`
**Severity:** Low
**Description:** CSV export uses naive `join(',')` which breaks if fields contain commas.

**Fix:**
- Wrap fields in double quotes.
- Escape internal double quotes by doubling them.

**Testing:**
- Create a transaction with a medicine name containing a comma.
- Export CSV and verify it opens correctly in Excel.

---

### Task 3.6 — Add Loading States and Optimistic UI
**Files:** All components
**Severity:** Low
**Description:** State updates are synchronous, but there are no loading spinners for slow operations (e.g., printing, generating reports).

**Fix:**
- Add `isProcessing` flags to buttons that trigger heavy operations.
- Show spinners or disable buttons during processing.

**Testing:**
- Click "Generate Today's Report" and verify button shows loading state.

---

## 4. INCOMPLETE FEATURES

### Task 4.1 — Show Return Transaction Details in Report Modal
**Files:** `src/components/Reports.jsx`
**Severity:** Low
**Description:** The report detail modal shows aggregate return metrics but not the individual return transactions.

**Fix:**
- Add a collapsible "Return Transactions" section in the detail modal.
- Render a table with return ID, invoice, customer, medicine, qty, refund, due adjustment, cash refund, processed by, reason, date.

**Testing:**
- Process a return.
- Open today's report detail.
- Verify the return transaction table is visible and correct.

---

### Task 4.2 — Remove Arbitrary Limit on Returns History Table
**Files:** `src/components/Returns.jsx`
**Severity:** Low
**Description:** `returns.slice(0, 20)` limits the history table to 20 records.

**Fix:**
- Remove the slice or replace with pagination / "Load More" button.
- Show all returns, sorted by date descending.

**Testing:**
- Process 25 returns.
- Verify all 25 appear in the history table.

---

### Task 4.3 — Add PIN Change Feature to FinanceAuth
**Files:** `src/components/FinanceAuth.jsx`
**Severity:** Low
**Description:** Once a PIN is set, there is no way to change it without clearing localStorage.

**Fix:**
- Add a "Change PIN" button visible after setup.
- Require current PIN verification before allowing a new PIN.

**Testing:**
- Set a PIN.
- Change it via the UI.
- Verify old PIN no longer works and new PIN works.

---

### Task 4.4 — Add Batch-Level Return Validation
**Files:** `src/components/Returns.jsx`, `src/utils/inventoryBatchUtils.js`
**Severity:** Low
**Description:** Returns currently validate expiry at the batch level, but they don't check if the specific batch was the one sold in the original transaction. If a customer returns a medicine from a different batch, it should be allowed only if it's the same product.

**Fix:**
- The current implementation already checks `medicineId` and `batchNumber` against the original transaction. This is correct.
- Add validation: if the returned batch doesn't match any sold batch, allow return but mark it as "different batch" for audit.

**Testing:**
- Try to return a quantity that exceeds the sold quantity for that batch.
- Verify error message appears.

---

## 5. TESTING & VERIFICATION CHECKLIST

After all tasks are complete, run this full regression:

1. **POS Flow:**
   - Add medicines to cart (strip-based and unit-based).
   - Adjust quantities — verify cannot exceed stock.
   - Complete cash sale — verify receipt, stock reduction, shop balance increase.
   - Complete due sale with existing customer — verify customer due increases.
   - Complete due sale with new customer — verify customer created and due recorded.

2. **Returns Flow:**
   - Search customer, select invoice.
   - Return partial quantity — verify stock increases, customer due adjusts, shop balance adjusts.
   - Return full quantity — verify balances reset correctly.
   - Try to return expired medicine — verify blocked.
   - Try to return more than sold — verify blocked.

3. **Inventory Flow:**
   - Add new medicine.
   - Edit medicine.
   - Restock (stock in) — verify new batch created.
   - Delete medicine — verify stock removed and history recorded.

4. **Customer Flow:**
   - Add customer with initial due.
   - Receive payment — verify due decreases and shop balance increases.
   - View history — verify entries are enriched with products.
   - Check 15-day and 30-day due buckets.

5. **Company Flow:**
   - Add company with initial purchase.
   - Add purchase — verify due increases.
   - Record payment — verify due decreases.
   - Edit purchase — verify dueDate preserved.
   - View history — verify chronological timeline.

6. **Reports Flow:**
   - Generate today's report.
   - Verify sales, costs, profit, returns metrics.
   - Export CSV — verify format.
   - Print — verify no duplicates.
   - Check that return transactions appear in the report.

7. **History Flow:**
   - Verify inventory history shows correct stock movements.
   - Verify company history shows purchases and payments.
   - Check date filtering works.

8. **Finance Auth:**
   - Set PIN.
   - Lock reports by navigating away.
   - Unlock with PIN.
   - Change PIN.
   - Refresh page — verify locked (no persistence of unlock state).

9. **Login:**
   - Log in as Admin — verify full access.
   - Log in as Staff — verify Reports hidden.
   - Log out — verify session cleared.

10. **Data Integrity:**
    - Clear localStorage and reload — verify no ghost records.
    - Corrupt localStorage JSON — verify graceful fallback.
    - Open two tabs — verify changes sync.

---

## 6. IMPLEMENTATION ORDER

| Order | Task | Rationale |
|-------|------|-----------|
| 1 | 0.1 — Fix mockData syntax | App crashes or shows ghost records without this |
| 2 | 0.2 — Fix stale returns in report | Financial reports are wrong without this |
| 3 | 0.3 — Fix nested state updates | Prevents React warnings and race conditions |
| 4 | 0.4 — Returns update dueEntries | Data consistency for customer history |
| 5 | 0.5 — Fix return history stock values | Audit trail correctness |
| 6 | 0.6 — Fix dueCollected double-counting | Financial accuracy |
| 7 | 0.7 — Fix POS cart stale stock | Prevents overselling |
| 8 | 0.8 — Preserve dueDate on edit | Data loss prevention |
| 9 | 0.9 — Fix print duplicates | Report correctness |
| 10 | 0.10 — Fix stale selectedCustomer | UI correctness |
| 11 | 1.1 — Enforce expectedTotal for companies | Data consistency |
| 12 | 1.2 — Prevent ID collisions | Data integrity |
| 13 | 1.3 — dueDate preservation (verify) | Verification of 0.8 |
| 14 | 1.4 — Fix getOldestOutstandingDueDate mutation | Subtle bug prevention |
| 15 | 1.5 — Standardize dueEntries sync | Long-term consistency |
| 16 | 2.1 — Replace hardcoded passwords | Security |
| 17 | 2.2 — Session timeout | Security |
| 18 | 2.3 — Secure FinanceAuth PIN | Security |
| 19 | 2.4 — Input sanitization | Security |
| 20 | 3.1 — Error boundaries | Stability |
| 21 | 3.2 — Data validation on load | Stability |
| 22 | 3.3 — Data export/backup | Data safety |
| 23 | 3.4 — Concurrency lock | Multi-tab safety |
| 24 | 3.5 — CSV export fix | Polish |
| 25 | 3.6 — Loading states | UX |
| 26 | 4.1 — Return details in report modal | Completeness |
| 27 | 4.2 — Remove returns history limit | Completeness |
| 28 | 4.3 — PIN change feature | Completeness |
| 29 | 4.4 — Batch-level return validation | Completeness |

---

## 7. NOTES

- **Do not modify code** until this plan is approved and tasks are assigned.
- Each task should be implemented, tested, and the plan updated with a checkmark before moving to the next.
- Tasks 0.x are blockers — do not proceed to 1.x until all 0.x are complete.
- Security tasks (2.x) should be prioritized for any production deployment.
- Production readiness tasks (3.x) can be done in parallel with feature completion (4.x) after all bugs are fixed.
