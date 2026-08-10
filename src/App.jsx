import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Login from './components/Login';
import CustomerPanel from './components/CustomerPanel';
import CompanyPanel from './components/CompanyPanel';
import { initialMedicines, initialTransactions, initialCompanies, initialCustomers } from './utils/mockData';
import { rebuildCustomerHistoryTimeline, summarizeCustomerBalances } from './utils/customerHistory';
import { rebuildCompanyTransactionTimeline, summarizeCompanyBalances } from './utils/companyHistory';
import { addCompanyHistoryRecord, addInventoryHistoryRecord } from './utils/historyUtils';
import { addMedicineHistoryRecord } from './utils/medicineHistoryUtils';
import { formatBatchLabel, normalizeMedicineRecord } from './utils/inventoryBatchUtils';
import { translations } from './utils/translations';
import './App.css';

const readStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    return JSON.parse(saved);
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}"`, error);
    return fallback;
  }
};

const buildTransactionIndex = (transactions) => {
  const index = new Map();
  for (const tx of Array.isArray(transactions) ? transactions : []) {
    if (!tx || typeof tx !== 'object') continue;
    if (tx.id && !index.has(tx.id)) {
      index.set(tx.id, tx);
    }
  }
  return index;
};

const enrichSaleHistoryEntries = (customer, transactionIndex) => {
  if (!Array.isArray(customer?.paymentHistory)) return customer;
  const enriched = customer.paymentHistory.map((entry) => {
    if (entry && entry.type === 'sale') {
      const hasMissingProducts = !Array.isArray(entry.products) || entry.products.length === 0;
      const hasMissingFields = !entry.totalPurchaseAmount && !entry.totalBill && !entry.totalAmount;
      if (hasMissingProducts || hasMissingFields) {
        const tx = entry.invoiceNumber ? transactionIndex.get(entry.invoiceNumber) : null;
        if (tx) {
          const products = Array.isArray(tx.items)
            ? tx.items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price }))
            : [];
          const totalAmount = Number(tx.total || 0);
          const cashReceived = Number(tx.cashReceived || 0);
          const dueAmount = Number(Math.max(0, totalAmount - cashReceived).toFixed(2));
          return {
            ...entry,
            products: hasMissingProducts ? products : entry.products,
            totalPurchaseAmount: entry.totalPurchaseAmount || totalAmount,
            totalBill: entry.totalBill || totalAmount,
            totalAmount: entry.totalAmount || totalAmount,
            cashPaid: entry.cashPaid ?? entry.cashAmount ?? entry.amountReceived ?? cashReceived,
            dueCreated: entry.dueCreated ?? dueAmount,
            cashAmount: entry.cashAmount ?? cashReceived,
            amountReceived: entry.amountReceived ?? cashReceived,
          };
        }
      }
    }
    return entry;
  });

  // Also enrich dueEntries with product info via invoiceNumber lookup
  const enrichedDueEntries = (Array.isArray(customer?.dueEntries) ? customer.dueEntries : []).map((entry) => {
    if (entry && entry.type === 'sale') {
      const hasMissingProducts = !Array.isArray(entry.products) || entry.products.length === 0;
      const hasTotalAmount = typeof entry.totalAmount !== 'undefined' && entry.totalAmount !== null;
      const hasCash = typeof entry.cashAmount !== 'undefined' && entry.cashAmount !== null;
      if (hasMissingProducts || !hasTotalAmount || !hasCash) {
        const tx = entry.invoiceNumber ? transactionIndex.get(entry.invoiceNumber) : null;
        if (tx) {
          const products = Array.isArray(tx.items)
            ? tx.items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price }))
            : [];
          const totalAmount = Number(tx.total || 0);
          const cashReceived = Number(tx.cashReceived || 0);
          return {
            ...entry,
            products: hasMissingProducts ? products : entry.products,
            totalAmount: entry.totalAmount ?? totalAmount,
            cashAmount: entry.cashAmount ?? cashReceived,
            dueAmount: entry.dueAmount ?? Number(Math.max(0, totalAmount - cashReceived).toFixed(2)),
          };
        }
      }
    }
    return entry;
  });

  return { ...customer, paymentHistory: enriched, dueEntries: enrichedDueEntries };
};

