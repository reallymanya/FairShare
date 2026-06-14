const express = require('express');
const router = express.Router();

router.get('/group/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const members = await req.prisma.groupMember.findMany({ where: { groupId }, include: { user: true } });
    const users = members.map(m => m.user);
    
    const expenses = await req.prisma.expense.findMany({ where: { groupId }, include: { splits: true } });
    const settlements = await req.prisma.settlement.findMany({ where: { groupId } });

    const balances = {};
    users.forEach(u => balances[u.id] = 0);

    expenses.forEach(e => {
      if (balances[e.paidById] !== undefined) balances[e.paidById] += e.amountINR;
      e.splits.forEach(s => {
        if (balances[s.userId] !== undefined) balances[s.userId] -= s.amountOwed;
      });
    });

    settlements.forEach(s => {
      if (balances[s.payerId] !== undefined) balances[s.payerId] += s.amountINR;
      if (balances[s.payeeId] !== undefined) balances[s.payeeId] -= s.amountINR;
    });

    const debtors = [];
    const creditors = [];
    for (const [userIdStr, balance] of Object.entries(balances)) {
      const userId = parseInt(userIdStr, 10);
      if (balance < -0.01) debtors.push({ userId, amount: -balance });
      else if (balance > 0.01) creditors.push({ userId, amount: balance });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let d = 0, c = 0;
    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const amount = Math.min(debtor.amount, creditor.amount);
      
      const fromUser = users.find(u => u.id === debtor.userId);
      const toUser = users.find(u => u.id === creditor.userId);
      if(fromUser && toUser) {
        transactions.push({
          from: fromUser.name,
          to: toUser.name,
          amount: Math.round(amount * 100) / 100
        });
      }
      
      debtor.amount -= amount;
      creditor.amount -= amount;
      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId/group/:groupId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const groupId = parseInt(req.params.groupId, 10);
  try {
    const paidExpenses = await req.prisma.expense.findMany({ where: { paidById: userId, groupId } });
    const owedSplits = await req.prisma.expenseSplit.findMany({ where: { userId, expense: { groupId } }, include: { expense: true } });
    const settlementsPaid = await req.prisma.settlement.findMany({ where: { payerId: userId, groupId }, include: { payee: true } });
    const settlementsRcvd = await req.prisma.settlement.findMany({ where: { payeeId: userId, groupId }, include: { payer: true } });

    res.json({
      paidExpenses,
      owedSplits,
      settlementsPaid,
      settlementsRcvd
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
