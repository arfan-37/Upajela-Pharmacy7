import { supabase } from '../supabaseClient.js';
import { TRANSACTION_DB_COLUMNS, TRANSACTION_ITEM_DB_COLUMNS, mapPayload, mapMany, fromDbPayload, fromDbMany, TRANSACTION_DB_COLUMNS_REVERSE, TRANSACTION_ITEM_DB_COLUMNS_REVERSE } from '../dbColumnMaps.js';

export async function getAllTransactions() {
  const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
  if (txError) throw txError;

  const transactions = fromDbMany(txData || [], TRANSACTION_DB_COLUMNS_REVERSE);
  const txIds = transactions.map(tx => tx.id).filter(Boolean);

  let itemsByTxId = {};
  if (txIds.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase.from('transaction_items').select('*').in('transaction_id', txIds);
    if (itemsError) throw itemsError;

    const mappedItems = fromDbMany(itemsData || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE);
    for (const item of mappedItems) {
      const txId = item.transaction_id;
      if (!txId) continue;
      itemsByTxId[txId] = itemsByTxId[txId] || [];
      itemsByTxId[txId].push(item);
    }
  }

  return transactions.map(tx => ({
    ...tx,
    items: itemsByTxId[tx.id] || [],
  }));
}

export async function getTransactionById(id) {
  const { data: txData, error: txError } = await supabase.from('transactions').select('*').eq('id', id).single();
  if (txError) throw txError;

  const transaction = fromDbPayload(txData, TRANSACTION_DB_COLUMNS_REVERSE);

  const { data: itemsData, error: itemsError } = await supabase.from('transaction_items').select('*').eq('transaction_id', id);
  if (itemsError) throw itemsError;

  const items = fromDbMany(itemsData || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE);
  return {
    ...transaction,
    items: items || [],
  };
}

export async function insertTransaction(transaction) {
  const payload = mapPayload(transaction, TRANSACTION_DB_COLUMNS);
  const { data, error } = await supabase.from('transactions').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], TRANSACTION_DB_COLUMNS_REVERSE);
}

export async function insertMany(transactions) {
  const txOnly = transactions.map(({ items, ...t }) => mapPayload(t, TRANSACTION_DB_COLUMNS));
  const { data: txData, error: txError } = await supabase.from('transactions').insert(txOnly).select();
  if (txError) throw txError;

  const txIds = txData.map((tx) => tx.id);
  const allItems = [];
  transactions.forEach((tx, index) => {
    const txId = txIds[index];
    if (Array.isArray(tx.items)) {
      tx.items.forEach((item) => {
        allItems.push(mapPayload({
          transaction_id: txId,
          medicine_id: item.id,
          name: item.name,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          price: item.price,
          cost: item.cost,
          expiryDate: item.expiryDate,
          shelfLocation: item.shelfLocation,
        }, TRANSACTION_ITEM_DB_COLUMNS));
      });
    }
  });

  if (allItems.length > 0) {
    const { error: itemsError } = await supabase.from('transaction_items').insert(allItems);
    if (itemsError) throw itemsError;
  }

  return fromDbMany(txData, TRANSACTION_DB_COLUMNS_REVERSE);
}

export async function upsertMany(transactions) {
  const txOnly = transactions.map(({ items, ...t }) => mapPayload(t, TRANSACTION_DB_COLUMNS));
  const { error: txError } = await supabase.from('transactions').upsert(txOnly);
  if (txError) throw txError;

  const allItems = [];
  transactions.forEach((tx) => {
    if (Array.isArray(tx.items)) {
      tx.items.forEach((item) => {
        allItems.push(mapPayload({
          transaction_id: tx.id,
          medicine_id: item.id,
          name: item.name,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          price: item.price,
          cost: item.cost,
          expiryDate: item.expiryDate,
          shelfLocation: item.shelfLocation,
        }, TRANSACTION_ITEM_DB_COLUMNS));
      });
    }
  });

  if (allItems.length > 0) {
    const { error: itemsError } = await supabase.from('transaction_items').upsert(allItems);
    if (itemsError) throw itemsError;
  }
}

export async function getAllTransactionItems() {
  const { data, error } = await supabase.from('transaction_items').select('*');
  if (error) throw error;
  return fromDbMany(data || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE);
}

export async function getTransactionItemsByTransaction(transactionId) {
  const { data, error } = await supabase.from('transaction_items').select('*').eq('transaction_id', transactionId);
  if (error) throw error;
  return fromDbMany(data || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE);
}

export async function insertTransactionItem(item) {
  const payload = mapPayload(item, TRANSACTION_ITEM_DB_COLUMNS);
  const { data, error } = await supabase.from('transaction_items').insert(payload).select();
  if (error) throw error;
  return fromDbMany(data || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE);
}

export async function insertTransactionWithItems(transaction, items) {
  const txPayload = mapPayload(transaction, TRANSACTION_DB_COLUMNS);
  const { data: txData, error: txError } = await supabase.from('transactions').insert(txPayload).select();
  if (txError) throw txError;
  if (!txData || txData.length === 0) throw new Error('Failed to insert transaction');

  const txId = txData[0].id;
  const itemsWithTxId = items.map((item) => mapPayload({ ...item, transaction_id: txId }, TRANSACTION_ITEM_DB_COLUMNS));
  const { data: itemsData, error: itemsError } = await supabase.from('transaction_items').insert(itemsWithTxId).select();
  if (itemsError) throw itemsError;

  return {
    transaction: fromDbPayload(txData[0], TRANSACTION_DB_COLUMNS_REVERSE),
    items: fromDbMany(itemsData || [], TRANSACTION_ITEM_DB_COLUMNS_REVERSE),
  };
}
