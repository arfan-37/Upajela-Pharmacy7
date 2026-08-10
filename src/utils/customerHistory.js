const getHistoryTimestamp = (entry) => {
  return entry.createdAt || entry.purchaseDate || entry.paymentDate || new Date().toISOString();
};

const toAmount = (value) => Number(value || 0);

export const getOldestOutstandingDueDate = (history = []) => {
  const timeline = rebuildCustomerHistoryTimeline(history);
  const pendingDues = [];

  for (const entry of timeline) {
    if (entry.type === 'sale' && entry.dueCreated > 0) {
      pendingDues.push({ date: entry.purchaseDate || entry.createdAt, amount: entry.dueCreated });
    } else if (entry.type === 'payment') {
      let remaining = entry.paymentAmount;
      while (remaining > 0 && pendingDues.length > 0 && pendingDues[0].amount <= remaining) {
        remaining = Number((remaining - pendingDues[0].amount).toFixed(2));
        pendingDues.shift();
      }
      if (remaining > 0 && pendingDues.length > 0) {
        pendingDues[0].amount = Number((pendingDues[0].amount - remaining).toFixed(2));
      }
    }
  }

  if (pendingDues.length === 0) return null;
  return pendingDues[0].date;
};

export const summarizeCustomerBalances = (history = []) => {
  const orderedHistory = rebuildCustomerHistoryTimeline(history);
  let cashPaid = 0;
  let dueAmount = 0;
  let totalPurchaseAmount = 0;

  for (const entry of orderedHistory) {
    if (entry.type === 'sale') {
      totalPurchaseAmount = Number((totalPurchaseAmount + toAmount(entry.totalPurchaseAmount)).toFixed(2));
      cashPaid = Number((cashPaid + toAmount(entry.cashPaid)).toFixed(2));
      dueAmount = Number(entry.totalOutstandingDue ?? dueAmount);
    } else if (entry.type === 'payment') {
      cashPaid = Number((cashPaid + toAmount(entry.paymentAmount)).toFixed(2));
      dueAmount = Number(entry.remainingDue ?? dueAmount);
    }
  }

  return {
    paymentHistory: orderedHistory,
    totalPurchaseAmount,
    cashPaid,
    dueAmount,
    totalDue: dueAmount
  };
};

export const rebuildCustomerHistoryTimeline = (history = []) => {
  const orderedHistory = [...history].sort(
    (a, b) => new Date(getHistoryTimestamp(a)).getTime() - new Date(getHistoryTimestamp(b)).getTime()
  );

  let runningDue = 0;

  return orderedHistory.map((entry) => {
    const timestamp = getHistoryTimestamp(entry);

    if (entry.type === 'sale') {
      const totalPurchaseAmount = toAmount(entry.totalPurchaseAmount ?? entry.totalBill ?? entry.totalAmount);
      const cashPaid = toAmount(entry.cashPaid ?? entry.cashAmount ?? entry.amountReceived);
      const calculatedDue = Number(Math.max(0, totalPurchaseAmount - cashPaid).toFixed(2));
      const dueCreated = Number.isFinite(calculatedDue) && calculatedDue >= 0
        ? calculatedDue
        : toAmount(entry.dueCreated ?? entry.dueAmount ?? entry.remainingDue ?? 0);

      runningDue = Number((runningDue + dueCreated).toFixed(2));

      return {
        ...entry,
        type: 'sale',
        createdAt: timestamp,
        purchaseDate: entry.purchaseDate || timestamp,
        totalPurchaseAmount,
        cashPaid,
        dueCreated,
        totalOutstandingDue: runningDue,
        remainingDue: runningDue
      };
    }

    const paymentAmount = toAmount(entry.paymentAmount ?? entry.amountReceived ?? entry.amount);
    const previousDue = Number(runningDue.toFixed(2));
    const remainingDue = Number(Math.max(0, previousDue - paymentAmount).toFixed(2));

    runningDue = remainingDue;

    return {
      ...entry,
      type: 'payment',
      createdAt: timestamp,
      paymentDate: entry.paymentDate || timestamp,
      paymentAmount,
      previousDue,
      remainingDue,
      totalOutstandingDue: remainingDue
    };
  });
};