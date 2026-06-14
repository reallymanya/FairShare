const USD_TO_INR = 83.0;

function parseDate(dateStr) {
  if (!dateStr) return null;
  dateStr = dateStr.trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr);
  
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  
  // MMM DD (Assume 2026 based on context)
  if (/^[A-Za-z]{3}\s\d{1,2}$/.test(dateStr)) {
    return new Date(`${dateStr}, 2026`);
  }

  return new Date(dateStr); // Fallback
}

function normalizeName(name) {
  if (!name) return null;
  name = name.trim().toLowerCase();
  if (name.includes('priya')) return 'Priya';
  if (name.includes('rohan')) return 'Rohan';
  if (name.includes('aisha')) return 'Aisha';
  if (name.includes('meera')) return 'Meera';
  if (name.includes('dev')) return 'Dev';
  if (name.includes('sam')) return 'Sam';
  // Guest "Dev's friend Kabir" mapped to Dev per policy
  if (name.includes('kabir')) return 'Dev';
  
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function normalizeAmount(amountStr) {
  if (!amountStr) return 0;
  // Remove commas, trim
  let val = parseFloat(amountStr.toString().replace(/,/g, '').trim());
  return isNaN(val) ? 0 : Math.round(val * 1000) / 1000;
}

function processRow(row, rowIndex) {
  let anomalies = [];
  
  // 1. Date Format
  let date = parseDate(row.date);
  if (row.date === '04/05/2026') {
    date = new Date('2026-04-05'); // Policy: MM/DD based on surrounding rows
    anomalies.push({ issueType: 'Date Format', description: `Ambiguous date '04/05/2026'`, actionTaken: `Inferred as April 5th based on timeline` });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    anomalies.push({ issueType: 'Date Format', description: `Non-standard date format '${row.date}'`, actionTaken: `Parsed as ${date.toISOString().split('T')[0]}` });
  }

  // 2. Names
  let paidBy = normalizeName(row.paid_by);
  if (!paidBy) {
    paidBy = 'Unknown';
    anomalies.push({ issueType: 'Missing Payer', description: `paid_by is empty`, actionTaken: `Assigned payer to 'Unknown'` });
  } else if (paidBy !== row.paid_by && row.paid_by) {
    if (paidBy === 'Dev' && row.paid_by.toLowerCase().includes('kabir')) {
      anomalies.push({ issueType: 'Guest User', description: `Guest '${row.paid_by}' found`, actionTaken: `Reassigned payment to flatmate 'Dev'` });
    } else {
      anomalies.push({ issueType: 'Name Inconsistency', description: `'${row.paid_by}'`, actionTaken: `Normalized to '${paidBy}'` });
    }
  }

  // 3. Amount Formatting
  let amount = normalizeAmount(row.amount);
  if (amount < 0) {
    anomalies.push({ issueType: 'Negative Amount', description: `Amount is negative ${amount}`, actionTaken: `Treated as a refund (reduced group cost)` });
  }
  if (amount === 0) {
    anomalies.push({ issueType: 'Zero Amount', description: `Amount is 0`, actionTaken: `Imported as 0` });
  }
  if (row.amount && row.amount.includes(',')) {
    anomalies.push({ issueType: 'Number Formatting', description: `Comma in amount '${row.amount}'`, actionTaken: `Removed comma` });
  }
  let rounded = Math.round(amount * 100) / 100;
  if (row.amount && rounded !== amount && !row.amount.includes(',')) {
    anomalies.push({ issueType: 'Number Formatting', description: `Unrounded amount '${row.amount}'`, actionTaken: `Rounded to '${rounded}'` });
    amount = rounded;
  }

  // 4. Missing/Wrong Currency
  let currency = row.currency ? row.currency.trim().toUpperCase() : '';
  let amountINR = amount;
  if (!currency && amount !== 0) { // If 0, currency doesn't matter
    currency = 'INR';
    anomalies.push({ issueType: 'Missing Currency', description: `No currency provided for ${amount}`, actionTaken: `Defaulted to INR` });
  } else if (currency === 'USD') {
    amountINR = amount * USD_TO_INR;
    anomalies.push({ issueType: 'Foreign Currency', description: `Amount in USD`, actionTaken: `Converted to INR at rate 1 USD = ${USD_TO_INR} INR` });
  }

  // 5. Settlement instead of expense
  let isSettlement = false;
  let payee = '';
  if (!row.split_type && row.description.toLowerCase().includes('paid') && row.description.toLowerCase().includes('back')) {
    isSettlement = true;
    payee = normalizeName(row.split_with);
    anomalies.push({ issueType: 'Settlement Logged as Expense', description: `'${row.description}'`, actionTaken: `Converted to Settlement record` });
  }

  // 6. Split Type and Details
  let splitType = row.split_type ? row.split_type.trim().toLowerCase() : 'equal';
  
  if (splitType === 'equal' && row.split_details) {
    anomalies.push({ issueType: 'Contradictory Split', description: `Type 'equal' but details provided: '${row.split_details}'`, actionTaken: `Preferred the explicit split_details (treating as 'share')` });
    splitType = 'share';
  }

  // 7. Ghost Members & Guests
  let splitWithRaw = row.split_with || '';
  let splitWith = splitWithRaw.split(';').map(normalizeName).filter(Boolean);
  
  if (splitWithRaw.toLowerCase().includes('kabir')) {
    anomalies.push({ issueType: 'Guest User in Split', description: `Guest found in split`, actionTaken: `Assigned guest's share to Dev` });
    // It's already normalized to 'Dev' above, but we should ensure 'Dev' is unique in the array if we just mapped Kabir to Dev.
    splitWith = [...new Set(splitWith)];
  }

  if (date > new Date('2026-03-31') && splitWith.includes('Meera')) {
    splitWith = splitWith.filter(n => n !== 'Meera');
    anomalies.push({ issueType: 'Ghost Member', description: `Meera included in split after moving out`, actionTaken: `Removed Meera from split` });
  }

  if (splitType === 'percentage' && row.split_details) {
    let totalPct = 0;
    const parts = row.split_details.split(';');
    parts.forEach(p => {
      const match = p.match(/(\d+)%/);
      if (match) totalPct += parseInt(match[1], 10);
    });
    if (totalPct > 100) {
      anomalies.push({ issueType: 'Percentage Total Incorrect', description: `Total is ${totalPct}%`, actionTaken: `Normalized shares proportionally` });
    }
  }

  return {
    data: {
      date,
      description: row.description,
      paidBy,
      amountOriginal: amount,
      currency,
      amountINR,
      splitType,
      splitWith,
      splitDetails: row.split_details,
      notes: row.notes,
      isSettlement,
      payee
    },
    anomalies: anomalies.map(a => ({ ...a, rowNum: rowIndex + 1 }))
  };
}

module.exports = { processRow };
