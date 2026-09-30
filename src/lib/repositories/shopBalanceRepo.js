import { supabase } from '../supabaseClient.js';
import { SHOP_BALANCE_DB_COLUMNS, mapPayload, fromDbPayload, SHOP_BALANCE_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

const SHOP_BALANCE_KEY = 'shop_balance';

export async function getShopBalance() {
  try {
    const { data, error } = await supabase.from('shop_balance').select('*').eq('id', SHOP_BALANCE_KEY).single();
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01' || error.status === 404) {
        return 0;
      }
      throw error;
    }
    const row = data ? fromDbPayload(data, SHOP_BALANCE_DB_COLUMNS_REVERSE) : null;
    return row ? Number(row.value || 0) : 0;
  } catch (error) {
    console.warn('Failed to load shop balance, returning 0', error);
    return 0;
  }
}

export async function setShopBalance(value) {
  const payload = mapPayload({ id: SHOP_BALANCE_KEY, value: Number(value || 0) }, SHOP_BALANCE_DB_COLUMNS);
  const { error } = await supabase.from('shop_balance').upsert(payload);
  if (error) throw error;
}

export async function adjustShopBalance(delta) {
  const current = await getShopBalance();
  const next = Number((current + delta).toFixed(2));
  return setShopBalance(next);
}
