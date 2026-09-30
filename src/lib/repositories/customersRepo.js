import { supabase } from '../supabaseClient.js';
import { CUSTOMER_DB_COLUMNS, CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS, mapPayload, mapMany, fromDbPayload, fromDbMany, CUSTOMER_DB_COLUMNS_REVERSE, CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function getAllCustomers() {
  const { data, error } = await supabase.from('customers').select('*').order('id', { ascending: true });
  if (error) throw error;
  return fromDbMany(data || [], CUSTOMER_DB_COLUMNS_REVERSE);
}

export async function getCustomerById(id) {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) throw error;
  return fromDbPayload(data, CUSTOMER_DB_COLUMNS_REVERSE);
}

export async function upsertCustomer(customer) {
  const payload = mapPayload(customer, CUSTOMER_DB_COLUMNS);
  const { data, error } = await supabase.from('customers').upsert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], CUSTOMER_DB_COLUMNS_REVERSE);
}

export async function upsertMany(customers) {
  const mapped = mapMany(customers, CUSTOMER_DB_COLUMNS);
  const { error } = await supabase.from('customers').upsert(mapped);
  if (error) throw error;
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllCustomerPaymentHistory() {
  const { data, error } = await supabase.from('customer_payment_history').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS_REVERSE);
}

export async function getCustomerPaymentHistoryByCustomer(customerId) {
  const { data, error } = await supabase.from('customer_payment_history').select('*').eq('customer_id', customerId).order('createdAt', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS_REVERSE);
}

export async function insertCustomerPaymentHistory(entry) {
  const payload = mapPayload(entry, CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS);
  const { data, error } = await supabase.from('customer_payment_history').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS_REVERSE);
}
