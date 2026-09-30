import { supabase } from '../supabaseClient.js';
import { FINANCIAL_REPORT_DB_COLUMNS, mapPayload, fromDbMany, FINANCIAL_REPORT_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function upsertFinancialReport(report) {
  const payload = mapPayload(report, FINANCIAL_REPORT_DB_COLUMNS);
  const { data, error } = await supabase.from('financial_reports').upsert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], FINANCIAL_REPORT_DB_COLUMNS_REVERSE);
}

export async function getFinancialReportByDate(reportDate) {
  const { data, error } = await supabase.from('financial_reports').select('*').eq('reportDate', reportDate).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ? fromDbPayload(data, FINANCIAL_REPORT_DB_COLUMNS_REVERSE) : null;
}

export async function getAllFinancialReports() {
  const { data, error } = await supabase.from('financial_reports').select('*').order('reportDate', { ascending: false });
  if (error) throw error;
  return fromDbMany(data || [], FINANCIAL_REPORT_DB_COLUMNS_REVERSE);
}
