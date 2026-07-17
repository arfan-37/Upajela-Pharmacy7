const getHistoryTimestamp = (entry) => {
  return entry.createdAt || entry.purchaseDate || entry.paymentDate || new Date().toISOString();
};

const toAmount = (value) => Number(value || 0);

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
      const dueCreated = toAmount(
        entry.dueCreated ?? entry.dueAmount ?? entry.remainingDue ?? Math.max(0, totalPurchaseAmount - cashPaid)
      );

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