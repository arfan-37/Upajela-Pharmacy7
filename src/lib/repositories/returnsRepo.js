import { supabase } from '../supabaseClient.js';
import { RETURN_DB_COLUMNS, mapPayload, mapMany, fromDbPayload, fromDbMany, RETURN_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function getAllReturns() {
  const { data, error } = await supabase.from('returns').select('*').order('returndate', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], RETURN_DB_COLUMNS_REVERSE);
}

export async function insertReturn(record) {
  const payload = mapPayload(record, RETURN_DB_COLUMNS);
  const { data, error } = await supabase.from('returns').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], RETURN_DB_COLUMNS_REVERSE);
}

export async function upsertMany(returns) {
  const mapped = mapMany(returns, RETURN_DB_COLUMNS);
  const { error } = await supabase.from('returns').upsert(mapped);
  if (error) throw error;
}

export async function getReturnsByTransaction(originalInvoiceId) {
  const { data, error } = await supabase.from('returns').select('*').eq('originalinvoiceid', originalInvoiceId);
  if (error) throw error;
  return fromDbMany(data || [], RETURN_DB_COLUMNS_REVERSE);
}
