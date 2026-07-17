const getHistoryTimestamp = (entry) => {
  return entry.createdAt || entry.date || entry.paymentDate || new Date().toISOString();
};

const toAmount = (value) => Number(value || 0);

export const rebuildCompanyTransactionTimeline = (history = []) => {
  const orderedHistory = [...history].sort(
    (a, b) => new Date(getHistoryTimestamp(a)).getTime() - new Date(getHistoryTimestamp(b)).getTime()
  );

  let runningPayable = 0;

  return orderedHistory.map((entry) => {
    const timestamp = getHistoryTimestamp(entry);

    if (entry.type === 'purchase') {
      const totalAmount = toAmount(entry.totalAmount);
      const amountPaid = toAmount(entry.amountPaid);
      const dueCreated = toAmount(entry.dueAmount ?? Math.max(0, totalAmount - amountPaid));

      runningPayable = Number((runningPayable + dueCreated).toFixed(2));

      return {
        ...entry,
        type: 'purchase',
        createdAt: timestamp,
        date: entry.date || timestamp,
        totalAmount,
        amountPaid,
        dueAmount: dueCreated,
        totalOutstandingDue: runningPayable,
        remainingDue: runningPayable
      };
    }

    const paymentAmount = toAmount(entry.amount ?? entry.paymentAmount);
    const previousDue = Number(runningPayable.toFixed(2));
    const remainingDue = Number(Math.max(0, previousDue - paymentAmount).toFixed(2));

    runningPayable = remainingDue;

    return {
      ...entry,
      type: 'payment',
      createdAt: timestamp,
      date: entry.date || timestamp,
      paymentDate: entry.paymentDate || timestamp,
      amount: paymentAmount,
      previousDue,
      remainingDue,
      totalOutstandingDue: remainingDue
    };
  });
};

export const summarizeCompanyBalances = (history = []) => {
  const orderedHistory = rebuildCompanyTransactionTimeline(history);
  let totalPurchaseAmount = 0;
  let amountPaid = 0;
  let dueAmount = 0;

  for (const entry of orderedHistory) {
    if (entry.type === 'purchase') {
      totalPurchaseAmount = Number((totalPurchaseAmount + toAmount(entry.totalAmount)).toFixed(2));
      amountPaid = Number((amountPaid + toAmount(entry.amountPaid)).toFixed(2));
      dueAmount = Number(entry.totalOutstandingDue ?? dueAmount);
    } else if (entry.type === 'payment') {
      amountPaid = Number((amountPaid + toAmount(entry.amount)).toFixed(2));
      dueAmount = Number(entry.remainingDue ?? dueAmount);
    }
  }

  return {
    transactionHistory: orderedHistory,
    totalPurchaseAmount,
    amountPaid,
    dueAmount
  };
};