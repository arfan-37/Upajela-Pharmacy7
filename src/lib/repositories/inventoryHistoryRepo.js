import { supabase } from '../supabaseClient.js';
import { INVENTORY_HISTORY_DB_COLUMNS, mapPayload, fromDbMany, INVENTORY_HISTORY_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function insertInventoryHistory(entry) {
  const payload = mapPayload(entry, INVENTORY_HISTORY_DB_COLUMNS);
  const { data, error } = await supabase.from('inventory_history').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], INVENTORY_HISTORY_DB_COLUMNS_REVERSE);
}

export async function getAllInventoryHistory() {
  const { data, error } = await supabase.from('inventory_history').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], INVENTORY_HISTORY_DB_COLUMNS_REVERSE);
}
