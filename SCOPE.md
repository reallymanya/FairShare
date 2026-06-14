# Scope & Anomalies Log

## 1. Anomaly Log (Handling the 12+ CSV Problems)
Our CSV ingestion pipeline detects, surfaces, and resolves the following deliberate data problems:

1. **Ghost Member**: Meera moved out at the end of March, but the sheet included her in April expenses.
   *Action:* Removed Meera from splits for any expense dated after March 31st and redistributed her shares proportionally.
2. **Settlement Logged as Expense**: "Rohan paid Aisha back" was recorded as a standard expense.
   *Action:* Flagged via regex, routed away from the `Expense` table, and explicitly stored in the `Settlement` table.
3. **Percentage Total Incorrect**: A row's split percentages equaled 110%.
   *Action:* Normalized the shares proportionally (e.g., `user_pct / total_pct * 100`).
4. **Missing Payer**: `paid_by` was left empty.
   *Action:* Assigned the payer to a default "Unknown" system user to preserve the mathematical integrity of the split.
5. **Foreign Currency (USD)**: Priya noted half the trip was in dollars.
   *Action:* Detected 'USD' in the currency column and multiplied the `amountOriginal` by a fixed exchange rate (83 INR) to store a uniform `amountINR` in the database.
6. **Duplicate Entries**: Identical expenses logged multiple times.
   *Action:* Flagged both entries with a `NEEDS_REVIEW` status. Surfaced these specific rows to Meera's custom dashboard so she can explicitly click "Approve" or "Reject".
7. **Name Inconsistencies**: Variations like "priya" and "Priya S".
   *Action:* Normalized all names to lowercase and mapped them to fixed user entities.
8. **Number Formatting**: Commas included in numbers (e.g., "1,200").
   *Action:* Stripped commas before float conversion.
9. **Unrounded Amounts**: Extreme decimals (e.g., `899.995`).
   *Action:* Preserved exact decimals in the DB, but rounded to 2 decimal places for UI display.
10. **Inconsistent Dates**: Various formats like `DD/MM/YYYY` vs `MM/DD/YYYY`.
    *Action:* Standardized date parsing using a priority fallback mechanism.
11. **Contradictory Split Rules**: Split type was "equal" but "splitDetails" explicitly defined unequal shares.
    *Action:* Preferred the explicit `splitDetails` mathematically over the generic `splitType` string.
12. **Negative Amounts (Refunds)**: Negative numbers in the amount column.
    *Action:* Processed as valid negative expenses, mathematically reducing the group's total debt correctly.

---

## 2. Database Schema (Prisma / SQLite)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  isActive  Boolean  @default(true)
  
  groupMemberships GroupMember[]
  expensesPaid    Expense[]      @relation("PaidExpenses")
  expenseSplits   ExpenseSplit[]
  settlementsPaid Settlement[]     @relation("SettlementsPaid")
  settlementsRcvd Settlement[]     @relation("SettlementsReceived")
}

model Group {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  createdAt   DateTime @default(now())

  members     GroupMember[]
  expenses    Expense[]
  settlements Settlement[]
  anomalies   AnomalyLog[]
}

model GroupMember {
  id        Int      @id @default(autoincrement())
  groupId   Int
  userId    Int
  joinedAt  DateTime @default(now())
  leftAt    DateTime?

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
}

model Expense {
  id             Int      @id @default(autoincrement())
  groupId        Int
  date           DateTime
  description    String
  paidById       Int
  amountOriginal Float
  currency       String
  amountINR      Float
  splitType      String?
  notes          String?
  status         String   @default("IMPORTED") // IMPORTED, NEEDS_REVIEW, APPROVED
  createdAt      DateTime @default(now())

  group  Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  paidBy User @relation("PaidExpenses", fields: [paidById], references: [id])
  splits ExpenseSplit[]
}

model ExpenseSplit {
  id         Int   @id @default(autoincrement())
  expenseId  Int
  userId     Int
  amountOwed Float

  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])
}

model Settlement {
  id        Int      @id @default(autoincrement())
  groupId   Int
  date      DateTime
  payerId   Int
  payeeId   Int
  amountINR Float
  createdAt DateTime @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  payer User @relation("SettlementsPaid", fields: [payerId], references: [id])
  payee User @relation("SettlementsReceived", fields: [payeeId], references: [id])
}

model AnomalyLog {
  id          Int      @id @default(autoincrement())
  groupId     Int
  rowNum      Int
  issueType   String
  description String
  actionTaken String
  createdAt   DateTime @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
}
```
