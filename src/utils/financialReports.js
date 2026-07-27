const STORAGE_KEY = 'shabab_financial_reports';

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTimestamp = () => new Date().toISOString();
const startOfDay = (dateStr) => `${dateStr}T00:00:00.000Z`;
const endOfDay = (dateStr) => `${dateStr}T23:59:59.999Z`;

const loadReports = (seedReports = []) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    if (seedReports.length > 0) {
      saveReports(seedReports);
      return seedReports;
    }
    return [];
  } catch {
    return seedReports.length > 0 ? seedReports : [];
  }
};

const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

const findReport = (reports, dateStr) => reports.find(r => r.reportDate === dateStr);

const ensureDayReport = (reports, dateStr) => {
  const existing = findReport(reports, dateStr);
  if (existing) return reports;

  const newReport = {
    id: `RPT-${dateStr}-${Date.now()}`,
    reportDate: dateStr,
    createdAt: nowTimestamp(),
    lastUpdatedAt: nowTimestamp(),
    totalSalesAmount: 0,
    totalPurchaseCost: 0,
    grossProfit: 0,
    netProfit: 0,
    totalCashReceived: 0,
    totalDueCollected: 0,
    totalCustomerDueCreated: 0,
    totalAmountPaidToCompanies: 0,
    totalCompanyPayable: 0,
    totalTransactions: 0,
    salesTransactions: [],
    companyPurchases: [],
    customerPayments: [],
    companyPayments: [],
    isClosed: false
  };

  return [newReport, ...reports];
};

const getTodayReport = (reports, seedReports = []) => {
  const today = todayStr();
  let current = reports && reports.length > 0 ? reports : loadReports(seedReports);
  current = ensureDayReport(current, today);
  saveReports(current);
  return findReport(current, today) || current[0];
};

const getReportByDate = (reports, dateStr) => {
  let current = reports;
  if (!findReport(current, dateStr)) {
    current = ensureDayReport(current, dateStr);
    saveReports(current);
  }
  return findReport(current, dateStr);
};

const buildReportFromTransactions = (report, transactions, medicines, customers, companies) => {
  const reportDate = report.reportDate;
  const dayStart = new Date(startOfDay(reportDate));
  const dayEnd = new Date(endOfDay(reportDate));

  const salesInDay = (transactions || []).filter(tx => {
    const txDate = new Date(tx.timestamp);
    return txDate >= dayStart && txDate <= dayEnd;
  });

  const medicineMap = new Map((medicines || []).map(m => [m.id, m]));

  let totalSalesAmount = 0;
  let totalPurchaseCost = 0;
  let totalCashReceived = 0;
  let totalTransactions = salesInDay.length;
  const salesTransactions = [];

  salesInDay.forEach(tx => {
    const subtotal = Number(tx.subtotal || 0);
    const cashReceived = Number(tx.cashReceived || 0);
    const discount = Number(tx.discount || 0);
    const tax = Number(tx.tax || 0);
    const total = Number(tx.total || 0);

    totalSalesAmount += total;
    totalCashReceived += cashReceived;

    let itemCost = 0;
    (tx.items || []).forEach(item => {
      const med = medicineMap.get(item.id);
      const cost = med ? Number(med.cost || 0) : Number(item.cost || 0);
      itemCost += cost * Number(item.quantity || 0);
    });
    totalPurchaseCost += itemCost;

    salesTransactions.push({
      id: tx.id,
      timestamp: tx.timestamp,
      salesperson: tx.salesperson,
      items: tx.items,
      subtotal,
      discount,
      tax,
      total,
      cashReceived,
      changeGiven: tx.changeGiven || 0
    });
  });

  const grossProfit = Number((totalSalesAmount - totalPurchaseCost).toFixed(2));
  const netProfit = Number((grossProfit - 0).toFixed(2));

  return {
    ...report,
    lastUpdatedAt: nowTimestamp(),
    totalSalesAmount: Number(totalSalesAmount.toFixed(2)),
    totalPurchaseCost: Number(totalPurchaseCost.toFixed(2)),
    grossProfit,
    netProfit,
    totalCashReceived: Number(totalCashReceived.toFixed(2)),
    totalDueCollected: report.totalDueCollected || 0,
    totalCustomerDueCreated: report.totalCustomerDueCreated || 0,
    totalAmountPaidToCompanies: report.totalAmountPaidToCompanies || 0,
    totalCompanyPayable: report.totalCompanyPayable || 0,
    totalTransactions,
    salesTransactions,
    companyPurchases: report.companyPurchases || [],
    customerPayments: report.customerPayments || [],
    companyPayments: report.companyPayments || []
  };
};

