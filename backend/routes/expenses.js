const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Create expense
router.post('/', auth, async (req, res) => {
  const { groupId, description, totalAmount, splits } = req.body;
  // splits is array of { userId, amountPaid, amountOwed }

  try {
    const expense = await req.prisma.expense.create({
      data: {
        groupId: parseInt(groupId, 10),
        description,
        totalAmount: parseFloat(totalAmount),
        createdById: req.user.id,
        splits: {
          create: splits.map(s => ({
            userId: s.userId,
            amountPaid: parseFloat(s.amountPaid || 0),
            amountOwed: parseFloat(s.amountOwed || 0)
          }))
        }
      },
      include: { splits: true }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses for a group
router.get('/', auth, async (req, res) => {
  const { groupId } = req.query;
  if (!groupId) return res.status(400).json({ error: 'groupId query param required' });

  try {
    const expenses = await req.prisma.expense.findMany({
      where: { groupId: parseInt(groupId, 10) },
      include: {
        createdBy: true,
        splits: { include: { user: true } },
        comments: { orderBy: { createdAt: 'asc' }, include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
