import { supabase } from '../supabaseClient.js';
import { COMPANY_DB_COLUMNS, COMPANY_TRANSACTION_DB_COLUMNS, mapPayload, mapMany, fromDbPayload, fromDbMany, COMPANY_DB_COLUMNS_REVERSE, COMPANY_TRANSACTION_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function getAllCompanies() {
  const { data, error } = await supabase.from('companies').select('*').order('id', { ascending: true });
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_DB_COLUMNS_REVERSE);
}

export async function getCompanyById(id) {
  const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
  if (error) throw error;
  return fromDbPayload(data, COMPANY_DB_COLUMNS_REVERSE);
}

export async function upsertCompany(company) {
  const payload = mapPayload(company, COMPANY_DB_COLUMNS);
  const { data, error } = await supabase.from('companies').upsert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_DB_COLUMNS_REVERSE);
}

export async function upsertMany(companies) {
  const mapped = mapMany(companies, COMPANY_DB_COLUMNS);
  const { error } = await supabase.from('companies').upsert(mapped);
  if (error) throw error;
}

export async function deleteCompany(id) {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllCompanyTransactions() {
  const { data, error } = await supabase.from('company_transactions').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_TRANSACTION_DB_COLUMNS_REVERSE);
}

export async function getCompanyTransactionsByCompany(companyId) {
  const { data, error } = await supabase.from('company_transactions').select('*').eq('company_id', companyId).order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_TRANSACTION_DB_COLUMNS_REVERSE);
}

export async function insertCompanyTransaction(entry) {
  const payload = mapPayload(entry, COMPANY_TRANSACTION_DB_COLUMNS);
  const { data, error } = await supabase.from('company_transactions').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], COMPANY_TRANSACTION_DB_COLUMNS_REVERSE);
}
