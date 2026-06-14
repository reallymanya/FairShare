const express = require('express');
const router = express.Router();

// Mock login - just register/login a user by name
router.post('/login', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  try {
    let user = await req.prisma.user.findUnique({ where: { name } });
    if (!user) {
      user = await req.prisma.user.create({
        data: { name }
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
