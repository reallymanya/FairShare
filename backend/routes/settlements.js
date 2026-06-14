const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { calculateSimplifiedDebts } = require('../utils/debtSimplification');

// Get simplified debts for a group
router.get('/debts/:groupId', auth, async (req, res) => {
  try {
    const transactions = await calculateSimplifiedDebts(req.prisma, parseInt(req.params.groupId, 10));
    // Fetch user details for these transactions to help frontend
    const userIds = [...new Set(transactions.flatMap(t => [t.from, t.to]))];
    const users = await req.prisma.user.findMany({ where: { id: { in: userIds } } });
    const userMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    
    const enriched = transactions.map(t => ({
      from: userMap[t.from],
      to: userMap[t.to],
      amount: t.amount
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a settlement request
router.post('/', auth, async (req, res) => {
  const { groupId, payeeId, amount } = req.body;
  
  try {
    const settlement = await req.prisma.settlement.create({
      data: {
        groupId: parseInt(groupId, 10),
        payerId: req.user.id,
        payeeId: parseInt(payeeId, 10),
        amount: parseFloat(amount)
      }
    });
    res.status(201).json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm settlement
router.post('/:id/confirm', auth, async (req, res) => {
  const settlementId = parseInt(req.params.id, 10);
  
  try {
    const settlement = await req.prisma.settlement.findUnique({
      where: { id: settlementId }
    });

    if (!settlement) return res.status(404).json({ error: 'Not found' });
    if (settlement.payeeId !== req.user.id) {
      return res.status(403).json({ error: 'Only payee can confirm' });
    }

    const updated = await req.prisma.settlement.update({
      where: { id: settlementId },
      data: { status: 'CONFIRMED' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
