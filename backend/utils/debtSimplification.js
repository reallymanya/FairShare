async function calculateSimplifiedDebts(prisma, groupId) {
  // Get all splits for the group
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true }
  });

  const balances = {}; // userId -> net balance

  expenses.forEach(expense => {
    expense.splits.forEach(split => {
      const uId = split.userId;
      if (!balances[uId]) balances[uId] = 0;
      balances[uId] += (split.amountPaid - split.amountOwed);
    });
  });

  // Account for settled amounts
  const settlements = await prisma.settlement.findMany({
    where: { groupId, status: 'CONFIRMED' }
  });

  settlements.forEach(s => {
    if (!balances[s.payerId]) balances[s.payerId] = 0;
    if (!balances[s.payeeId]) balances[s.payeeId] = 0;
    
    // Payer paid payee. So Payer's net goes up, Payee's net goes down
    balances[s.payerId] += s.amount;
    balances[s.payeeId] -= s.amount;
  });

  const debtors = [];
  const creditors = [];

  for (const [userIdStr, balance] of Object.entries(balances)) {
    const userId = parseInt(userIdStr, 10);
    // Use a small epsilon to handle floating point issues
    if (balance < -0.01) {
      debtors.push({ userId, amount: -balance });
    } else if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    }
  }

  // Sort descending by amount to minimize transactions
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return transactions;
}

module.exports = { calculateSimplifiedDebts };
