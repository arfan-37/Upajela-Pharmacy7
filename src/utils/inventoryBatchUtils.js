const now = () => new Date().toISOString();

const toNumber = (value) => Number(value || 0);

const toBatchNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : null;
};

export const formatBatchLabel = (batchNumber) => {
  const numeric = toBatchNumber(batchNumber);
  return numeric ? `Batch ${numeric}` : '-';
};

export const isBatchExpired = (batch, today = now().slice(0, 10)) => {
  if (!batch) return false;
  const expiry = String(batch.expiryDate || '').slice(0, 10);
  return expiry ? expiry <= today : false;
};

export const isBatchExpiringSoon = (batch, today = now().slice(0, 10), days = 90) => {
  if (!batch) return false;
  const current = String(batch.expiryDate || '').slice(0, 10);
  if (!current || current <= today) return false;
  const currentDate = new Date(`${current}T00:00:00`);
  const limit = new Date(`${today}T00:00:00`);
  limit.setDate(limit.getDate() + days);
  return currentDate <= limit;
};

export const getBatchExpiryStatus = (batch, today = now().slice(0, 10), days = 90) => {
  if (!batch) return { key: 'none', label: 'Unknown' };
  if (isBatchExpired(batch, today)) {
    return { key: 'expired', label: 'Expired' };
  }
  if (isBatchExpiringSoon(batch, today, days)) {
    return { key: 'expiring-soon', label: 'Expiry Alert' };
  }
  return { key: 'active', label: 'Active' };
};

export const getMedicineExpirySummary = (medicine, today = now().slice(0, 10), days = 90) => {
  const batches = getMedicineBatches(medicine);
  const activeBatches = batches.filter((batch) => !isBatchExpired(batch, today));
  const expiredBatches = batches.filter((batch) => isBatchExpired(batch, today));
  const expiringBatches = activeBatches.filter((batch) => isBatchExpiringSoon(batch, today, days));

  const activeExpiry = activeBatches.length > 0
    ? [...activeBatches].sort((a, b) => String(a.expiryDate || '').localeCompare(String(b.expiryDate || '')))[0]?.expiryDate || null
    : null;

  const earliestExpiry = batches.length > 0
    ? [...batches].sort((a, b) => String(a.expiryDate || '').localeCompare(String(b.expiryDate || '')))[0]?.expiryDate || null
    : null;

  return {
    batches,
    activeBatches,
    expiredBatches,
    expiringBatches,
    isFullyExpired: batches.length > 0 && expiredBatches.length === batches.length,
    hasExpiredBatches: expiredBatches.length > 0,
    hasExpiringBatches: expiringBatches.length > 0,
    displayExpiry: activeExpiry || earliestExpiry || (medicine?.expiryDate || null),
  };
};

export const getNextBatchNumber = (medicine) => {
  const batches = getMedicineBatches(medicine);
  const numbers = batches
    .map((batch) => toBatchNumber(batch.batchNumber))
    .filter((batchNumber) => batchNumber !== null);

  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
};

const normalizeBatch = (batch, index) => {
  const batchNumber = toBatchNumber(batch.batchNumber) || (index + 1);
  return {
    ...batch,
    batchNumber,
    batchLabel: batch.batchLabel || formatBatchLabel(batchNumber),
    id: `batch-${batchNumber}`,
    quantity: toNumber(batch.quantity),
  };
};

const sortBatchesForSale = (batches = []) => [...batches].sort((a, b) => {
  const expiryA = new Date(a.expiryDate || 0).getTime();
  const expiryB = new Date(b.expiryDate || 0).getTime();
  if (expiryA !== expiryB) return expiryA - expiryB;

  const timeA = new Date(a.stockInDate || a.purchaseDate || 0).getTime();
  const timeB = new Date(b.stockInDate || b.purchaseDate || 0).getTime();
  if (timeA !== timeB) return timeA - timeB;

  return String(a.id || '').localeCompare(String(b.id || ''));
});

