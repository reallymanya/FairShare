const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient({});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Make prisma globally accessible in request object
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.get('/api/review', async (req, res) => {
  try {
    const groupId = parseInt(req.query.groupId);
    if (!groupId) return res.status(400).json({ error: 'groupId required' });
    const items = await req.prisma.expense.findMany({ where: { status: 'NEEDS_REVIEW', groupId } });
    res.json(items);
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/review/:id/approve', async (req, res) => {
  try {
    await req.prisma.expense.update({ where: { id: parseInt(req.params.id) }, data: { status: 'APPROVED' } });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/review/:id/reject', async (req, res) => {
  try {
    await req.prisma.expenseSplit.deleteMany({ where: { expenseId: parseInt(req.params.id) } });
    await req.prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }) }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/import', require('./routes/import'));
app.use('/api/balances', require('./routes/balances'));

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
