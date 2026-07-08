import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Login from './components/Login';
import { initialMedicines, initialTransactions } from './utils/mockData';
import './App.css';

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

  const [activeTab, setActiveTab] = useState('dashboard');

  // Persist states to Local Storage on change
  useEffect(() => {
    localStorage.setItem('shabab_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('shabab_transactions', JSON.stringify(transactions));
  }, [transactions]);

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
          />
        );
      case 'pos':
        return (
          <POS
            medicines={medicines}
            updateMedicinesStock={handleUpdateMedicinesStock}
            onCheckoutSuccess={handleCheckoutSuccess}
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
        setActiveTab={setActiveTab} 
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