export const getMedicineBatches = (medicine) => {
  if (!medicine || !Array.isArray(medicine.batches)) return [];
  return medicine.batches.map(normalizeBatch);
};

export const getMedicineTotalStock = (medicine) => {
  const batches = getMedicineBatches(medicine);
  if (batches.length === 0) return toNumber(medicine?.stock);
  return batches.reduce((sum, batch) => sum + toNumber(batch.quantity), 0);
};

export const getCurrentSellingBatch = (medicine) => {
  const batches = sortBatchesForSale(getMedicineBatches(medicine));
  return batches.find((batch) => {
    const quantity = toNumber(batch.quantity);
    const expired = isBatchExpired(batch);
    return quantity > 0 && !expired;
  }) || null;
};

export const getBatchSellingStatus = (medicine, batch) => {
  const quantity = toNumber(batch?.quantity);

  if (isBatchExpired(batch)) {
    return {
      key: 'expired',
      label: 'Expired',
    };
  }

  if (quantity <= 0) {
    return {
      key: 'completed',
      label: 'Completed / Stock Finished',
    };
  }

  const currentBatch = getCurrentSellingBatch(medicine);
  if (currentBatch && toBatchNumber(currentBatch.batchNumber) === toBatchNumber(batch.batchNumber)) {
    return {
      key: 'current',
      label: 'Currently Selling',
    };
  }

  return {
    key: 'next',
    label: 'Next Available',
  };
};

export const getMedicineBatchesWithStatus = (medicine) => {
  return getMedicineBatches(medicine).map((batch) => ({
    ...batch,
    sellingStatus: getBatchSellingStatus(medicine, batch),
  }));
};

export const getLatestMedicineBatch = (medicine) => {
  const batches = getMedicineBatches(medicine);
  if (batches.length === 0) return null;

  return [...batches].sort((a, b) => {
    const timeA = new Date(a.stockInDate || a.purchaseDate || 0).getTime();
    const timeB = new Date(b.stockInDate || b.purchaseDate || 0).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''));
  })[0];
};

export const buildMedicineBatch = ({
  batchNumber,
  quantity,
  expiryDate,
  purchaseCost,
  sellingPrice,
  location,
  notes = '',
  stockInDate,
  purchaseDate,
  id,
}) => ({
  batchNumber: toBatchNumber(batchNumber) || 1,
  batchLabel: formatBatchLabel(batchNumber),
  id: id || `batch-${toBatchNumber(batchNumber) || 1}`,
  quantity: toNumber(quantity),
  expiryDate: expiryDate || '',
  purchaseCost: toNumber(purchaseCost),
  sellingPrice: toNumber(sellingPrice),
  location: location || '',
  stockInDate: stockInDate || purchaseDate || now(),
  purchaseDate: purchaseDate || stockInDate || now(),
  notes: notes || '',
});

export const normalizeMedicineRecord = (medicine) => {
  const source = medicine && typeof medicine === 'object' ? medicine : {};
  const existingBatches = getMedicineBatches(source);
  const fallbackBatch = existingBatches.length === 0 && toNumber(source.stock) > 0
    ? [buildMedicineBatch({
        batchNumber: 1,
        quantity: source.stock,
        expiryDate: source.expiryDate,
        purchaseCost: source.cost,
        sellingPrice: source.price,
        location: source.location,
        notes: source.description || '',
        stockInDate: source.createdAt || now(),
      })]
    : [];
  const batches = existingBatches.length > 0 ? existingBatches : fallbackBatch;
  const latestBatch = getLatestMedicineBatch({ batches });
  const totalStock = getMedicineTotalStock({ batches });
  const normalizedBatches = batches.map(normalizeBatch);

  return {
    ...source,
    price: toNumber(source.price ?? latestBatch?.sellingPrice),
    cost: toNumber(source.cost ?? latestBatch?.purchaseCost),
    stock: totalStock,
    expiryDate: source.expiryDate || latestBatch?.expiryDate || '',
    location: source.location || latestBatch?.location || '',
    tabletsPerStrip: toNumber(source.tabletsPerStrip ?? 1),
    batches: normalizedBatches,
  };
};

