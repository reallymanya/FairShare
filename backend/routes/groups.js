const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    let where = {};
    if (userId) {
      where = { members: { some: { userId } } };
    }
    const groups = await req.prisma.group.findMany({
      where,
      include: {
        members: { include: { user: true } }
      }
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await req.prisma.group.create({
      data: { name, description }
    });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const group = await req.prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { members: { include: { user: true } } }
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const { userId } = req.body;
    
    const existing = await req.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: parseInt(userId) } }
    });
    
    if (existing) return res.json(existing);

    const member = await req.prisma.groupMember.create({
      data: { groupId, userId: parseInt(userId) }
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
