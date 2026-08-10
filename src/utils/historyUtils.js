const INVENTORY_HISTORY_KEY = 'shabab_inventory_history';
const COMPANY_HISTORY_KEY = 'shabab_company_history';

const now = () => new Date().toISOString();

const load = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const formatBatchLabel = (batchNumber) => {
  const numeric = Number(batchNumber);
  return Number.isFinite(numeric) && numeric > 0 ? `Batch ${Math.floor(numeric)}` : '-';
};

export const loadInventoryHistory = () => load(INVENTORY_HISTORY_KEY);
export const saveInventoryHistory = (records) => save(INVENTORY_HISTORY_KEY, records);

export const loadCompanyHistory = () => load(COMPANY_HISTORY_KEY);
export const saveCompanyHistory = (records) => save(COMPANY_HISTORY_KEY, records);

export const addInventoryHistoryRecord = (record, currentUserRole) => {
  const records = loadInventoryHistory();
  const entry = {
    id: uid('inv-hist'),
    createdAt: now(),
    addedBy: currentUserRole || 'Staff',
    ...record,
  };
  records.unshift(entry);
  saveInventoryHistory(records);
  return entry;
};

export const addCompanyHistoryRecord = (record, currentUserRole) => {
  const records = loadCompanyHistory();
  const entry = {
    id: uid('comp-hist'),
    createdAt: now(),
    addedBy: currentUserRole || 'Staff',
    ...record,
  };
  records.unshift(entry);
  saveCompanyHistory(records);
  return entry;
};

export const generateInventoryHistoryFromMedicines = (medicines = [], currentUserRole = 'Admin') => {
  if (!Array.isArray(medicines) || medicines.length === 0) return [];

  return medicines.map((medicine) => {
    const batches = Array.isArray(medicine.batches) ? medicine.batches : [];
    const firstBatch = batches[0] || null;
    const purchaseCost = Number(medicine.cost || 0);
    const quantity = Number(medicine.stock || 0);
    const sellingPrice = Number(medicine.price || 0);
    const totalAmount = Number((purchaseCost * quantity).toFixed(2));

    return {
      id: uid('inv-hist'),
      createdAt: now(),
      medicineName: medicine.name || '-',
      companyName: '-',
      category: medicine.category || '-',
      batchNo: firstBatch?.batchLabel || formatBatchLabel(firstBatch?.batchNumber),
      previousStock: 0,
      addedQuantity: quantity,
      newTotalStock: quantity,
      purchaseCost,
      sellingPrice,
      totalAmount,
      expiryDate: medicine.expiryDate || '-',
      shelfLocation: medicine.location || '-',
      addedBy: currentUserRole,
      action: 'Stock In',
    };
  });
};

export const generateCompanyHistoryFromCompanies = (companies = [], currentUserRole = 'Admin') => {
  if (!Array.isArray(companies) || companies.length === 0) return [];

  const records = [];

  companies.forEach((company) => {
    const history = Array.isArray(company.transactionHistory) ? company.transactionHistory : [];

    if (history.length === 0) {
      records.push({
        id: uid('comp-hist'),
        createdAt: now(),
        companyName: company.name || '-',
        medicineNames: '-',
        quantity: 0,
        totalAmount: Number(company.totalPurchaseAmount || 0),
        amountPaid: Number(company.amountPaid || 0),
        remainingPayable: Number(company.dueAmount || 0),
        paymentStatus: Number(company.dueAmount || 0) <= 0 ? 'Paid' : 'Due',
        addedBy: currentUserRole,
      });
      return;
    }

    history.forEach((tx) => {
      if (tx.type !== 'purchase') return;

      const totalAmount = Number(tx.totalAmount || 0);
      const amountPaid = Number(tx.amountPaid || 0);
      const remainingPayable = Number(tx.dueAmount || (totalAmount - amountPaid));
      const paymentStatus = remainingPayable <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Due';

      const products = Array.isArray(tx.products) ? tx.products : [];
      const medicineNames = products.map((p) => p.name).join(', ') || '-';
      const quantity = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

      records.push({
        id: uid('comp-hist'),
        createdAt: tx.createdAt || now(),
        companyName: company.name || '-',
        medicineNames,
        quantity,
        totalAmount,
        amountPaid,
        remainingPayable,
        paymentStatus,
        addedBy: currentUserRole,
      });
    });
  });

  return records;
};

export const syncHistoryWithPanelData = (medicines = [], companies = [], currentUserRole = 'Admin') => {
  const inventoryRecords = generateInventoryHistoryFromMedicines(medicines, currentUserRole);
  const companyRecords = generateCompanyHistoryFromCompanies(companies, currentUserRole);

  saveInventoryHistory(inventoryRecords);
  saveCompanyHistory(companyRecords);

  return {
    inventoryRecords,
    companyRecords,
  };
};