export const appendMedicineBatch = (medicine, batchInput) => {
  const normalizedMedicine = normalizeMedicineRecord(medicine);
  const nextBatchNumber = getNextBatchNumber(normalizedMedicine);
  const batches = [...getMedicineBatches(normalizedMedicine), buildMedicineBatch({
    ...batchInput,
    batchNumber: nextBatchNumber,
  })];
  const latestBatch = batches[batches.length - 1];

  return {
    ...normalizedMedicine,
    price: latestBatch.sellingPrice,
    cost: latestBatch.purchaseCost,
    expiryDate: latestBatch.expiryDate,
    location: latestBatch.location,
    batches,
    stock: getMedicineTotalStock({ batches }),
  };
};

export const consumeMedicineStock = (medicine, quantity) => {
  const normalizedMedicine = normalizeMedicineRecord(medicine);
  const remainingToSell = Math.max(0, toNumber(quantity));
  const batches = sortBatchesForSale(getMedicineBatches(normalizedMedicine).map((batch) => ({ ...batch })));

  let remaining = remainingToSell;
  const consumedBatches = [];
  const updatedBatches = batches.map((batch) => {
    if (remaining <= 0) return batch;

    const available = toNumber(batch.quantity);
    if (available <= 0) return batch;

    const sold = Math.min(available, remaining);
    remaining -= sold;

    consumedBatches.push({
      ...batch,
      batchLabel: batch.batchLabel || formatBatchLabel(batch.batchNumber),
      consumedQuantity: sold,
    });

    return {
      ...batch,
      quantity: available - sold,
    };
  });

  return {
    medicine: {
      ...normalizedMedicine,
      batches: updatedBatches,
      stock: getMedicineTotalStock({ batches: updatedBatches }),
    },
    consumedBatches,
    shortfall: remaining,
  };
};

export const planMedicineSale = (medicine, quantity) => {
  const normalizedMedicine = normalizeMedicineRecord(medicine);
  const { medicine: updatedMedicine, consumedBatches, shortfall } = consumeMedicineStock(normalizedMedicine, quantity);
  const saleLines = consumedBatches.map((batch) => {
    const lineQuantity = toNumber(batch.consumedQuantity || batch.quantity || 0);
    const linePrice = toNumber(batch.sellingPrice || normalizedMedicine.price || 0);
    const lineCost = toNumber(batch.purchaseCost || normalizedMedicine.cost || 0);

    return {
      medicineId: normalizedMedicine.id,
      medicineName: normalizedMedicine.name,
      genericName: normalizedMedicine.genericName,
      category: normalizedMedicine.category,
      batchNumber: batch.batchNumber,
      batchLabel: batch.batchLabel || formatBatchLabel(batch.batchNumber),
      quantity: lineQuantity,
      price: linePrice,
      cost: lineCost,
      expiryDate: batch.expiryDate || normalizedMedicine.expiryDate,
      shelfLocation: batch.location || normalizedMedicine.location,
      lineTotal: Number((linePrice * lineQuantity).toFixed(2)),
      lineCostTotal: Number((lineCost * lineQuantity).toFixed(2)),
    };
  });

  return {
    medicine: updatedMedicine,
    saleLines,
    shortfall,
    requestedQuantity: toNumber(quantity),
    fulfilledQuantity: saleLines.reduce((sum, line) => sum + toNumber(line.quantity, 0), 0),
    totalSellingAmount: Number(saleLines.reduce((sum, line) => sum + toNumber(line.lineTotal, 0), 0).toFixed(2)),
    totalPurchaseCost: Number(saleLines.reduce((sum, line) => sum + toNumber(line.lineCostTotal, 0), 0).toFixed(2)),
  };
};