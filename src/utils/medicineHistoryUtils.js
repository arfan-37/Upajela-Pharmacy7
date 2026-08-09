const MEDICINE_HISTORY_KEY = 'shabab_medicine_history';

const now = () => new Date().toISOString();

const load = () => {
  try {
    const raw = localStorage.getItem(MEDICINE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const save = (records) => {
  localStorage.setItem(MEDICINE_HISTORY_KEY, JSON.stringify(records));
};

const uid = () => `med-hist-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const loadMedicineHistory = () => load();

export const addMedicineHistoryRecord = (record, currentUserRole) => {
  const records = load();
  const entry = {
    id: uid(),
    createdAt: now(),
    updatedBy: currentUserRole || 'Staff',
    ...record,
  };
  records.unshift(entry);
  save(records);
  return entry;
};

export const getMedicineHistory = (medicineId) => {
  return load().filter(r => r.medicineId === medicineId);
};
