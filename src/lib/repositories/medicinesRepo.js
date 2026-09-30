import { supabase } from '../supabaseClient.js';
import { MEDICINE_DB_COLUMNS, BATCH_DB_COLUMNS, mapPayload, mapMany, fromDbPayload, fromDbMany, MEDICINE_DB_COLUMNS_REVERSE, BATCH_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function getAllMedicines() {
  const { data, error } = await supabase.from('medicines').select('*');
  if (error) throw error;
  console.log('[DEBUG] getAllMedicines raw data:', data);
  const medicines = fromDbMany(data || [], MEDICINE_DB_COLUMNS_REVERSE);
  console.log('[DEBUG] getAllMedicines mapped:', medicines);
  return medicines.map((medicine) => {
    const batches = Array.isArray(medicine.batches) ? fromDbMany(medicine.batches, BATCH_DB_COLUMNS_REVERSE) : [];
    return { ...medicine, batches };
  });
}

export async function getMedicineById(id) {
  const { data, error } = await supabase.from('medicines').select('*').eq('id', id).single();
  if (error) throw error;
  const medicine = fromDbPayload(data, MEDICINE_DB_COLUMNS_REVERSE);
  const batches = Array.isArray(medicine.batches) ? fromDbMany(medicine.batches, BATCH_DB_COLUMNS_REVERSE) : [];
  return { ...medicine, batches };
}

export async function upsertMedicine(medicine) {
  const payload = mapPayload(medicine, MEDICINE_DB_COLUMNS);
  const { data, error } = await supabase.from('medicines').upsert(payload).select();
  if (error) throw error;
  const medicines = fromDbMany(data || [], MEDICINE_DB_COLUMNS_REVERSE);
  return medicines;
}

export async function upsertMany(medicines) {
  const medicinesOnly = medicines.map(({ batches, ...m }) => mapPayload(m, MEDICINE_DB_COLUMNS));
  const { error: medError } = await supabase.from('medicines').upsert(medicinesOnly);
  if (medError) throw medError;

  const allBatches = medicines.flatMap((m) => (Array.isArray(m.batches) ? m.batches : []));
  if (allBatches.length > 0) {
    const mappedBatches = mapMany(allBatches, BATCH_DB_COLUMNS);
    const { error: batchError } = await supabase.from('batches').upsert(mappedBatches);
    if (batchError) throw batchError;
  }
}

export async function deleteMedicine(id) {
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllBatches() {
  const { data, error } = await supabase.from('batches').select('*');
  if (error) throw error;
  return fromDbMany(data || [], BATCH_DB_COLUMNS_REVERSE);
}

export async function getBatchesByMedicine(medicineId) {
  const { data, error } = await supabase.from('batches').select('*').eq('medicine_id', medicineId);
  if (error) throw error;
  return fromDbMany(data || [], BATCH_DB_COLUMNS_REVERSE);
}

export async function upsertBatch(batch) {
  const payload = mapPayload(batch, BATCH_DB_COLUMNS);
  const { data, error } = await supabase.from('batches').upsert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], BATCH_DB_COLUMNS_REVERSE);
}

export async function deleteBatch(id) {
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) throw error;
}
