const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get comments for an expense
router.get('/:expenseId', auth, async (req, res) => {
  const expenseId = parseInt(req.params.expenseId, 10);
  try {
    const comments = await req.prisma.comment.findMany({
      where: { expenseId },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/:expenseId', auth, async (req, res) => {
  const expenseId = parseInt(req.params.expenseId, 10);
  const { text } = req.body;
  try {
    const comment = await req.prisma.comment.create({
      data: {
        expenseId,
        userId: req.user.id,
        text
      },
      include: { user: true }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
