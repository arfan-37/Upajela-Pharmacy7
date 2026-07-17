import React, { useState } from 'react';
import './Inventory.css';
import { addDaysToDateOnly, formatDateOnly } from '../utils/dateUtils';

export default function Inventory({ medicines, onAddMedicine, onUpdateMedicine, onDeleteMedicine, currentRole, alertFilter, setAlertFilter, t }) {
  const TODAY = formatDateOnly();
  const THREE_MONTHS_LATER = addDaysToDateOnly(TODAY, 90);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  // alertFilter and setAlertFilter are managed globally via props

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formGeneric, setFormGeneric] = useState('');
  const [formCategory, setFormCategory] = useState('Tablet');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Extract unique categories for filter
  const categories = ['All', ...new Set(medicines.map(m => m.category))];

  // Filtering Logic
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    
    let matchesAlert = true;
    if (alertFilter === 'Low Stock') {
      matchesAlert = m.stock < 15;
    } else if (alertFilter === 'Expiring/Expired') {
      matchesAlert = m.expiryDate <= THREE_MONTHS_LATER;
    }

    return matchesSearch && matchesCategory && matchesAlert;
  });

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormName('');
    setFormGeneric('');
    setFormCategory('Tablet');
    setFormPrice('');
    setFormCost('');
    setFormStock('');
    setFormExpiry('');
    setFormLocation('');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setModalMode('edit');
    setEditingId(med.id);
    setFormName(med.name);
    setFormGeneric(med.genericName);
    setFormCategory(med.category);
    setFormPrice(med.price);
    setFormCost(med.cost);
    setFormStock(med.stock);
    setFormExpiry(med.expiryDate);
    setFormLocation(med.location);
    setFormDesc(med.description || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formName.trim(),
      genericName: formGeneric.trim(),
      category: formCategory,
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
        id: `MED-${Math.floor(100 + Math.random() * 900)}`
      };
      onAddMedicine(newMed);
    } else {
      const updatedMed = {
        ...payload,
        id: editingId
      };
      onUpdateMedicine(updatedMed);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      onDeleteMedicine(id);
    }
  };

  return (
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
            <label className="form-label">{t.inventory.statusLabel}</label>
            <select
              className="form-control"
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
            >
              <option value="All">{t.inventory.allItems}</option>
              <option value="Low Stock">{t.inventory.lowStockFilter}</option>
              <option value="Expiring/Expired">{t.inventory.expiryFilter}</option>
            </select>
          </div>
        </div>
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
                const isLowStock = m.stock < 15;
                const isExpired = m.expiryDate <= TODAY;
                const isExpiringSoon = m.expiryDate > TODAY && m.expiryDate <= THREE_MONTHS_LATER;

                let rowClass = "";
                if (isExpired) rowClass = "row-expired";
                else if (isExpiringSoon) rowClass = "row-expiring-soon";
                else if (isLowStock) rowClass = "row-low-stock";

                return (
                  <tr key={m.id} className={rowClass}>
                    <td><code className="item-id">{m.id}</code></td>
                    <td>
                      <div className="med-title-cell">
                        <strong>{m.name}</strong>
                        {isExpired && <span className="cell-badge badge-danger">Expired</span>}
                        {!isExpired && isExpiringSoon && <span className="cell-badge badge-warning">Soon</span>}
                      </div>
                    </td>
                    <td className="generic-cell">{m.genericName}</td>
                    <td><span className="badge badge-info">{m.category}</span></td>
                    <td>
                      <span className={`stock-cell ${isLowStock ? 'stock-warning' : ''}`}>
                        {m.stock} {isLowStock && '⚠️'}
                      </span>
                    </td>
                    <td>৳ {m.price.toFixed(2)}</td>
                    <td>৳ {m.cost.toFixed(2)}</td>
                    <td>{m.location}</td>
                    <td>
                      <span className={isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}>
                        {m.expiryDate}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
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
                  <td colSpan={10} className="empty-table-cell">
                    {t.inventory.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-container">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? t.inventory.modalAddTitle : t.inventory.modalEditTitle}</h3>
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
                    onChange={(e) => setFormGeneric(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mCategory">{t.inventory.categorySelect}</label>
                  <select
                    id="mCategory"
                    className="form-control"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Tablet (Chewable)">Tablet (Chewable)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mLocation">{t.inventory.locationLabel}</label>
                  <input
                    type="text"
                    id="mLocation"
                    required
                    placeholder={t.inventory.locationPlaceholder}
                    className="form-control"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
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
                  />
                </div>

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
                <label className="form-label" htmlFor="mDesc">{t.inventory.descriptionLabel}</label>
                <textarea
                  id="mDesc"
                  placeholder={t.inventory.descriptionPlaceholder}
                  className="form-control"
                  rows="2"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t.inventory.cancel}
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? t.inventory.saveProduct : t.inventory.applyChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
