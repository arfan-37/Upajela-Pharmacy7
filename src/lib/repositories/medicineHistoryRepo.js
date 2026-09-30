import { supabase } from '../supabaseClient.js';
import { MEDICINE_HISTORY_DB_COLUMNS, mapPayload, fromDbMany, MEDICINE_HISTORY_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function insertMedicineHistory(entry) {
  const payload = mapPayload(entry, MEDICINE_HISTORY_DB_COLUMNS);
  const { data, error } = await supabase.from('medicine_history').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], MEDICINE_HISTORY_DB_COLUMNS_REVERSE);
}

export async function getMedicineHistory(medicineId) {
  const { data, error } = await supabase.from('medicine_history').select('*').eq('medicineId', medicineId).order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], MEDICINE_HISTORY_DB_COLUMNS_REVERSE);
}

export async function getAllMedicineHistory() {
  const { data, error } = await supabase.from('medicine_history').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], MEDICINE_HISTORY_DB_COLUMNS_REVERSE);
}
