import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Login from './components/Login';
import CustomerPanel from './components/CustomerPanel';
import { initialMedicines, initialTransactions } from './utils/mockData';
import './App.css';

const normalizeCustomer = (customer) => {
  const totalPurchaseAmount = Number(customer.totalPurchaseAmount ?? 0);
  const cashPaid = Number(customer.cashPaid ?? 0);
  const dueAmount = Number(customer.dueAmount ?? customer.totalDue ?? 0);

  return {
    ...customer,
    totalPurchaseAmount,
    cashPaid,
    dueAmount,
    totalDue: dueAmount,
    paymentHistory: Array.isArray(customer.paymentHistory) ? customer.paymentHistory : []
  };
};

function App() {
  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('shabab_logged_in') === 'true';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('shabab_role') || 'Staff';
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
    return Array.isArray(parsed) ? parsed.map(normalizeCustomer) : [];
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
    localStorage.setItem('shabab_shop_balance', String(shopBalance));
  }, [shopBalance]);

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
    const normalizedCustomer = normalizeCustomer(newCustomer);
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

      const nextPurchaseAmount = Number((normalizedCustomer.totalPurchaseAmount + totalAmount).toFixed(2));
      const nextCashPaid = Number((normalizedCustomer.cashPaid + cashAmount).toFixed(2));
      const nextDueAmount = Number((normalizedCustomer.dueAmount + dueAmount).toFixed(2));

      const nextEntries = [
        ...(normalizedCustomer.dueEntries || []),
        {
          id: `sale-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount: dueAmount,
          createdAt: purchaseDate,
          type: dueAmount > 0 ? 'credit' : 'cash',
          paymentType: saleSummary?.paymentType || 'cash',
          totalAmount,
          cashAmount,
          dueAmount,
          purchaseDate
        }
      ];

      const paymentHistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: 'sale',
        purchaseDate,
        invoiceNumber: saleSummary?.invoiceNumber || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        totalBill: totalAmount,
        cashPaid: cashAmount,
        dueAmount: dueAmount,
        duePaymentDate: null,
        amountReceived: 0,
        remainingDue: dueAmount,
        paymentStatus: dueAmount <= 0 ? 'Paid' : cashAmount > 0 ? 'Partial Due' : 'Full Due'
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
        paymentHistory: [...(normalizedCustomer.paymentHistory || []), paymentHistoryEntry]
      };
    }));
  };

  const handleReceivePayment = (customerId, amount, paymentDate) => {
    setCustomers(prev => prev.map(customer => {
      if (customer.id !== customerId) return customer;

      const normalizedCustomer = normalizeCustomer(customer);
      const paymentAmount = Number(amount || 0);
      const paymentDateValue = paymentDate || new Date().toISOString();
      const nextCashPaid = Number((normalizedCustomer.cashPaid + paymentAmount).toFixed(2));
      const nextDueAmount = Math.max(0, Number((normalizedCustomer.dueAmount - paymentAmount).toFixed(2)));

      const nextEntries = [
        ...(normalizedCustomer.dueEntries || []),
        {
          id: `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount: paymentAmount,
          createdAt: paymentDateValue,
          type: 'payment',
          paymentDate: paymentDateValue
        }
      ];

      const nextHistory = [...(normalizedCustomer.paymentHistory || [])];
      const openEntryIndex = nextHistory.slice().reverse().findIndex(entry => entry.type === 'sale' && Number(entry.remainingDue || 0) > 0);
      const targetIndex = openEntryIndex >= 0 ? nextHistory.length - 1 - openEntryIndex : -1;

      if (targetIndex >= 0) {
        const targetEntry = nextHistory[targetIndex];
        const remainingAfterPayment = Math.max(0, Number(targetEntry.remainingDue || 0) - paymentAmount);
        nextHistory[targetIndex] = {
          ...targetEntry,
          cashPaid: Number(targetEntry.cashPaid || 0) + paymentAmount,
          duePaymentDate: paymentDateValue,
          amountReceived: Number(targetEntry.amountReceived || 0) + paymentAmount,
          remainingDue: remainingAfterPayment,
          paymentStatus: remainingAfterPayment <= 0 ? 'Paid' : 'Partial Due'
        };
      }

      setShopBalance(prev => Number((prev + paymentAmount).toFixed(2)));

      return {
        ...normalizedCustomer,
        cashPaid: nextCashPaid,
        dueAmount: nextDueAmount,
        totalDue: nextDueAmount,
        dueEntries: nextEntries,
        paymentHistory: nextHistory
      };
    }));
  };

  // Router switcher view helper
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
          />
        );
      case 'reports':
        return (
          <Reports
            transactions={transactions}
            medicines={medicines}
            currentRole={currentRole}
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
          />
        );
      default:
        return (
          <Dashboard
            medicines={medicines}
            transactions={transactions}
            currentRole={currentRole}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // Render Login view if session is not authenticated
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLogin} />;
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
      />
      
      {/* App Main Area Content */}
      <div className="main-content">
        <Header 
          currentRole={currentRole} 
          onLogout={handleLogout} 
        />
        {renderActiveView()}
      </div>
    </div>
  );
}

export default App;
