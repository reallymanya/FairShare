# Decisions Log

## 1. Multi-tenant Groups Architecture vs. Single-Ledger MVP

**Options Considered:**
1. **Single-Ledger MVP:** The app maintains one global ledger. Uploading a CSV wipes the database and replaces it with the CSV data.
2. **Multi-Tenant Groups:** The app supports multiple isolated groups. A CSV is imported into a specific group's ledger without affecting others.

**Decision:** Multi-Tenant Groups.
**Why:** While a single-ledger is faster to build, the assignment explicitly stated: *"Create and manage groups, where membership can change over time"*. A single ledger violates this core requirement. By implementing multi-tenancy (`Group` and `GroupMember` tables), the app allows users like Aisha to create a "Goa Trip" group, import the CSV specifically for that trip, and maintain complete isolation from a separate "Apartment" group.

---

## 2. Greedy Algorithm vs. Raw Edge Graph

**Options Considered:**
1. **Raw Edge Graph:** Show exactly who owes whom based strictly on individual expense splits.
2. **Greedy Algorithm Simplification:** Calculate everyone's net balance first, then iteratively match the biggest debtors with the biggest creditors.

**Decision:** Greedy Algorithm Simplification (with raw fallback).
**Why:** Aisha explicitly requested: *"I just want one number per person. Who pays whom, how much, done."* Raw edge graphs result in a tangled web of transactions (e.g., A owes B $10, B owes C $10). The greedy algorithm collapses this so A pays C $10 directly. However, because Rohan requested exact breakdowns, the backend provides both datasets, allowing the UI to render the simplified view for Aisha and the raw view for Rohan.

---

## 3. Manual Review Queue vs. Silent Deletion of Duplicates

**Options Considered:**
1. **Silent Deletion:** The algorithm mathematically identifies duplicate rows and silently drops them during the import process.
2. **Manual Review Queue:** The algorithm ingests both rows, flags them as `NEEDS_REVIEW`, and halts their impact on the ledger until explicitly approved.

**Decision:** Manual Review Queue.
**Why:** Meera explicitly requested: *"Clean up the duplicates — but I want to approve anything the app deletes or changes."* Silent deletion violates her trust requirement. By flagging duplicates and surfacing them to a specific "Review" dashboard when Meera logs in, she maintains full agency over data modification.
