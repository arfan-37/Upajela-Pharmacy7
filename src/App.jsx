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
import { translations } from './utils/translations';
import './App.css';

const normalizeCustomer = (customer) => {
  const historySummary = summarizeCustomerBalances(Array.isArray(customer.paymentHistory) ? customer.paymentHistory : []);
  const hasHistory = historySummary.paymentHistory.length > 0;
  const totalPurchaseAmount = Number(hasHistory ? historySummary.totalPurchaseAmount : (customer.totalPurchaseAmount ?? 0));
  const cashPaid = Number(hasHistory ? historySummary.cashPaid : (customer.cashPaid ?? 0));
  const dueAmount = Number(hasHistory ? historySummary.dueAmount : (customer.dueAmount ?? customer.totalDue ?? 0));

  return {
    ...customer,
    totalPurchaseAmount,
    cashPaid,
    dueAmount,
    totalDue: dueAmount,
    paymentHistory: historySummary.paymentHistory
  };
};

const normalizeCompany = (company) => {
  const historySummary = summarizeCompanyBalances(Array.isArray(company.transactionHistory) ? company.transactionHistory : []);
  const hasHistory = historySummary.transactionHistory.length > 0;
  const totalPurchaseAmount = Number(hasHistory ? historySummary.totalPurchaseAmount : (company.totalPurchaseAmount ?? 0));
  const amountPaid = Number(hasHistory ? historySummary.amountPaid : (company.amountPaid ?? 0));
  const dueAmount = Number(hasHistory ? historySummary.dueAmount : (company.dueAmount ?? (totalPurchaseAmount - amountPaid)));

  return {
    ...company,
    contact: company.contact || '',
    address: company.address || '',
    totalPurchaseAmount,
    amountPaid,
    dueAmount,
    transactionHistory: historySummary.transactionHistory
  };
};

const mergeSeedRecords = (savedRecords, seedRecords) => {
  const merged = new Map();

  for (const record of Array.isArray(seedRecords) ? seedRecords : []) {
    merged.set(record.id, record);
  }

  for (const record of Array.isArray(savedRecords) ? savedRecords : []) {
    merged.set(record.id, record);
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

  // Global States (preserves state across browser tabs using localStorage)
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('shabab_medicines');
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('shabab_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('shabab_customers');
    const parsed = saved ? JSON.parse(saved) : [];
    const merged = mergeSeedRecords(parsed, initialCustomers);
    return merged.map(normalizeCustomer);
  });

  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('shabab_companies');
    let parsed = saved ? JSON.parse(saved) : initialCompanies;
    if (!Array.isArray(parsed) || parsed.length === 0) parsed = initialCompanies;
    return parsed.map(normalizeCompany);
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
    setIsLoggedIn(false);
    localStorage.removeItem('shabab_logged_in');
  };

  // Inventory Management State Mutation handlers
  const handleAddMedicine = (newMed) => {
    setMedicines(prev => [newMed, ...prev]);
  };

  const handleUpdateMedicine = (updatedMed) => {
    setMedicines(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m));
  };

  const handleDeleteMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  // Stock reduction when items are sold in POS
  const handleUpdateMedicinesStock = (cartItems) => {
    setMedicines(prev => prev.map(m => {
      const cartItem = cartItems.find(c => c.id === m.id);
      if (cartItem) {
        return {
          ...m,
          stock: Math.max(0, m.stock - cartItem.quantity)
        };
      }
      return m;
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
      const dueAmount = Number(saleSummary?.dueAmount || 0);
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
      const nextCashPaid = Number((normalizedCustomer.cashPaid + paymentAmount).toFixed(2));
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
  };

  const handleUpdateCompany = (updatedCompany) => {
    const normalizedCompany = normalizeCompany(updatedCompany);
    setCompanies(prev => prev.map(company => company.id === normalizedCompany.id ? normalizedCompany : company));
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
            currentRole={currentRole}
            language={language}
            t={t}
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