const updateCompanyMetrics = (report, companies) => {
  const reportDate = report.reportDate;
  const dayStart = new Date(startOfDay(reportDate));
  const dayEnd = new Date(endOfDay(reportDate));

  let totalPaidToCompanies = 0;
  let totalCompanyPayable = 0;
  const companyPayments = [];
  const companyPurchases = [];

  (companies || []).forEach(company => {
    const history = Array.isArray(company.transactionHistory) ? company.transactionHistory : [];
    history.forEach(tx => {
      const txDate = new Date(tx.createdAt || tx.date || '');
      if (Number.isNaN(txDate.getTime())) return;

      if (txDate >= dayStart && txDate <= dayEnd) {
        if (tx.type === 'payment') {
          const amount = Number(tx.amount || 0);
          totalPaidToCompanies += amount;
          companyPayments.push({
            companyId: company.id,
            companyName: company.name,
            amount,
            date: tx.createdAt || tx.date,
            remainingDue: tx.remainingDue || 0
          });
        } else if (tx.type === 'purchase') {
          const totalAmount = Number(tx.totalAmount || 0);
          totalCompanyPayable += Number(tx.dueAmount || 0);
          companyPurchases.push({
            companyId: company.id,
            companyName: company.name,
            totalAmount,
            amountPaid: Number(tx.amountPaid || 0),
            dueAmount: Number(tx.dueAmount || 0),
            date: tx.createdAt || tx.date,
            products: tx.products || []
          });
        }
      }
    });
  });

  return {
    ...report,
    lastUpdatedAt: nowTimestamp(),
    totalAmountPaidToCompanies: Number(totalPaidToCompanies.toFixed(2)),
    totalCompanyPayable: Number(totalCompanyPayable.toFixed(2)),
    companyPayments,
    companyPurchases
  };
};

const updateCustomerMetrics = (report, customers) => {
  const reportDate = report.reportDate;
  const dayStart = new Date(startOfDay(reportDate));
  const dayEnd = new Date(endOfDay(reportDate));

  let dueCollected = 0;
  let dueCreated = 0;
  const customerPayments = [];

  (customers || []).forEach(customer => {
    const history = Array.isArray(customer.paymentHistory) ? customer.paymentHistory : [];
    history.forEach(entry => {
      const entryDate = new Date(entry.createdAt || entry.purchaseDate || entry.paymentDate || '');
      if (Number.isNaN(entryDate.getTime())) return;

      if (entryDate >= dayStart && entryDate <= dayEnd) {
        if (entry.type === 'payment') {
          const amount = Number(entry.amountReceived || entry.paymentAmount || 0);
          dueCollected += amount;
          customerPayments.push({
            customerId: customer.id,
            customerName: customer.name,
            amount,
            date: entry.createdAt || entry.paymentDate,
            remainingDue: entry.remainingDue || 0,
            invoiceNumber: entry.invoiceNumber || null
          });
        } else if (entry.type === 'sale') {
          const due = Number(entry.dueAmount || entry.dueCreated || 0);
          dueCreated += due;
        }
      }
    });
  });

  return {
    ...report,
    lastUpdatedAt: nowTimestamp(),
    totalDueCollected: Number(dueCollected.toFixed(2)),
    totalCustomerDueCreated: Number(dueCreated.toFixed(2)),
    customerPayments
  };
};

