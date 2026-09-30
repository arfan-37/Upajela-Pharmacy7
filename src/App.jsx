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
import Returns from './components/Returns';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { translations } from './utils/translations';
import { generateDailyReport } from './utils/financialReports';
import { rebuildCustomerHistoryTimeline, summarizeCustomerBalances } from './utils/customerHistory';
import { rebuildCompanyTransactionTimeline, summarizeCompanyBalances } from './utils/companyHistory';
import { formatBatchLabel, normalizeMedicineRecord, isBatchExpired, getMedicineTotalStock, getMedicineBatches } from './utils/inventoryBatchUtils';
import { useToast } from './utils/toast';
import {
  getAllMedicines,
  upsertMany as upsertMedicines,
  getAllBatches,
  deleteMedicine,
} from './lib/repositories/medicinesRepo.js';
import {
  getAllTransactions,
  insertMany as insertTransactions,
  upsertMany as upsertTransactions,
} from './lib/repositories/transactionsRepo.js';
import {
  getAllCustomers,
  upsertMany as upsertCustomers,
  deleteCustomer,
} from './lib/repositories/customersRepo.js';
import {
  getAllCompanies,
  upsertMany as upsertCompanies,
  deleteCompany,
  insertCompanyTransaction,
} from './lib/repositories/companiesRepo.js';
import {
  getAllReturns,
  upsertMany as upsertReturns,
  insertReturn,
} from './lib/repositories/returnsRepo.js';
import {
  getShopBalance,
  setShopBalance,
} from './lib/repositories/shopBalanceRepo.js';
import { insertInventoryHistory } from './lib/repositories/inventoryHistoryRepo.js';
import { insertCompanyHistory } from './lib/repositories/companyHistoryRepo.js';
import { insertMedicineHistory } from './lib/repositories/medicineHistoryRepo.js';
import { upsertFinancialReport } from './lib/repositories/financialReportsRepo.js';
import { addInventoryHistoryRecord, addCompanyHistoryRecord } from './utils/historyUtils';
import { addMedicineHistoryRecord } from './utils/medicineHistoryUtils';
import './App.css';

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

  const { toast, hide: hideToast, notify } = useToast();

  // Global States
  const [medicines, setMedicines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [shopBalance, setShopBalance] = useState(0);
  const [returns, setReturns] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventoryFilter, setInventoryFilter] = useState('All');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [
          meds,
          txs,
          custs,
          comps,
          rets,
          balance,
        ] = await Promise.all([
          getAllMedicines().catch((e) => { console.warn('Failed to load medicines', e); return []; }),
          getAllTransactions().catch((e) => { console.warn('Failed to load transactions', e); return []; }),
          getAllCustomers().catch((e) => { console.warn('Failed to load customers', e); return []; }),
          getAllCompanies().catch((e) => { console.warn('Failed to load companies', e); return []; }),
          getAllReturns().catch((e) => { console.warn('Failed to load returns', e); return []; }),
          getShopBalance().catch((e) => { console.warn('Failed to load shop balance', e); return 0; }),
        ]);

        if (cancelled) return;

        console.log('[DEBUG] Loaded medicines count:', meds.length);
        console.log('[DEBUG] Sample medicine:', meds[0]);
        setMedicines(meds.map(normalizeMedicineRecord));
        setTransactions(txs);
        setCustomers(custs.map((c) => cleanupCustomer(c, buildTransactionIndex(txs))));
        setCompanies(comps.map(normalizeCompany));
        setReturns(rets);
        setShopBalance(Number(balance || 0));
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load data from Supabase', error);
        if (cancelled) return;
        setMedicines([]);
        setTransactions([]);
        setCustomers([]);
        setCompanies([]);
        setShopBalance(0);
        setReturns([]);
        setDataLoaded(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync state changes to Supabase after initial load
  useEffect(() => {
    if (!dataLoaded) return;
    upsertMedicines(medicines);
  }, [dataLoaded, medicines]);

  useEffect(() => {
    if (!dataLoaded) return;
    upsertTransactions(transactions);
  }, [dataLoaded, transactions]);

  useEffect(() => {
    if (!dataLoaded) return;
    upsertCustomers(customers);
  }, [dataLoaded, customers]);

  useEffect(() => {
    if (!dataLoaded) return;
    upsertCompanies(companies);
  }, [dataLoaded, companies]);

  useEffect(() => {
    if (!dataLoaded) return;
    upsertReturns(returns);
  }, [dataLoaded, returns]);

  useEffect(() => {
    if (!dataLoaded) return;
    setShopBalance(shopBalance);
  }, [dataLoaded, shopBalance]);

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
  const handleAddMedicine = async (newMed) => {
    try {
      const normalized = normalizeMedicineRecord(newMed);
      await upsertMedicines([normalized]);
      setMedicines(prev => [normalized, ...prev]);
    } catch (error) {
      console.error('Failed to add medicine to Supabase:', error);
      notify(error?.message || 'Failed to add medicine. Please try again.', 'error');
    }
  };

  const handleUpdateMedicine = async (updatedMed) => {
    try {
      const normalized = normalizeMedicineRecord({ ...updatedMed, batches: updatedMed.batches || [] });
      await upsertMedicines([normalized]);
      setMedicines(prev => prev.map(m => (
        m.id === normalized.id
          ? normalized
          : m
      )));
    } catch (error) {
      console.error('Failed to update medicine in Supabase:', error);
      notify(error?.message || 'Failed to update medicine. Please try again.', 'error');
    }
  };

  const handleDeleteMedicine = async (id) => {
    try {
      await deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete medicine from Supabase:', error);
      notify(error?.message || 'Failed to delete medicine. Please try again.', 'error');
    }
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
  const handleCheckoutSuccess = async (newTx) => {
    try {
      await upsertTransactions([newTx]);
      setTransactions(prev => [newTx, ...prev]);
    } catch (error) {
      console.error('Failed to save transaction to Supabase:', error);
      notify(error?.message || 'Failed to save transaction. Please try again.', 'error');
    }
  };

  const handleAddCustomer = async (newCustomer) => {
    try {
      const normalizedCustomer = normalizeCustomer({
        ...newCustomer,
        createdAt: newCustomer.createdAt || new Date().toISOString()
      });
      await upsertCustomers([normalizedCustomer]);
      setCustomers(prev => [normalizedCustomer, ...prev]);
    } catch (error) {
      console.error('Failed to add customer to Supabase:', error);
      notify(error?.message || 'Failed to add customer. Please try again.', 'error');
    }
  };

  const handleUpdateCustomer = async (updatedCustomer) => {
    try {
      const normalizedCustomer = normalizeCustomer(updatedCustomer);
      await upsertCustomers([normalizedCustomer]);
      setCustomers(prev => prev.map(customer => customer.id === normalizedCustomer.id ? normalizedCustomer : customer));
    } catch (error) {
      console.error('Failed to update customer in Supabase:', error);
      notify(error?.message || 'Failed to update customer. Please try again.', 'error');
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
        await deleteCustomer(id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Failed to delete customer from Supabase:', error);
      notify(error?.message || 'Failed to delete customer. Please try again.', 'error');
    }
  };

  const handleRecordCustomerSale = async (customerId, saleSummary) => {
    let updatedCustomers = [];
    let shopBalanceDelta = 0;

    updatedCustomers = customers.map(customer => {
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

      shopBalanceDelta += cashAmount;

      return {
        ...normalizedCustomer,
        totalPurchaseAmount: nextPurchaseAmount,
        cashPaid: nextCashPaid,
        dueAmount: nextDueAmount,
        totalDue: nextDueAmount,
        dueEntries: nextEntries,
        paymentHistory: rebuildCustomerHistoryTimeline([...(normalizedCustomer.paymentHistory || []), paymentHistoryEntry])
      };
    });

    try {
      await upsertCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
      if (shopBalanceDelta > 0) {
        const newBalance = Number((shopBalance + shopBalanceDelta).toFixed(2));
        await setShopBalance(newBalance);
        setShopBalance(newBalance);
      }
    } catch (error) {
      console.error('Failed to record customer sale in Supabase:', error);
      notify(error?.message || 'Failed to record customer sale. Please try again.', 'error');
    }
  };

  const handleReceivePayment = async (customerId, amount, paymentDate, paymentDelta = 0) => {
    let updatedCustomers = [];
    let shopBalanceDelta = paymentDelta;
    
    updatedCustomers = customers.map(customer => {
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

      return {
        ...normalizedCustomer,
        cashPaid: Number((normalizedCustomer.cashPaid + paymentAmount).toFixed(2)),
        dueAmount: rebuiltSummary.dueAmount,
        totalDue: rebuiltSummary.totalDue,
        dueEntries: nextEntries,
        paymentHistory: rebuiltSummary.paymentHistory
      };
    });

    try {
      await upsertCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
      if (shopBalanceDelta > 0) {
        const newBalance = Number((shopBalance + shopBalanceDelta).toFixed(2));
        await setShopBalance(newBalance);
        setShopBalance(newBalance);
      }
    } catch (error) {
      console.error('Failed to record customer payment in Supabase:', error);
      notify(error?.message || 'Failed to record customer payment. Please try again.', 'error');
    }
  };

  const handleProcessReturn = async ({ returns: returnRecords, originalTransaction, returnItems }) => {
    try {
      const updatedReturns = [...returnRecords, ...returns];
      const totalRefund = returnRecords.reduce((sum, r) => sum + r.refundAmount, 0);
      const originalCustomerId = originalTransaction.customer?.id;
      let updatedCustomers = customers;
      let updatedMedicines = medicines;
      let shopBalanceDelta = 0;

      if (totalRefund > 0) {
        if (originalTransaction.paymentType === 'cash') {
          shopBalanceDelta -= totalRefund;
        } else if (originalTransaction.paymentType === 'due' || originalTransaction.paymentType === 'partial') {
          if (originalCustomerId) {
            updatedCustomers = customers.map(customer => {
              if (customer.id !== originalCustomerId) return customer;
              const normalized = normalizeCustomer(customer);
              const previousDue = Number(normalized.dueAmount || 0);
              const dueAdjustment = Math.min(previousDue, totalRefund);
              const newDue = Math.max(0, previousDue - totalRefund);
              const cashRefund = Number((totalRefund - dueAdjustment).toFixed(2));

              if (cashRefund > 0) {
                shopBalanceDelta -= cashRefund;
              }

              const nextHistory = [...(normalized.paymentHistory || [])];
              nextHistory.push({
                id: `return-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                type: 'return',
                createdAt: new Date().toISOString(),
                purchaseDate: new Date().toISOString(),
                invoiceNumber: originalTransaction.id,
                products: returnItems.map(r => {
                  const originalItem = originalTransaction.items.find(i => i.medicineId === r.medicineId && i.batchNumber === r.batchNumber);
                  return {
                    medicineId: r.medicineId,
                    name: originalItem?.name || '',
                    batchNumber: r.batchNumber,
                    quantity: r.quantity,
                    price: originalItem?.price || 0,
                  };
                }),
                totalPurchaseAmount: totalRefund,
                cashPaid: cashRefund,
                dueCreated: 0,
                totalOutstandingDue: newDue,
                paymentStatus: newDue <= 0 ? 'Paid' : 'Partial Due'
              });
              const rebuilt = summarizeCustomerBalances(nextHistory);
              return {
                ...normalized,
                totalPurchaseAmount: Number((normalized.totalPurchaseAmount - totalRefund).toFixed(2)),
                dueAmount: newDue,
                totalDue: newDue,
                paymentHistory: rebuilt.paymentHistory,
              };
            });
          }
        }
      }

      updatedMedicines = medicines.map(medicine => {
        const normalized = normalizeMedicineRecord(medicine);
        const updatedBatches = normalized.batches.map(batch => {
          const returnItem = returnItems.find(r => r.medicineId === medicine.id && r.batchNumber === batch.batchNumber);
          if (!returnItem) return batch;
          return {
            ...batch,
            quantity: Number(batch.quantity || 0) + returnItem.quantity,
          };
        });
        return normalizeMedicineRecord({
          ...normalized,
          batches: updatedBatches,
          stock: getMedicineTotalStock({ batches: updatedBatches }),
        });
      });

      await upsertReturns(updatedReturns);
      setReturns(updatedReturns);

      if (updatedCustomers !== customers) {
        await upsertCustomers(updatedCustomers);
        setCustomers(updatedCustomers);
      }
      await upsertMedicines(updatedMedicines);
      setMedicines(updatedMedicines);

      if (shopBalanceDelta !== 0) {
        const newBalance = Number((shopBalance + shopBalanceDelta).toFixed(2));
        await setShopBalance(newBalance);
        setShopBalance(newBalance);
      }

      const role = currentRoleRef.current || 'Staff';
      returnRecords.forEach(record => {
        const medicine = medicines.find(m => m.id === record.medicineId);
        const previousStock = medicine ? getMedicineTotalStock({ batches: medicine.batches }) : 0;
        const newStock = previousStock + Number(record.returnQuantity);

        addInventoryHistoryRecord({
          medicineName: record.medicineName,
          companyName: '-',
          category: '-',
          animalType: '-',
          batchNo: record.batchLabel,
          batchLabel: record.batchLabel,
          previousStock,
          addedQuantity: record.returnQuantity,
          newTotalStock: newStock,
          purchaseCost: 0,
          sellingPrice: record.refundAmount / record.returnQuantity,
          totalAmount: record.refundAmount,
          expiryDate: '-',
          shelfLocation: '-',
          addedBy: role,
          action: 'Return',
        }, role);

        addMedicineHistoryRecord({
          medicineId: record.medicineId,
          medicineName: record.medicineName,
          genericName: '-',
          category: '-',
          animalType: '-',
          action: 'Returned',
          previousStock,
          addedQuantity: record.returnQuantity,
          currentStock: newStock,
          purchaseCost: 0,
          sellingPrice: record.refundAmount / record.returnQuantity,
          expiryDate: '-',
          shelfLocation: '-',
          batchNo: record.batchLabel,
          supplier: '-',
          notes: `Returned: ${record.reason}`,
        }, role);
      });

      if (returnRecords.length > 0) {
        await generateDailyReport(
          new Date().toISOString().slice(0, 10),
          transactions,
          medicines,
          customers,
          companies,
          updatedReturns
        );
      }
    } catch (error) {
      console.error('Failed to process return in Supabase:', error);
      notify(error?.message || 'Failed to process return. Please try again.', 'error');
    }
  };

  const handleAddCompany = async (newCompany) => {
    try {
      const normalizedCompany = normalizeCompany({
        ...newCompany,
        transactionHistory: rebuildCompanyTransactionTimeline(Array.isArray(newCompany.transactionHistory) ? newCompany.transactionHistory : [])
      });
      await upsertCompanies([normalizedCompany]);
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
    } catch (error) {
      console.error('Failed to add company to Supabase:', error);
      notify(error?.message || 'Failed to add company. Please try again.', 'error');
    }
  };

  const handleUpdateCompany = async (updatedCompany) => {
    try {
      const normalizedCompany = normalizeCompany(updatedCompany);
      await upsertCompanies([normalizedCompany]);
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
    } catch (error) {
      console.error('Failed to update company in Supabase:', error);
      notify(error?.message || 'Failed to update company. Please try again.', 'error');
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      await deleteCompany(id);
      setCompanies(prev => prev.filter(company => company.id !== id));
    } catch (error) {
      console.error('Failed to delete company from Supabase:', error);
      notify(error?.message || 'Failed to delete company. Please try again.', 'error');
    }
  };

  const handleAddCompanyPurchase = async (companyId, summary) => {
    try {
      const updatedCompany = companies.find(c => c.id === companyId);
      if (!updatedCompany) {
        notify('Company not found.', 'error');
        return;
      }

      const normalizedCompany = normalizeCompany(updatedCompany);
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
      const newCompanyState = {
        ...normalizedCompany,
        totalPurchaseAmount: rebuilt.totalPurchaseAmount,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };

      const role = currentRoleRef.current || 'Staff';
      const medicineNames = Array.isArray(summary?.products)
        ? summary.products.map(p => p.name).join(', ')
        : '-';
      const quantity = Array.isArray(summary?.products)
        ? summary.products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0)
        : 0;

      addCompanyHistoryRecord({
        companyName: updatedCompany.name,
        medicineNames,
        quantity,
        totalAmount,
        amountPaid,
        remainingPayable: Number((totalAmount - amountPaid).toFixed(2)),
        paymentStatus: amountPaid >= totalAmount ? 'Paid' : 'Due',
        addedBy: role,
      }, role);

      await upsertCompanies([newCompanyState]);
      setCompanies(prev => prev.map(c => c.id === companyId ? newCompanyState : c));

      const purchaseTxForDb = {
        id: purchaseTx.id,
        company_id: companyId,
        type: 'purchase',
        createdAt: new Date().toISOString(),
        date: summary?.purchaseDate || new Date().toISOString(),
        products: Array.isArray(summary?.products) ? summary.products : [],
        totalAmount: Number(summary?.totalAmount || 0),
        amountPaid: Number(summary?.amountPaid || 0),
        dueAmount: Number((Number(summary?.totalAmount || 0) - Number(summary?.amountPaid || 0)).toFixed(2)),
        dueDate: summary?.dueDate || null,
        paymentDate: Number(summary?.amountPaid || 0) >= Number(summary?.totalAmount || 0) ? (summary?.purchaseDate || new Date().toISOString()) : null,
        totalOutstandingDue: Number((newCompanyState.dueAmount + Math.max(0, Number(summary?.totalAmount || 0) - Number(summary?.amountPaid || 0))).toFixed(2))
      };
      await insertCompanyTransaction(purchaseTxForDb);
    } catch (error) {
      console.error('Failed to add company purchase in Supabase:', error);
      notify(error?.message || 'Failed to add company purchase. Please try again.', 'error');
    }
  };

  const handleRecordCompanyPayment = async (companyId, amount, paymentDate) => {
    try {
      const updatedCompany = companies.find(c => c.id === companyId);
      if (!updatedCompany) {
        notify('Company not found.', 'error');
        return;
      }

      const normalizedCompany = normalizeCompany(updatedCompany);
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
      const newCompanyState = {
        ...normalizedCompany,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };

      const role = currentRoleRef.current || 'Staff';
      addCompanyHistoryRecord({
        companyName: updatedCompany.name,
        medicineNames: '-',
        quantity: 0,
        totalAmount: 0,
        amountPaid: paymentAmount,
        remainingPayable: nextDue,
        paymentStatus: nextDue <= 0 ? 'Paid' : 'Partial',
        addedBy: role,
      }, role);

      await upsertCompanies([newCompanyState]);
      setCompanies(prev => prev.map(c => c.id === companyId ? newCompanyState : c));

      const paymentTxForDb = {
        id: paymentTx.id,
        company_id: companyId,
        type: 'payment',
        createdAt: new Date().toISOString(),
        date: paymentDate || new Date().toISOString(),
        amount: paymentAmount,
        previousDue: Number(updatedCompany.dueAmount || 0),
        remainingDue: nextDue,
        totalOutstandingDue: nextDue
      };
      await insertCompanyTransaction(paymentTxForDb);
    } catch (error) {
      console.error('Failed to record company payment in Supabase:', error);
      notify(error?.message || 'Failed to record company payment. Please try again.', 'error');
    }
  };

  const handleEditCompanyTransaction = async (companyId, txId, updated) => {
    try {
      const updatedCompany = companies.find(c => c.id === companyId);
      if (!updatedCompany) {
        notify('Company not found.', 'error');
        return;
      }

      const normalizedCompany = normalizeCompany(updatedCompany);
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
        companyName: updatedCompany.name,
        medicineNames,
        quantity,
        totalAmount,
        amountPaid,
        remainingPayable: Number((totalAmount - amountPaid).toFixed(2)),
        paymentStatus: amountPaid >= totalAmount ? 'Paid' : 'Due',
        addedBy: role,
      }, role);

      const newCompanyState = {
        ...normalizedCompany,
        totalPurchaseAmount: rebuilt.totalPurchaseAmount,
        amountPaid: rebuilt.amountPaid,
        dueAmount: rebuilt.dueAmount,
        transactionHistory: rebuilt.transactionHistory
      };

      await upsertCompanies([newCompanyState]);
      setCompanies(prev => prev.map(c => c.id === companyId ? newCompanyState : c));
    } catch (error) {
      console.error('Failed to edit company transaction in Supabase:', error);
      notify(error?.message || 'Failed to edit company transaction. Please try again.', 'error');
    }
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
            returns={returns}
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
      case 'returns':
        return (
          <Returns
            transactions={transactions}
            medicines={medicines}
            customers={customers}
            returns={returns}
            onProcessReturn={handleProcessReturn}
            currentRole={currentRole}
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
        <Toast toast={toast} onClose={hideToast} />
      </div>
    </div>
  );
}

export default App;
