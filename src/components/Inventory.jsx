import React, { useState } from 'react';
import './Inventory.css';
import { formatDateOnly, normalizeDate } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';
import { addInventoryHistoryRecord } from '../utils/historyUtils';
import { addMedicineHistoryRecord, getMedicineHistory } from '../utils/medicineHistoryUtils';
import { appendMedicineBatch, formatBatchLabel, getBatchExpiryStatus, getMedicineBatchesWithStatus, getMedicineExpirySummary, getMedicineTotalStock, getNextBatchNumber, normalizeMedicineRecord } from '../utils/inventoryBatchUtils';
import { getLocalizedRackLocations } from '../utils/rackLocations';
import { VET_CATEGORIES, ANIMAL_TYPES } from '../utils/vetOptions';

export default function Inventory({ medicines, onAddMedicine, onUpdateMedicine, onDeleteMedicine, currentRole, alertFilter, setAlertFilter, language, t }) {
  const TODAY = formatDateOnly();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [animalTypeFilter, setAnimalTypeFilter] = useState('All');
  // alertFilter and setAlertFilter are managed globally via props

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'restock'
  const [editingId, setEditingId] = useState(null);
  const [restockMedicine, setRestockMedicine] = useState(null);
  
  // Delete confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Medicine history modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyView, setHistoryView] = useState('batches');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formGeneric, setFormGeneric] = useState('');
  const [formCategory, setFormCategory] = useState('Tablet');
  const [formAnimalType, setFormAnimalType] = useState('Other');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRestockQty, setFormRestockQty] = useState('');
  const [formRestockNotes, setFormRestockNotes] = useState('');

  const EXPIRY_WARNING_DAYS = 30;
  const getMedicineEffectiveExpiry = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).displayExpiry || normalizeDate(med.expiryDate);
  };

  const isMedicineFullyExpired = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).isFullyExpired;
  };

  const isMedicineHasExpiredBatch = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).hasExpiredBatches;
  };

  const isMedicineExpiringSoon = (med) => {
    return getMedicineExpirySummary(med, TODAY, EXPIRY_WARNING_DAYS).hasExpiringBatches;
  };

  const formatBatchDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const formatHistoryBatchLabel = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '-';
    const directMatch = raw.match(/Batch\s+\d+/i);
    if (directMatch) return directMatch[0];
    return '-';
  };

  // Extract unique categories and animal types for filter
  const categories = ['All', ...VET_CATEGORIES];
  const animalTypes = ['All', ...new Set(medicines.map(m => m.animalType).filter(Boolean))];

  const expiredCount = medicines.filter(m => isMedicineHasExpiredBatch(m)).length;
  const expiringCount = medicines.filter(m => isMedicineExpiringSoon(m)).length;
  const lowStockCount = medicines.filter(m => getMedicineTotalStock(m) < 15).length;
  const selectedMedicineBatches = getMedicineBatchesWithStatus(selectedMedicine || {}).map((batch) => {
    const expiryStatus = getBatchExpiryStatus(batch, TODAY, EXPIRY_WARNING_DAYS);
    return { ...batch, expiryStatus };
  });

  // Filtering Logic
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesAnimalType = animalTypeFilter === 'All' || m.animalType === animalTypeFilter;
    
    const isExpired = isMedicineFullyExpired(m);
    const hasExpiredBatch = isMedicineHasExpiredBatch(m);
    const isExpiringSoon = isMedicineExpiringSoon(m);
    let matchesAlert = true;
    if (alertFilter === 'Low Stock') {
      matchesAlert = getMedicineTotalStock(m) < 15;
    } else if (alertFilter === 'Expiring/Expired') {
      matchesAlert = isExpiringSoon && !isExpired;
    } else if (alertFilter === 'Expired') {
      matchesAlert = hasExpiredBatch;
    }

    return matchesSearch && matchesCategory && matchesAnimalType && matchesAlert;
  });

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setRestockMedicine(null);
    setFormName('');
    setFormGeneric('');
    setFormCategory('Tablet');
    setFormAnimalType('Other');
    setFormPrice('');
    setFormCost('');
    setFormStock('');
    setFormExpiry('');
    setFormLocation('');
    setFormDesc('');
    setFormRestockQty('');
    setFormRestockNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setModalMode('edit');
    setEditingId(med.id);
    setRestockMedicine(null);
    const normalizedMed = normalizeMedicineRecord(med);
    setFormName(normalizedMed.name);
    setFormGeneric(normalizedMed.genericName);
    setFormCategory(normalizedMed.category);
    setFormAnimalType(normalizedMed.animalType || 'Other');
    setFormPrice(normalizedMed.price);
    setFormCost(normalizedMed.cost);
    setFormStock(normalizedMed.stock);
    setFormExpiry(normalizedMed.expiryDate);
    setFormLocation(normalizedMed.location);
    setFormDesc(normalizedMed.description || '');
    setFormRestockQty('');
    setFormRestockNotes('');
    setIsModalOpen(true);
  };

  const openRestockModal = (med) => {
    setModalMode('restock');
    setEditingId(med.id);
    const normalizedMed = normalizeMedicineRecord(med);
    setRestockMedicine(normalizedMed);
    setFormName(normalizedMed.name);
    setFormGeneric(normalizedMed.genericName);
    setFormCategory(normalizedMed.category);
    setFormAnimalType(normalizedMed.animalType || 'Other');
    setFormPrice(normalizedMed.price);
    setFormCost(normalizedMed.cost);
    setFormStock('');
    setFormExpiry('');
    setFormLocation(normalizedMed.location || '');
    setFormDesc(normalizedMed.description || '');
    setFormRestockQty('');
    setFormRestockNotes('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalMode === 'restock' && restockMedicine) {
      const existing = normalizeMedicineRecord(restockMedicine);
      const addedQty = parseInt(formRestockQty) || 0;
      const newStock = Number(existing.stock || 0) + addedQty;
      const newPrice = formPrice !== '' ? parseFloat(formPrice) : existing.price;
      const newCost = formCost !== '' ? parseFloat(formCost) : existing.cost;
      const newExpiry = formExpiry || existing.expiryDate;
      const newLocation = formLocation.trim() || existing.location;
      const nextBatchNumber = getNextBatchNumber(existing);

      const newBatch = {
        batchNumber: nextBatchNumber,
        batchLabel: formatBatchLabel(nextBatchNumber),
        quantity: addedQty,
        expiryDate: newExpiry,
        purchaseCost: newCost,
        sellingPrice: newPrice,
        location: newLocation,
        stockInDate: new Date().toISOString(),
        purchaseDate: new Date().toISOString(),
        notes: formRestockNotes.trim(),
      };

      const updatedMed = appendMedicineBatch({
        ...existing,
        description: formDesc.trim() || existing.description,
      }, newBatch);

      onUpdateMedicine(updatedMed);
      addInventoryHistoryRecord({
        medicineName: updatedMed.name,
        companyName: '-',
        category: updatedMed.category,
        animalType: updatedMed.animalType,
        batchNo: newBatch.batchLabel,
        batchLabel: newBatch.batchLabel,
        previousStock: Number(existing.stock || 0),
        addedQuantity: addedQty,
        newTotalStock: newStock,
        purchaseCost: newCost,
        sellingPrice: newPrice,
        totalAmount: Number((newCost * addedQty).toFixed(2)),
        expiryDate: newExpiry,
        shelfLocation: newLocation,
        addedBy: currentRole,
        action: 'Stock In',
      }, currentRole);

      addMedicineHistoryRecord({
        medicineId: existing.id,
        medicineName: updatedMed.name,
        genericName: updatedMed.genericName,
        category: updatedMed.category,
        animalType: updatedMed.animalType,
        action: 'Stock In',
        previousStock: Number(existing.stock || 0),
        addedQuantity: addedQty,
        currentStock: newStock,
        purchaseCost: newCost,
        sellingPrice: newPrice,
        expiryDate: newExpiry,
        shelfLocation: newLocation,
        batchNo: newBatch.batchLabel,
        supplier: '-',
        notes: formRestockNotes.trim() || `Stock In via ${currentRole}`,
      }, currentRole);

      if (normalizeDate(newExpiry) !== normalizeDate(existing.expiryDate)) {
        addMedicineHistoryRecord({
          medicineId: existing.id,
          medicineName: updatedMed.name,
          genericName: updatedMed.genericName,
          category: updatedMed.category,
          animalType: updatedMed.animalType,
          action: 'Status Changed',
          previousStock: Number(existing.stock || 0),
          addedQuantity: addedQty,
          currentStock: newStock,
          purchaseCost: newCost,
          sellingPrice: newPrice,
          expiryDate: newExpiry,
          shelfLocation: newLocation,
          batchNo: newBatch.batchLabel,
          supplier: '-',
          notes: `Expiry date changed from ${existing.expiryDate} to ${newExpiry}`,
        }, currentRole);
      }

      setIsModalOpen(false);
      return;
    }

    const payload = {
      name: formName.trim(),
      genericName: formGeneric.trim(),
      category: formCategory,
      animalType: formAnimalType,
      price: parseFloat(formPrice),
      cost: parseFloat(formCost),
      stock: parseInt(formStock),
      expiryDate: formExpiry,
      location: formLocation.trim(),
      description: formDesc.trim()
    };

    if (modalMode === 'add') {
      const newMed = {
        ...payload,
        id: `MED-${Math.floor(100 + Math.random() * 900)}`,
        batches: payload.stock > 0 ? [{
          batchNumber: 1,
          batchLabel: 'Batch 1',
          quantity: payload.stock,
          expiryDate: payload.expiryDate,
          purchaseCost: payload.cost,
          sellingPrice: payload.price,
          location: payload.location,
          stockInDate: new Date().toISOString(),
          notes: '',
        }] : []
      };
      onAddMedicine(newMed);
      addInventoryHistoryRecord({
        medicineName: newMed.name,
        companyName: '-',
        category: newMed.category,
        animalType: newMed.animalType,
        batchNo: newMed.batches[0]?.batchLabel || formatBatchLabel(newMed.batches[0]?.batchNumber),
        batchLabel: newMed.batches[0]?.batchLabel || formatBatchLabel(newMed.batches[0]?.batchNumber),
        previousStock: 0,
        addedQuantity: newMed.stock,
        newTotalStock: newMed.stock,
        purchaseCost: newMed.cost,
        sellingPrice: newMed.price,
        totalAmount: newMed.cost * newMed.stock,
        expiryDate: newMed.expiryDate,
        shelfLocation: newMed.location,
        addedBy: currentRole,
        action: 'Stock In',
      }, currentRole);

      addMedicineHistoryRecord({
        medicineId: newMed.id,
        medicineName: newMed.name,
        genericName: newMed.genericName,
        category: newMed.category,
        animalType: newMed.animalType,
        action: 'Created',
        previousStock: 0,
        addedQuantity: newMed.stock,
        currentStock: newMed.stock,
        purchaseCost: newMed.cost,
        sellingPrice: newMed.price,
        expiryDate: newMed.expiryDate,
        shelfLocation: newMed.location,
        batchNo: newMed.batches[0]?.batchLabel || formatBatchLabel(newMed.batches[0]?.batchNumber),
        supplier: '-',
        notes: `Medicine created by ${currentRole}`,
      }, currentRole);
    } else {
      const originalMed = medicines.find(m => m.id === editingId);
      const updatedMed = normalizeMedicineRecord({
        ...originalMed,
        ...payload,
        id: editingId,
        batches: originalMed?.batches || [],
        stock: getMedicineTotalStock(originalMed),
      });
      onUpdateMedicine(updatedMed);
      addInventoryHistoryRecord({
        medicineName: updatedMed.name,
        companyName: '-',
        category: updatedMed.category,
        animalType: updatedMed.animalType,
        batchNo: '-',
        previousStock: updatedMed.stock,
        addedQuantity: 0,
        newTotalStock: updatedMed.stock,
        purchaseCost: updatedMed.cost,
        sellingPrice: updatedMed.price,
        totalAmount: updatedMed.cost * updatedMed.stock,
        expiryDate: updatedMed.expiryDate,
        shelfLocation: updatedMed.location,
        addedBy: currentRole,
        action: 'Edit',
      }, currentRole);

      addMedicineHistoryRecord({
        medicineId: updatedMed.id,
        medicineName: updatedMed.name,
        genericName: updatedMed.genericName,
        category: updatedMed.category,
        animalType: updatedMed.animalType,
        action: 'Edited',
        previousStock: Number(originalMed?.stock || updatedMed.stock),
        addedQuantity: 0,
        currentStock: updatedMed.stock,
        purchaseCost: updatedMed.cost,
        sellingPrice: updatedMed.price,
        expiryDate: updatedMed.expiryDate,
        shelfLocation: updatedMed.location,
        batchNo: '-',
        supplier: '-',
        notes: `Medicine details edited by ${currentRole}`,
      }, currentRole);

      if (originalMed && updatedMed.stock < 15 && Number(originalMed.stock || 0) >= 15) {
        addMedicineHistoryRecord({
          medicineId: updatedMed.id,
          medicineName: updatedMed.name,
          genericName: updatedMed.genericName,
          category: updatedMed.category,
          animalType: updatedMed.animalType,
          action: 'Status Changed',
          previousStock: Number(originalMed.stock || 0),
          addedQuantity: 0,
          currentStock: updatedMed.stock,
          purchaseCost: updatedMed.cost,
          sellingPrice: updatedMed.price,
          expiryDate: updatedMed.expiryDate,
          shelfLocation: updatedMed.location,
          batchNo: '-',
          supplier: '-',
          notes: 'Low stock warning - stock below 15',
        }, currentRole);
      }

      if (originalMed && normalizeDate(updatedMed.expiryDate) !== normalizeDate(originalMed.expiryDate)) {
        addMedicineHistoryRecord({
          medicineId: updatedMed.id,
          medicineName: updatedMed.name,
          genericName: updatedMed.genericName,
          category: updatedMed.category,
          animalType: updatedMed.animalType,
          action: 'Status Changed',
          previousStock: updatedMed.stock,
          addedQuantity: 0,
          currentStock: updatedMed.stock,
          purchaseCost: updatedMed.cost,
          sellingPrice: updatedMed.price,
          expiryDate: updatedMed.expiryDate,
          shelfLocation: updatedMed.location,
          batchNo: '-',
          supplier: '-',
          notes: `Expiry date changed from ${originalMed.expiryDate} to ${updatedMed.expiryDate}`,
        }, currentRole);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId != null) {
      const med = medicines.find(m => m.id === deleteTargetId);
      if (med) {
        addMedicineHistoryRecord({
          medicineId: med.id,
          medicineName: med.name,
          genericName: med.genericName,
          category: med.category,
          animalType: med.animalType,
          action: 'Deleted',
          previousStock: Number(med.stock || 0),
          addedQuantity: 0,
          newTotalStock: 0,
          purchaseCost: Number(med.cost || 0),
          sellingPrice: Number(med.price || 0),
          expiryDate: med.expiryDate,
          shelfLocation: med.location,
          batchNo: '-',
          batchLabel: '-',
          supplier: '-',
          notes: 'Medicine deleted from inventory',
        }, currentRole);
      }
      onDeleteMedicine(deleteTargetId);
    }
    setDeleteTargetId(null);
    setIsDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setDeleteTargetId(null);
    setIsDeleteDialogOpen(false);
  };

  const openHistoryModal = (med) => {
    setSelectedMedicine(normalizeMedicineRecord(med));
    setHistoryRecords(getMedicineHistory(med.id));
    setHistoryView('batches');
    setIsHistoryOpen(true);
  };

  return (
    <div>
      <div className="page-container fade-in">
      
      {/* Page Header */}
      <div className="inventory-header">
        <div>
          <h2>{t.inventory.title}</h2>
          <p className="subtitle">{t.inventory.subtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          {t.inventory.addButton}
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card toolbar-card">
        <div className="toolbar-grid">
          <div className="form-group no-margin">
            <label className="form-label">{t.inventory.searchLabel}</label>
            <input
              type="text"
              className="form-control"
              placeholder={t.inventory.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.inventory.categoryLabel}</label>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.inventory.animalTypeLabel || 'Animal Type'}</label>
            <select
              className="form-control"
              value={animalTypeFilter}
              onChange={(e) => setAnimalTypeFilter(e.target.value)}
            >
              {animalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group no-margin">
            <label className="form-label">{t.inventory.statusLabel}</label>
            <select
              className="form-control"
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
            >
              <option value="All">{t.inventory.allItems}</option>
              <option value="Low Stock">{t.inventory.lowStockFilter} ({lowStockCount})</option>
              <option value="Expiring/Expired">{t.inventory.expiryFilter} ({expiringCount})</option>
              <option value="Expired">{t.inventory.expiredFilter} ({expiredCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debug: System date reference */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
        System date reference: <strong style={{ color: 'var(--text-secondary)' }}>{TODAY}</strong> &nbsp;|&nbsp; 
        Expired: <strong style={{ color: 'var(--danger)' }}>{expiredCount}</strong> &nbsp;|&nbsp; 
        Expiring: <strong style={{ color: 'var(--warning)' }}>{expiringCount}</strong>
      </div>

      {/* Inventory Table */}
      <div className="table-wrapper">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.inventory.tableId}</th>
                <th>{t.inventory.tableBrand}</th>
                <th>{t.inventory.tableGeneric}</th>
                <th>{t.inventory.tableCategory}</th>
                <th>{t.inventory.tableAnimalType || 'Animal Type'}</th>
                <th>{t.inventory.tableStock}</th>
                <th>{t.inventory.tablePrice}</th>
                <th>{t.inventory.tableCost}</th>
                <th>{t.inventory.tableLocation}</th>
                <th>{t.inventory.tableExpiry}</th>
                <th>{t.inventory.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map(m => {
                const totalStock = getMedicineTotalStock(m);
                const isLowStock = totalStock < 15;
                const hasExpiredBatch = isMedicineHasExpiredBatch(m);
                const isExpiringSoon = isMedicineExpiringSoon(m);
                const effectiveExpiry = getMedicineEffectiveExpiry(m);

                let rowClass = "";
                if (hasExpiredBatch) rowClass = "row-expired";
                else if (isExpiringSoon) rowClass = "row-expiring-soon";
                else if (isLowStock) rowClass = "row-low-stock";

                return (
                  <tr key={m.id} className={rowClass}>
                    <td><code className="item-id">{m.id}</code></td>
                    <td>
                      <div className="med-title-cell">
                        <strong>{m.name}</strong>
                        {hasExpiredBatch && <span className="cell-badge badge-danger">Expired</span>}
                        {!hasExpiredBatch && isExpiringSoon && <span className="cell-badge badge-warning">Soon</span>}
                      </div>
                    </td>
                    <td className="generic-cell">{m.genericName}</td>
                    <td><span className="badge badge-info">{m.category}</span></td>
                    <td><span className="badge badge-info">{m.animalType || 'Other'}</span></td>
                    <td>
                      <span className={`stock-cell ${isLowStock ? 'stock-warning' : ''}`}>
                        {totalStock} {isLowStock && '⚠️'}
                      </span>
                    </td>
                    <td>৳ {m.price.toFixed(2)}</td>
                    <td>৳ {m.cost.toFixed(2)}</td>
                    <td>{m.location}</td>
                    <td>
                      <span className={hasExpiredBatch ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}>
                        {effectiveExpiry}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm restock-btn"
                          onClick={() => openRestockModal(m)}
                          title="Stock In / Restock"
                        >
                          ＋
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => openHistoryModal(m)}
                          title="View Batches/History"
                        >
                          📚
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm edit-btn"
                          onClick={() => openEditModal(m)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm delete-btn"
                          onClick={() => handleDelete(m.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={11} className="empty-table-cell">
                    {t.inventory.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Add / Edit / Restock Modal Overlay */}
    {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>
                {modalMode === 'add' ? t.inventory.modalAddTitle : modalMode === 'restock' ? t.inventory.restockTitle : t.inventory.modalEditTitle}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="mName">{t.inventory.brandLabel}</label>
                  <input
                    type="text"
                    id="mName"
                    required
                    placeholder={t.inventory.brandPlaceholder}
                    className="form-control"
                    value={formName}
                    readOnly={modalMode === 'restock'}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mGeneric">{t.inventory.genericLabel}</label>
                  <input
                    type="text"
                    id="mGeneric"
                    required
                    placeholder={t.inventory.genericPlaceholder}
                    className="form-control"
                    value={formGeneric}
                    readOnly={modalMode === 'restock'}
                    onChange={(e) => setFormGeneric(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mCategory">{t.inventory.categorySelect}</label>
                  <select
                    id="mCategory"
                    className="form-control"
                    value={formCategory}
                    readOnly={modalMode === 'restock'}
                    onChange={(e) => setFormCategory(e.target.value)}
                    disabled={modalMode === 'restock'}
                  >
                    {VET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mAnimalType">{t.inventory.animalTypeLabel || 'Animal Type *'}</label>
                  <select
                    id="mAnimalType"
                    className="form-control"
                    value={formAnimalType}
                    onChange={(e) => setFormAnimalType(e.target.value)}
                    required
                  >
                    {ANIMAL_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mLocation">{t.inventory.locationLabel}</label>
                  <select
                    id="mLocation"
                    className="form-control"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    required
                  >
                    <option value="">{t.inventory.locationPlaceholder || 'Select Rack Location'}</option>
                    {getLocalizedRackLocations(t, language).map(loc => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mPrice">{t.inventory.priceLabel}</label>
                  <input
                    type="number"
                    id="mPrice"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    className="form-control"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mCost">{t.inventory.costLabel}</label>
                  <input
                    type="number"
                    id="mCost"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    className="form-control"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                  />
                </div>

                {modalMode === 'restock' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="mRestockQty">{t.inventory.stockInLabel}</label>
                    <input
                      type="number"
                      id="mRestockQty"
                      min="1"
                      required
                      placeholder={t.inventory.stockInPlaceholder}
                      className="form-control"
                      value={formRestockQty}
                      onChange={(e) => setFormRestockQty(e.target.value)}
                    />
                  </div>
                )}

                {modalMode !== 'restock' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="mStock">{t.inventory.stockLabel}</label>
                    <input
                      type="number"
                      id="mStock"
                      min="0"
                      required
                      placeholder="0"
                      className="form-control"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      readOnly={modalMode === 'edit'}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="mExpiry">{t.inventory.expiryLabel}</label>
                  <input
                    type="date"
                    id="mExpiry"
                    required
                    className="form-control"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mDesc">{modalMode === 'restock' ? t.inventory.restockNotesLabel : t.inventory.descriptionLabel}</label>
                <textarea
                  id="mDesc"
                  placeholder={modalMode === 'restock' ? t.inventory.restockNotesPlaceholder : t.inventory.descriptionPlaceholder}
                  className="form-control"
                  rows="2"
                  value={modalMode === 'restock' ? formRestockNotes : formDesc}
                  onChange={(e) => modalMode === 'restock' ? setFormRestockNotes(e.target.value) : setFormDesc(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t.inventory.cancel}
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'restock' ? t.inventory.restockButton : modalMode === 'add' ? t.inventory.saveProduct : t.inventory.applyChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
    )}
      
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={t.common.confirmDeleteTitle}
        message={t.common.confirmDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        t={t}
      />

      {/* Medicine History Modal */}
      {isHistoryOpen && (
        <div className="modal-overlay" onClick={() => setIsHistoryOpen(false)}>
          <div className="glass-card modal-container" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.inventory.batchesHistoryTitle || 'View Batches / History'}</h3>
              <button className="modal-close-btn" onClick={() => setIsHistoryOpen(false)}>×</button>
            </div>
            <div className="inventory-history-tabs">
              <button
                type="button"
                className={`inventory-history-tab ${historyView === 'batches' ? 'active' : ''}`}
                onClick={() => setHistoryView('batches')}
              >
                {t.inventory.batchesTabLabel || 'Batches'}
              </button>
              <button
                type="button"
                className={`inventory-history-tab ${historyView === 'history' ? 'active' : ''}`}
                onClick={() => setHistoryView('history')}
              >
                {t.inventory.historyTabLabel || 'History'}
              </button>
            </div>
            <div className="medicine-history-content">
              {historyView === 'batches' ? (
                <div className="batch-history-summary">
                  <div className="batch-summary-card">
                    <div>
                      <strong>{selectedMedicine?.name || '-'}</strong>
                      <p>{selectedMedicine?.genericName || '-'}</p>
                    </div>
                    <div>
                      <span>{t.inventory.totalStockLabel || 'Total Stock'}</span>
                      <strong>{getMedicineTotalStock(selectedMedicine || {})}</strong>
                    </div>
                  </div>

                  {selectedMedicineBatches.length === 0 ? (
                    <div className="history-empty">
                      <span>📭</span>
                      <p>{t.inventory.noBatchRecords || 'No batch records found for this medicine.'}</p>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <div className="table-container">
                        <table className="custom-table history-table batch-table">
                          <thead>
                            <tr>
                              <th style={{ width: '50px' }}>#</th>
                              <th>{t.history.tableBatch || 'Batch'}</th>
                              <th>{t.inventory.batchQtyLabel || 'Quantity'}</th>
                              <th>{t.inventory.tableCost}</th>
                              <th>{t.inventory.tablePrice}</th>
                              <th>{t.inventory.tableLocation}</th>
                              <th>{t.inventory.batchPurchaseDateLabel || 'Purchase Date'}</th>
                              <th>{t.inventory.tableExpiry}</th>
                              <th>{t.inventory.expiryStatusLabel || 'Expiry Status'}</th>
                              <th>{t.inventory.batchStatusLabel || 'Status'}</th>
                              <th>{t.common.notes || 'Notes'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMedicineBatches.map((batch, idx) => (
                              <tr key={batch.batchNumber || idx} className={batch.sellingStatus.key === 'current' ? 'row-current-selling' : ''}>
                                <td><strong>{idx + 1}</strong></td>
                                <td>{batch.batchLabel || formatBatchLabel(batch.batchNumber)}</td>
                                <td>
                                  <span className={`badge ${batch.quantity <= 0 ? 'badge-danger' : 'badge-success'}`}>
                                    {batch.quantity}
                                  </span>
                                </td>
                                <td>৳ {Number(batch.purchaseCost || 0).toFixed(2)}</td>
                                <td>৳ {Number(batch.sellingPrice || 0).toFixed(2)}</td>
                                <td>{batch.location || '-'}</td>
                                <td>{formatBatchDate(batch.purchaseDate || batch.stockInDate)}</td>
                                <td>{batch.expiryDate || '-'}</td>
                                <td>
                                  <span className={`badge ${batch.expiryStatus?.key === 'expired' ? 'badge-danger' : batch.expiryStatus?.key === 'expiring-soon' ? 'badge-warning' : 'badge-success'}`}>
                                    {batch.expiryStatus?.label || 'Active'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${batch.sellingStatus.key === 'completed' || batch.sellingStatus.key === 'expired' ? 'badge-danger' : batch.sellingStatus.key === 'current' ? 'badge-success' : 'badge-info'}`}>
                                    {`${batch.batchLabel || formatBatchLabel(batch.batchNumber)} — Stock: ${batch.quantity} — ${batch.sellingStatus.label}`}
                                  </span>
                                </td>
                                <td style={{ maxWidth: '180px', whiteSpace: 'normal' }}>{batch.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="history-empty">
                  <span>📭</span>
                  <p>{t.inventory.noHistoryRecords || 'No history records found for this medicine.'}</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <div className="table-container">
                    <table className="custom-table history-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>#</th>
                          <th>{t.history.tableDateTime || 'Date & Time'}</th>
                          <th>{t.history.tableAction || 'Action'}</th>
                          <th>{t.inventory.tableBrand}</th>
                          <th>{t.inventory.tableGeneric}</th>
                          <th>{t.inventory.tableCategory}</th>
                          <th>{t.history.tableBatch || 'Batch'}</th>
                          <th>{t.history.tablePreviousStock || 'Previous Stock'}</th>
                          <th>{t.history.tableAddedQty || 'Added/Removed'}</th>
                          <th>{t.history.tableNewTotal || 'Current Stock'}</th>
                          <th>{t.inventory.tableCost}</th>
                          <th>{t.inventory.tablePrice}</th>
                          <th>{t.inventory.tableExpiry}</th>
                          <th>{t.inventory.tableLocation}</th>
                          <th>{t.history.tableAddedBy || 'Updated By'}</th>
                          <th>{t.common.notes || 'Notes'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyRecords.map((r, idx) => (
                          <tr key={r.id}>
                            <td><strong>{idx + 1}</strong></td>
                            <td>{new Date(r.createdAt).toLocaleString()}</td>
                            <td>
                              <span className={`badge ${r.action === 'Stock In' || r.action === 'Created' ? 'badge-success' : r.action === 'Deleted' ? 'badge-danger' : r.action === 'Sold' ? 'badge-warning' : 'badge-info'}`}>
                                {r.action}
                              </span>
                            </td>
                            <td>{r.medicineName}</td>
                            <td>{r.genericName}</td>
                            <td>{r.category}</td>
                            <td>{r.batchLabel || formatHistoryBatchLabel(r.batchNo)}</td>
                            <td>{r.previousStock ?? '-'}</td>
                            <td>{r.addedQuantity > 0 ? `+${r.addedQuantity}` : r.addedQuantity < 0 ? r.addedQuantity : '-'}</td>
                            <td>{r.currentStock ?? r.newTotalStock ?? '-'}</td>
                            <td>৳ {Number(r.purchaseCost || 0).toFixed(2)}</td>
                            <td>৳ {Number(r.sellingPrice || 0).toFixed(2)}</td>
                            <td>{r.expiryDate || '-'}</td>
                            <td>{r.shelfLocation || '-'}</td>
                            <td>
                              <span className={`badge ${r.updatedBy === 'Admin' ? 'badge-success' : 'badge-info'}`}>
                                {r.updatedBy === 'Admin' ? 'Admin' : 'Staff'}
                              </span>
                            </td>
                            <td style={{ maxWidth: '180px', whiteSpace: 'normal' }}>{r.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsHistoryOpen(false)}>
                {t.inventory.cancel || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
