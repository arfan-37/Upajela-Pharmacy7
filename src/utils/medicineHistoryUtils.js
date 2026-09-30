import { insertMedicineHistory } from '../lib/repositories/medicineHistoryRepo.js';

const now = () => new Date().toISOString();

const uid = () => `med-hist-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const loadMedicineHistory = () => [];

export const addMedicineHistoryRecord = (record, currentUserRole) => {
  const entry = {
    createdAt: now(),
    updatedBy: currentUserRole || 'Staff',
    ...record,
  };
  insertMedicineHistory(entry).catch(console.error);
  return entry;
};

export const getMedicineHistory = async (medicineId) => {
  const { getMedicineHistory } = await import('../lib/repositories/medicineHistoryRepo.js');
  return getMedicineHistory(medicineId);
};
