const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { processRow } = require('../utils/anomalyPolicies');

const upload = multer({ dest: 'uploads/' });

function calculateSplits(amountINR, splitType, splitWith, splitDetails) {
  let splits = [];
  if (splitType === 'equal') {
    const splitAmt = amountINR / splitWith.length;
    splits = splitWith.map(u => ({ userName: u, amountOwed: splitAmt }));
  } else if (splitType === 'percentage') {
    let totalPct = 0;
    const parts = splitDetails ? splitDetails.split(';') : [];
    const pcts = {};
    parts.forEach(p => {
      const match = p.match(/([a-zA-Z]+)\s+(\d+)%/);
      if (match) {
        pcts[match[1].toLowerCase()] = parseInt(match[2], 10);
        totalPct += parseInt(match[2], 10);
      }
    });
    splits = splitWith.map(u => {
      let userPct = pcts[u.toLowerCase()] || 0;
      if (totalPct > 0) userPct = (userPct / totalPct) * 100; // normalize
      return { userName: u, amountOwed: (amountINR * userPct) / 100 };
    });
  } else if (splitType === 'share' || splitType === 'unequal') {
    let totalShares = 0;
    const parts = splitDetails ? splitDetails.split(';') : [];
    const shares = {};
    parts.forEach(p => {
      const match = p.match(/([a-zA-Z]+)\s+([\d.]+)/);
      if (match) {
        shares[match[1].toLowerCase()] = parseFloat(match[2]);
        totalShares += parseFloat(match[2]);
      }
    });
    if (splitType === 'share') {
      splits = splitWith.map(u => {
        let userShare = shares[u.toLowerCase()] || 0;
        return { userName: u, amountOwed: totalShares > 0 ? (amountINR * userShare) / totalShares : 0 };
      });
    } else { // unequal (exact amounts)
      splits = splitWith.map(u => {
        let userAmt = shares[u.toLowerCase()] || 0;
        return { userName: u, amountOwed: userAmt };
      });
    }
  }
  return splits;
}

router.post('/:groupId', upload.single('file'), async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  if (!groupId) return res.status(400).json({ error: 'Group ID is required' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let globalAnomalies = [];
        const processedRows = [];
      
      // Seed users
      const allUsers = ['Aisha', 'Rohan', 'Priya', 'Meera', 'Dev', 'Sam', 'Unknown'];
      for (let u of allUsers) {
        let dbUser = await req.prisma.user.upsert({
          where: { name: u },
          update: {},
          create: { name: u }
        });
        
        const existingMember = await req.prisma.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId: dbUser.id } }
        });
        if (!existingMember) {
          await req.prisma.groupMember.create({
            data: { groupId, userId: dbUser.id }
          });
        }
      }

      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        if (Object.keys(row).length === 0 || !row.date) continue; // skip empty
        const { data, anomalies } = processRow(row, i);
        globalAnomalies.push(...anomalies);
        processedRows.push({ ...data, rowIndex: i });
      }

      // Check duplicates
      for (let i = 0; i < processedRows.length; i++) {
        for (let j = i + 1; j < processedRows.length; j++) {
          let r1 = processedRows[i];
          let r2 = processedRows[j];
          if (!r1.isSettlement && !r2.isSettlement && r1.date && r2.date && r1.date.getTime() === r2.date.getTime()) {
            if (Math.abs(r1.amountINR - r2.amountINR) < 1 || r1.description.toLowerCase().slice(0,5) === r2.description.toLowerCase().slice(0,5)) {
              r1.status = 'NEEDS_REVIEW';
              r2.status = 'NEEDS_REVIEW';
              const existing = globalAnomalies.find(a => a.rowNum === r2.rowIndex + 1 && a.issueType === 'Duplicate Detection');
              if (!existing) {
                globalAnomalies.push({ rowNum: r2.rowIndex + 1, issueType: 'Duplicate Detection', description: `Potential duplicate of row ${r1.rowIndex + 1}`, actionTaken: 'Flagged for review' });
              }
            }
          }
        }
      }

      // Clean DB for re-import for THIS group
      const expenses = await req.prisma.expense.findMany({ where: { groupId }, select: { id: true } });
      const expenseIds = expenses.map(e => e.id);
      
      await req.prisma.expenseSplit.deleteMany({ where: { expenseId: { in: expenseIds } } });
      await req.prisma.expense.deleteMany({ where: { groupId } });
      await req.prisma.settlement.deleteMany({ where: { groupId } });
      await req.prisma.anomalyLog.deleteMany({ where: { groupId } });

      // Save to DB
      for (let p of processedRows) {
        if (p.isSettlement) {
          const payerUser = await req.prisma.user.findUnique({ where: { name: p.paidBy } });
          const payeeUser = await req.prisma.user.findUnique({ where: { name: p.payee } });
          if (payerUser && payeeUser) {
            await req.prisma.settlement.create({
              data: {
                groupId,
                date: p.date,
                payerId: payerUser.id,
                payeeId: payeeUser.id,
                amountINR: p.amountINR
              }
            });
          }
        } else {
          const paidByUser = await req.prisma.user.findUnique({ where: { name: p.paidBy } });
          if (!paidByUser) continue;

          let status = p.status || 'IMPORTED';

          const expense = await req.prisma.expense.create({
            data: {
              groupId,
              date: p.date,
              description: p.description,
              paidById: paidByUser.id,
              amountOriginal: p.amountOriginal,
              currency: p.currency,
              amountINR: p.amountINR,
              splitType: p.splitType,
              notes: p.notes,
              status
            }
          });

          const splitData = calculateSplits(p.amountINR, p.splitType, p.splitWith, p.splitDetails);
          for (let sd of splitData) {
            const u = await req.prisma.user.findUnique({ where: { name: sd.userName } });
            if (u) {
              await req.prisma.expenseSplit.create({
                data: {
                  expenseId: expense.id,
                  userId: u.id,
                  amountOwed: sd.amountOwed
                }
              });
            }
          }
        }
      }

      for (let a of globalAnomalies) {
        await req.prisma.anomalyLog.create({ data: { ...a, groupId } });
      }

      fs.unlinkSync(req.file.path);

        res.json({ message: 'Import successful', anomalies: globalAnomalies });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
    });
});

module.exports = router;