const cleanupCustomer = (customer, transactionIndex) => {
  const enriched = enrichSaleHistoryEntries(customer, transactionIndex);
  return normalizeCustomer(enriched);
};

const normalizeCustomer = (customer) => {
  const source = customer && typeof customer === 'object' ? customer : {};
  const historySummary = summarizeCustomerBalances(Array.isArray(source.paymentHistory) ? source.paymentHistory : []);
  const hasHistory = historySummary.paymentHistory.length > 0;
  let totalPurchaseAmount = Number(hasHistory ? historySummary.totalPurchaseAmount : (source.totalPurchaseAmount ?? 0));
  const cashPaid = Number(hasHistory ? historySummary.cashPaid : (source.cashPaid ?? 0));
  const dueAmount = Number(hasHistory ? historySummary.dueAmount : (source.dueAmount ?? source.totalDue ?? 0));

  const expectedTotal = Number((cashPaid + dueAmount).toFixed(2));
  if (totalPurchaseAmount < expectedTotal) {
    totalPurchaseAmount = expectedTotal;
  }

  return {
    ...source,
    totalPurchaseAmount,
    cashPaid,
    dueAmount,
    totalDue: dueAmount,
    paymentHistory: historySummary.paymentHistory
  };
};

const normalizeCompany = (company) => {
  const source = company && typeof company === 'object' ? company : {};
  const historySummary = summarizeCompanyBalances(Array.isArray(source.transactionHistory) ? source.transactionHistory : []);
  const hasHistory = historySummary.transactionHistory.length > 0;
  const totalPurchaseAmount = Number(hasHistory ? historySummary.totalPurchaseAmount : (source.totalPurchaseAmount ?? 0));
  const amountPaid = Number(hasHistory ? historySummary.amountPaid : (source.amountPaid ?? 0));
  const dueAmount = Number(hasHistory ? historySummary.dueAmount : (source.dueAmount ?? (totalPurchaseAmount - amountPaid)));

  return {
    ...source,
    contact: source.contact || '',
    address: source.address || '',
    totalPurchaseAmount,
    amountPaid,
    dueAmount,
    transactionHistory: historySummary.transactionHistory
  };
};

const mergeSeedRecords = (savedRecords, seedRecords) => {
  const merged = new Map();

  const addRecord = (record) => {
    if (!record || typeof record !== 'object') return;

    const recordId = record.id;
    if (recordId === undefined || recordId === null || recordId === '') return;

    merged.set(String(recordId), record);
  };

  for (const record of Array.isArray(seedRecords) ? seedRecords : []) {
    addRecord(record);
  }

  for (const record of Array.isArray(savedRecords) ? savedRecords : []) {
    addRecord(record);
  }

  return [...merged.values()];
};

// Attach the current local time to a (possibly date-only) value so every
// history record stores a full Date+Time timestamp. Used for sorting + display.
const withTime = (value) => {
  const day = (value || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 8);
  return new Date(`${day}T${time}`).toISOString();
};