const generateDailyReport = (dateStr, transactions, medicines, customers, companies, seedReports = []) => {
  const reports = loadReports(seedReports);
  let report = getReportByDate(reports, dateStr);

  report = buildReportFromTransactions(report, transactions, medicines, customers, companies);
  report = updateCompanyMetrics(report, companies);
  report = updateCustomerMetrics(report, customers);

  const updated = reports.map(r => r.reportDate === dateStr ? report : r);
  if (!findReport(updated, dateStr)) {
    updated.push(report);
  }
  saveReports(updated);
  return report;
};

const ensureTodayReportExists = (transactions, medicines, customers, companies, seedReports = []) => {
  const reports = loadReports(seedReports);
  const today = todayStr();
  let current = ensureDayReport(reports, today);

  const report = findReport(current, today);
  const updated = buildReportFromTransactions(report, transactions, medicines, customers, companies);
  updated.companyPayments = report.companyPayments || [];
  updated.companyPurchases = report.companyPurchases || [];
  updated.customerPayments = report.customerPayments || [];
  const final = updateCompanyMetrics(updated, companies);
  const final2 = updateCustomerMetrics(final, customers);

  const merged = current.map(r => r.reportDate === today ? final2 : r);
  if (!findReport(merged, today)) merged.push(final2);
  saveReports(merged);
  return final2;
};

const filterReports = (reports, filterType, customFrom, customTo) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let fromDate = null;
  let toDate = null;

  switch (filterType) {
    case 'today':
      fromDate = new Date(today);
      toDate = new Date(today);
      break;
    case 'yesterday':
      fromDate = new Date(today.getTime() - 86400000);
      toDate = fromDate;
      break;
    case 'last7':
      fromDate = new Date(today.getTime() - 6 * 86400000);
      toDate = new Date(today);
      break;
    case 'last30':
      fromDate = new Date(today.getTime() - 29 * 86400000);
      toDate = new Date(today);
      break;
    case 'thisMonth':
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      toDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'thisYear':
      fromDate = new Date(today.getFullYear(), 0, 1);
      toDate = new Date(today.getFullYear(), 11, 31);
      break;
    case 'lastYear':
      fromDate = new Date(today.getFullYear() - 1, 0, 1);
      toDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      fromDate = customFrom ? new Date(customFrom) : null;
      toDate = customTo ? new Date(customTo) : null;
      break;
    default:
      fromDate = new Date(today.getTime() - 6 * 86400000);
      toDate = new Date(today);
  }

  const fromStr = fromDate ? fromDate.toISOString().slice(0, 10) : null;
  const toStr = toDate ? toDate.toISOString().slice(0, 10) : null;

  if (!fromStr || !toStr) return reports;

  return reports.filter(r => r.reportDate >= fromStr && r.reportDate <= toStr);
};

const getAggregatedMetrics = (filteredReports) => {
  return filteredReports.reduce(
    (acc, r) => {
      acc.totalSalesAmount += Number(r.totalSalesAmount || 0);
      acc.totalPurchaseCost += Number(r.totalPurchaseCost || 0);
      acc.grossProfit += Number(r.grossProfit || 0);
      acc.netProfit += Number(r.netProfit || 0);
      acc.totalCashReceived += Number(r.totalCashReceived || 0);
      acc.totalDueCollected += Number(r.totalDueCollected || 0);
      acc.totalCustomerDueCreated += Number(r.totalCustomerDueCreated || 0);
      acc.totalAmountPaidToCompanies += Number(r.totalAmountPaidToCompanies || 0);
      acc.totalCompanyPayable += Number(r.totalCompanyPayable || 0);
      acc.totalTransactions += Number(r.totalTransactions || 0);
      return acc;
    },
    {
      totalSalesAmount: 0,
      totalPurchaseCost: 0,
      grossProfit: 0,
      netProfit: 0,
      totalCashReceived: 0,
      totalDueCollected: 0,
      totalCustomerDueCreated: 0,
      totalAmountPaidToCompanies: 0,
      totalCompanyPayable: 0,
      totalTransactions: 0
    }
  );
};

export {
  loadReports,
  saveReports,
  getTodayReport,
  getReportByDate,
  generateDailyReport,
  ensureTodayReportExists,
  filterReports,
  getAggregatedMetrics,
  todayStr,
  nowTimestamp,
  STORAGE_KEY
};
