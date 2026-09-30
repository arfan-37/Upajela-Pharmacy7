import { supabase } from '../supabaseClient.js';
import { COMPANY_HISTORY_DB_COLUMNS, mapPayload, fromDbMany, COMPANY_HISTORY_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function insertCompanyHistory(entry) {
  const payload = mapPayload(entry, COMPANY_HISTORY_DB_COLUMNS);
  const { data, error } = await supabase.from('company_history').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_HISTORY_DB_COLUMNS_REVERSE);
}

export async function getAllCompanyHistory() {
  const { data, error } = await supabase.from('company_history').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_HISTORY_DB_COLUMNS_REVERSE);
}