function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('shabab_logged_in') === 'true';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('shabab_role') || 'Staff';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('shabab_language') || 'en';
  });

  // Finance lock ref - Reports can register a lock function here
  const lockFinanceRef = React.useRef(null);
  const registerLockFinance = (lockFn) => {
    lockFinanceRef.current = lockFn;
  };

  const currentRoleRef = React.useRef(currentRole);
  React.useEffect(() => {
    currentRoleRef.current = currentRole;
  }, [currentRole]);

  const lockFinance = () => {
    if (lockFinanceRef.current) {
      lockFinanceRef.current();
    }
  };

  // Global States (preserves state across browser tabs using localStorage)
  const [medicines, setMedicines] = useState(() => {
    return readStoredJson('shabab_medicines', initialMedicines).map(normalizeMedicineRecord);
  });

  const [transactions, setTransactions] = useState(() => {
    return readStoredJson('shabab_transactions', initialTransactions);
  });

  const [customers, setCustomers] = useState(() => {
    const parsed = readStoredJson('shabab_customers', []);
    const merged = mergeSeedRecords(parsed, initialCustomers);
    const storedTransactions = readStoredJson('shabab_transactions', initialTransactions);
    const transactionIndex = buildTransactionIndex([...storedTransactions, ...initialTransactions]);
    return merged.map((c) => cleanupCustomer(c, transactionIndex));
  });

  const [companies, setCompanies] = useState(() => {
    const parsed = readStoredJson('shabab_companies', initialCompanies);
    const resolved = Array.isArray(parsed) && parsed.length > 0 ? parsed : initialCompanies;
    return resolved.map(normalizeCompany);
  });

  const [shopBalance, setShopBalance] = useState(() => {
    const saved = localStorage.getItem('shabab_shop_balance');
    return saved ? Number(saved) : 0;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventoryFilter, setInventoryFilter] = useState('All');

  // Persist states to Local Storage on change
  useEffect(() => {
    localStorage.setItem('shabab_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('shabab_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('shabab_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('shabab_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('shabab_shop_balance', String(shopBalance));
  }, [shopBalance]);

  useEffect(() => {
    localStorage.setItem('shabab_language', language);
  }, [language]);

  // Adjust active tab if switching to Staff and currently on restricted Reports tab
  useEffect(() => {
    if (currentRole === 'Staff' && activeTab === 'reports') {
      setActiveTab('dashboard');
    }
  }, [currentRole, activeTab]);

  // Authentication Handlers
  const handleLogin = (role) => {
    setCurrentRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('shabab_role', role);
    localStorage.setItem('shabab_logged_in', 'true');
    setActiveTab('dashboard'); // reset to dashboard on login
  };

  const handleLogout = () => {
    lockFinance();
    setIsLoggedIn(false);
    localStorage.removeItem('shabab_logged_in');
  };

  // Inventory Management State Mutation handlers
  const handleAddMedicine = (newMed) => {
    setMedicines(prev => [normalizeMedicineRecord(newMed), ...prev]);
  };

  const handleUpdateMedicine = (updatedMed) => {
    setMedicines(prev => prev.map(m => (
      m.id === updatedMed.id
        ? normalizeMedicineRecord({ ...m, ...updatedMed, batches: updatedMed.batches || m.batches })
        : m
    )));
  };

  const handleDeleteMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  // Stock reduction when items are sold in POS
  const handleUpdateMedicinesStock = (cartItems) => {
    const parseBatchNumber = (label) => {
      const match = String(label || '').match(/Batch\s+(\d+)/i);
      return match ? Number(match[1]) : null;
    };

    setMedicines(prev => prev.map((medicine) => {
      const saleLines = Array.isArray(cartItems)
        ? cartItems.filter((item) => (item.medicineId || item.id) === medicine.id)
        : [];

      if (saleLines.length === 0) return medicine;

      const normalizedMedicine = normalizeMedicineRecord(medicine);
      const originalTotalStock = Number(normalizedMedicine.stock || 0);
      let runningBatches = normalizedMedicine.batches.map((batch) => ({ ...batch }));

      saleLines.forEach((line) => {
        const batchNumber = Number(line.batchNumber || parseBatchNumber(line.batchNo));
        const batchLabel = line.batchNo || formatBatchLabel(batchNumber);
        const batchIndex = runningBatches.findIndex((batch) => {
          return batch.batchNumber === batchNumber || batch.batchLabel === batchLabel;
        });

        if (batchIndex === -1) return;

        const targetBatch = runningBatches[batchIndex];
        const previousBatchStock = Number(targetBatch.quantity || 0);
        const soldQty = Math.min(previousBatchStock, Number(line.quantity || 0));
        const currentBatchStock = Math.max(0, previousBatchStock - soldQty);

        runningBatches[batchIndex] = {
          ...targetBatch,
          quantity: currentBatchStock,
        };

        addInventoryHistoryRecord({
          medicineName: normalizedMedicine.name,
          companyName: '-',
          category: normalizedMedicine.category,
          animalType: normalizedMedicine.animalType,
          batchNo: batchLabel,
          batchNumber,
          previousStock: previousBatchStock,
          addedQuantity: -soldQty,
          newTotalStock: currentBatchStock,
          purchaseCost: Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0),
          sellingPrice: Number(targetBatch.sellingPrice || normalizedMedicine.price || 0),
          totalAmount: Number((Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0) * soldQty).toFixed(2)),
          expiryDate: targetBatch.expiryDate || normalizedMedicine.expiryDate,
          shelfLocation: targetBatch.location || normalizedMedicine.location,
          addedBy: currentRoleRef.current || 'Staff',
          action: 'Sold',
        }, currentRoleRef.current || 'Staff');

        if (currentBatchStock < 15 && previousBatchStock >= 15) {
          addInventoryHistoryRecord({
            medicineName: normalizedMedicine.name,
            companyName: '-',
            category: normalizedMedicine.category,
            animalType: normalizedMedicine.animalType,
            batchNo: batchLabel,
            batchNumber,
            previousStock: previousBatchStock,
            addedQuantity: 0,
            newTotalStock: currentBatchStock,
            purchaseCost: Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0),
            sellingPrice: Number(targetBatch.sellingPrice || normalizedMedicine.price || 0),
            totalAmount: 0,
            expiryDate: targetBatch.expiryDate || normalizedMedicine.expiryDate,
            shelfLocation: targetBatch.location || normalizedMedicine.location,
            addedBy: currentRoleRef.current || 'Staff',
            action: 'Status Changed',
          }, currentRoleRef.current || 'Staff');
        }

        if (currentBatchStock === 0 && previousBatchStock > 0) {
          addInventoryHistoryRecord({
            medicineName: normalizedMedicine.name,
            companyName: '-',
            category: normalizedMedicine.category,
            animalType: normalizedMedicine.animalType,
            batchNo: batchLabel,
            batchNumber,
            previousStock: previousBatchStock,
            addedQuantity: 0,
            newTotalStock: currentBatchStock,
            purchaseCost: Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0),
            sellingPrice: Number(targetBatch.sellingPrice || normalizedMedicine.price || 0),
            totalAmount: 0,
            expiryDate: targetBatch.expiryDate || normalizedMedicine.expiryDate,
            shelfLocation: targetBatch.location || normalizedMedicine.location,
            addedBy: currentRoleRef.current || 'Staff',
            action: 'Status Changed',
            notes: 'Completed / Stock Finished',
          }, currentRoleRef.current || 'Staff');
        }

        addMedicineHistoryRecord({
          medicineId: normalizedMedicine.id,
          medicineName: normalizedMedicine.name,
          genericName: normalizedMedicine.genericName,
          category: normalizedMedicine.category,
          animalType: normalizedMedicine.animalType,
          action: 'Sold',
          previousStock: previousBatchStock,
          addedQuantity: -soldQty,
          currentStock: currentBatchStock,
          purchaseCost: Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0),
          sellingPrice: Number(targetBatch.sellingPrice || normalizedMedicine.price || 0),
          expiryDate: targetBatch.expiryDate || normalizedMedicine.expiryDate,
          shelfLocation: targetBatch.location || normalizedMedicine.location,
          batchNo: batchLabel,
          batchNumber,
          supplier: '-',
          notes: `Sold via POS - ${soldQty} unit(s)`,
        }, currentRoleRef.current || 'Staff');

        if (currentBatchStock < 15 && previousBatchStock >= 15) {
          addMedicineHistoryRecord({
            medicineId: normalizedMedicine.id,
            medicineName: normalizedMedicine.name,
            genericName: normalizedMedicine.genericName,
            category: normalizedMedicine.category,
            animalType: normalizedMedicine.animalType,
            action: 'Status Changed',
            previousStock: previousBatchStock,
            addedQuantity: 0,
            currentStock: currentBatchStock,
            purchaseCost: Number(targetBatch.purchaseCost || normalizedMedicine.cost || 0),
            sellingPrice: Number(targetBatch.sellingPrice || normalizedMedicine.price || 0),
            expiryDate: targetBatch.expiryDate || normalizedMedicine.expiryDate,
            shelfLocation: targetBatch.location || normalizedMedicine.location,
            batchNo: batchLabel,
            batchNumber,
            supplier: '-',
            notes: 'Low stock warning - stock below 15',
          }, currentRoleRef.current || 'Staff');
        }
      });

      const nextMedicine = {
        ...normalizedMedicine,
        batches: runningBatches,
        stock: runningBatches.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0),
      };

      if (nextMedicine.stock < 15 && originalTotalStock >= 15) {
        addMedicineHistoryRecord({
          medicineId: normalizedMedicine.id,
          medicineName: normalizedMedicine.name,
          genericName: normalizedMedicine.genericName,
          category: normalizedMedicine.category,
          animalType: normalizedMedicine.animalType,
          action: 'Status Changed',
          previousStock: originalTotalStock,
          addedQuantity: 0,
          currentStock: nextMedicine.stock,
          purchaseCost: Number(nextMedicine.cost || 0),
          sellingPrice: Number(nextMedicine.price || 0),
          expiryDate: nextMedicine.expiryDate,
          shelfLocation: nextMedicine.location,
          batchNo: '-',
          supplier: '-',
          notes: 'Low stock warning - stock below 15',
        }, currentRoleRef.current || 'Staff');
      }

      return nextMedicine;
    }));
  };

  // Append new transactions from checkout flow
  const handleCheckoutSuccess = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleAddCustomer = (newCustomer) => {
    const normalizedCustomer = normalizeCustomer({
      ...newCustomer,
      createdAt: newCustomer.createdAt || new Date().toISOString()
    });
    setCustomers(prev => [normalizedCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    const normalizedCustomer = normalizeCustomer(updatedCustomer);
    setCustomers(prev => prev.map(customer => customer.id === normalizedCustomer.id ? normalizedCustomer : customer));
  };

  const handleDeleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const handleRecordCustomerSale = (customerId, saleSummary) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id !== customerId) return customer;

      const normalizedCustomer = normalizeCustomer(customer);
      const totalAmount = Number(saleSummary?.totalAmount || 0);
      const cashAmount = Number(saleSummary?.cashAmount || 0);
      const dueAmount = Number(Math.max(0, totalAmount - cashAmount).toFixed(2));
      const purchaseDate = saleSummary?.purchaseDate || new Date().toISOString();
      const overallDueAfterSale = Number((normalizedCustomer.dueAmount + dueAmount).toFixed(2));

      const nextPurchaseAmount = Number((normalizedCustomer.totalPurchaseAmount + totalAmount).toFixed(2));
      const nextCashPaid = Number((normalizedCustomer.cashPaid + cashAmount).toFixed(2));
      const nextDueAmount = Number((normalizedCustomer.dueAmount + dueAmount).toFixed(2));
      const saleInvoice = saleSummary?.invoiceNumber || `TX-${Math.floor(1000 + Math.random() * 9000)}`;

      const nextEntries = [
        ...(normalizedCustomer.dueEntries || []),
        {
          id: `sale-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'sale',
          createdAt: purchaseDate,
          purchaseDate,
          invoiceNumber: saleInvoice,
          products: Array.isArray(saleSummary?.products) ? saleSummary.products : [],
          totalAmount,
          cashAmount,
          dueAmount,
          totalOutstandingDue: overallDueAfterSale,
          paymentType: saleSummary?.paymentType || 'cash'
        }
      ];

      const paymentHistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'sale',
        createdAt: purchaseDate,
        purchaseDate,
        invoiceNumber: saleInvoice,
        products: Array.isArray(saleSummary?.products) ? saleSummary.products : [],
        totalPurchaseAmount: totalAmount,
        cashPaid: cashAmount,
        dueCreated: dueAmount,
        totalOutstandingDue: overallDueAfterSale,
        paymentStatus: overallDueAfterSale <= 0 ? 'Paid' : cashAmount > 0 ? 'Partial Due' : 'Full Due'
      };

      if (cashAmount > 0) {
        setShopBalance(prev => Number((prev + cashAmount).toFixed(2)));
      }

      return {
        ...normalizedCustomer,
        totalPurchaseAmount: nextPurchaseAmount,
        cashPaid: nextCashPaid,
        dueAmount: nextDueAmount,
        totalDue: nextDueAmount,
        dueEntries: nextEntries,
        paymentHistory: rebuildCustomerHistoryTimeline([...(normalizedCustomer.paymentHistory || []), paymentHistoryEntry])
      };
    }));
  };

  const handleReceivePayment = (customerId, amount, paymentDate) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id !== customerId) return customer;

      const normalizedCustomer = normalizeCustomer(customer);
      const paymentAmount = Number(amount || 0);
      const paymentDateValue = paymentDate || new Date().toISOString();
      const previousDue = Number(normalizedCustomer.dueAmount || 0);
      const nextDueAmount = Number(Math.max(0, previousDue - paymentAmount).toFixed(2));

      const nextEntries = [
        ...(normalizedCustomer.dueEntries || []),
        {
          id: `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: 'payment',
          createdAt: paymentDateValue,
          paymentDate: paymentDateValue,
          paymentAmount,
          previousDue,
          remainingDue: nextDueAmount
        }
      ];

      const nextHistory = [...(normalizedCustomer.paymentHistory || [])];
      const openEntryIndex = nextHistory.slice().reverse().findIndex(entry => entry.type === 'sale' && Number(entry.remainingDue || 0) > 0);
      const targetIndex = openEntryIndex >= 0 ? nextHistory.length - 1 - openEntryIndex : -1;
      const affectedInvoice = targetIndex >= 0 ? nextHistory[targetIndex].invoiceNumber : null;
      const targetPreviousDue = targetIndex >= 0
        ? Number(nextHistory[targetIndex].remainingDue ?? nextHistory[targetIndex].totalOutstandingDue ?? normalizedCustomer.dueAmount ?? 0)
        : Number(normalizedCustomer.dueAmount || 0);

      const paymentEntry = {
        id: `pay-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'payment',
        createdAt: withTime(paymentDateValue),
        paymentDate: paymentDateValue,
        invoiceNumber: affectedInvoice,
        paymentAmount,
        previousDue: targetPreviousDue,
        remainingDue: nextDueAmount,
        totalOutstandingDue: nextDueAmount
      };
      nextHistory.push(paymentEntry);
      const rebuiltSummary = summarizeCustomerBalances(nextHistory);

      setShopBalance(prev => Number((prev + paymentAmount).toFixed(2)));

      return {
        ...normalizedCustomer,
        cashPaid: Number((normalizedCustomer.cashPaid + paymentAmount).toFixed(2)),
        dueAmount: rebuiltSummary.dueAmount,
        totalDue: rebuiltSummary.totalDue,
        dueEntries: nextEntries,
        paymentHistory: rebuiltSummary.paymentHistory
      };
    }));
  };

  const handleAddCompany = (newCompany) => {
    const normalizedCompany = normalizeCompany({
      ...newCompany,
      transactionHistory: rebuildCompanyTransactionTimeline(Array.isArray(newCompany.transactionHistory) ? newCompany.transactionHistory : [])
    });
    setCompanies(prev => [normalizedCompany, ...prev]);

    const role = currentRoleRef.current || 'Staff';
    addCompanyHistoryRecord({
      companyName: normalizedCompany.name,
      medicineNames: '-',
      quantity: 0,
      totalAmount: 0,
      amountPaid: 0,
      remainingPayable: 0,
      paymentStatus: 'Paid',
      addedBy: role,
    }, role);
  };

  const handleUpdateCompany = (updatedCompany) => {
    const normalizedCompany = normalizeCompany(updatedCompany);
    setCompanies(prev => prev.map(company => company.id === normalizedCompany.id ? normalizedCompany : company));

    const role = currentRoleRef.current || 'Staff';
    addCompanyHistoryRecord({
      companyName: normalizedCompany.name,
      medicineNames: '-',
      quantity: 0,
      totalAmount: 0,
      amountPaid: 0,
      remainingPayable: 0,
      paymentStatus: 'Paid',
      addedBy: role,
    }, role);
  };

  const handleDeleteCompany = (id) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
  };

  const handleAddCompanyPurchase = (companyId, summary) => {
    setCompanies(prev => prev.map(company => {
      if (company.id !== companyId) return company;

      const normalizedCompany = normalizeCompany(company);
      const totalAmount = Number(summary?.totalAmount || 0);
      const amountPaid = Number(summary?.amountPaid || 0);
      const purchaseDate = summary?.purchaseDate || new Date().toISOString();

      const purchaseTx = {
        id: `ctx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'purchase',
        createdAt: withTime(purchaseDate),
        date: purchaseDate,
        products: Array.isArray(summary?.products) ? summary.products : [],
        totalAmount,
        amountPaid,
        dueAmount: Number((totalAmount - amountPaid).toFixed(2)),
        dueDate: summary?.dueDate || null,
        paymentDate: amountPaid >= totalAmount ? purchaseDate : null,
        totalOutstandingDue: Number((normalizedCompany.dueAmount + Math.max(0, totalAmount - amountPaid)).toFixed(2))
      };
      const rebuilt = summarizeCompanyBalances([...(normalizedCompany.transactionHistory || []), purchaseTx]);

      const role = currentRoleRef.current || 'Staff';
      const medicineNames = Array.isArray(summary?.products)
        ? summary.products.map(p => p.name).join(', ')
        : '-';
      const quantity = Array.isArray(summary?.products)
        ? summary.products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
        : 0;

      addCompanyHistoryRecord({
        companyName: company.name,
        medicineNames,
        quantity,
        totalAmount,
        amountPaid,
        remainingPayable: Number((totalAmount - amountPaid).toFixed(2)),
        paymentStatus: amountPaid >= totalAmount ? 'Paid' : 'Due',
        addedBy: role,
      }, role);

      return {
        ...normalizedCompany,
        totalPurchaseAmount: rebuilt.totalPurchaseAmount,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };
    }));
  };

  const handleRecordCompanyPayment = (companyId, amount, paymentDate) => {
    setCompanies(prev => prev.map(company => {
      if (company.id !== companyId) return company;

      const normalizedCompany = normalizeCompany(company);
      const paymentAmount = Number(amount || 0);
      const paymentDateValue = paymentDate || new Date().toISOString();
      const previousDue = Number(normalizedCompany.dueAmount || 0);
      const nextDue = Number(Math.max(0, previousDue - paymentAmount).toFixed(2));

      const paymentTx = {
        id: `ctx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'payment',
        createdAt: withTime(paymentDateValue),
        date: paymentDateValue,
        amount: paymentAmount,
        previousDue,
        remainingDue: nextDue,
        totalOutstandingDue: nextDue
      };

      const rebuilt = summarizeCompanyBalances([...(normalizedCompany.transactionHistory || []), paymentTx]);

      const role = currentRoleRef.current || 'Staff';
      addCompanyHistoryRecord({
        companyName: company.name,
        medicineNames: '-',
        quantity: 0,
        totalAmount: 0,
        amountPaid: paymentAmount,
        remainingPayable: nextDue,
        paymentStatus: nextDue <= 0 ? 'Paid' : 'Partial',
        addedBy: role,
      }, role);

      return {
        ...normalizedCompany,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };
    }));
  };

  const handleEditCompanyTransaction = (companyId, txId, updated) => {
    setCompanies(prev => prev.map(company => {
      if (company.id !== companyId) return company;

      const normalizedCompany = normalizeCompany(company);
      const nextHistory = (normalizedCompany.transactionHistory || []).map(tx => {
        if (tx.id !== txId || tx.type !== 'purchase') return tx;

        const totalAmount = Number(updated.totalAmount || 0);
        const amountPaid = Number(updated.amountPaid || 0);
        const purchaseDate = updated.purchaseDate || tx.date;

        return {
          ...tx,
          products: Array.isArray(updated.products) ? updated.products : tx.products,
          totalAmount,
          amountPaid,
          dueAmount: Number((totalAmount - amountPaid).toFixed(2)),
          createdAt: new Date().toISOString(),
          date: purchaseDate,
          paymentDate: amountPaid >= totalAmount ? purchaseDate : (tx.paymentDate || null)
        };
      });
      const rebuilt = summarizeCompanyBalances(nextHistory);

      const role = currentRoleRef.current || 'Staff';
      const medicineNames = Array.isArray(updated?.products)
        ? updated.products.map(p => p.name).join(', ')
        : '-';
      const quantity = Array.isArray(updated?.products)
        ? updated.products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
        : 0;
      const totalAmount = Number(updated?.totalAmount || 0);
      const amountPaid = Number(updated?.amountPaid || 0);

      addCompanyHistoryRecord({
        companyName: company.name,
        medicineNames,
        quantity,
        totalAmount,
        amountPaid,
        remainingPayable: Number((totalAmount - amountPaid).toFixed(2)),
        paymentStatus: amountPaid >= totalAmount ? 'Paid' : 'Due',
        addedBy: role,
      }, role);

      return {
        ...normalizedCompany,
        totalPurchaseAmount: rebuilt.totalPurchaseAmount,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };
    }));
  };

  // Router switcher view helper
  const t = translations[language];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            medicines={medicines}
            transactions={transactions}
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            setInventoryFilter={setInventoryFilter}
            language={language}
            t={t}
          />
        );
      case 'pos':
        return (
          <POS
            medicines={medicines}
            updateMedicinesStock={handleUpdateMedicinesStock}
            onCheckoutSuccess={handleCheckoutSuccess}
            onCreditSale={handleRecordCustomerSale}
            onAddCustomer={handleAddCustomer}
            customers={customers}
            currentRole={currentRole}
            language={language}
            t={t}
          />
        );
      case 'inventory':
        return (
          <Inventory
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            currentRole={currentRole}
            alertFilter={inventoryFilter}
            setAlertFilter={setInventoryFilter}
            language={language}
            t={t}
          />
        );
      case 'reports':
        return (
          <Reports
            transactions={transactions}
            medicines={medicines}
            customers={customers}
            companies={companies}
            currentRole={currentRole}
            language={language}
            t={t}
            onNavigateAway={registerLockFinance}
          />
        );
      case 'customers':
        return (
          <CustomerPanel
            customers={customers}
            shopBalance={shopBalance}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onReceivePayment={handleReceivePayment}
            currentRole={currentRole}
            language={language}
            t={t}
          />
        );
      case 'companies':
        return (
          <CompanyPanel
            companies={companies}
            onAddCompany={handleAddCompany}
            onUpdateCompany={handleUpdateCompany}
            onDeleteCompany={handleDeleteCompany}
            onAddCompanyPurchase={handleAddCompanyPurchase}
            onRecordCompanyPayment={handleRecordCompanyPayment}
            onEditCompanyTransaction={handleEditCompanyTransaction}
            language={language}
            t={t}
          />
        );
      default:
        return (
          <Dashboard
            medicines={medicines}
            transactions={transactions}
            currentRole={currentRole}
            setActiveTab={setActiveTab}
            language={language}
            t={t}
          />
        );
    }
  };

  // Render Login view if session is not authenticated
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLogin} language={language} setLanguage={setLanguage} t={t} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (activeTab === 'reports' && tab !== 'reports') {
            lockFinance();
          }
          setActiveTab(tab);
          if (tab === 'inventory') {
            setInventoryFilter('All');
          }
        }} 
        currentRole={currentRole}
        language={language}
        t={t}
      />
      
      {/* App Main Area Content */}
      <div className="main-content">
        <Header 
          currentRole={currentRole} 
          onLogout={handleLogout}
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
        {renderActiveView()}
      </div>
    </div>
  );
}

export default App;
