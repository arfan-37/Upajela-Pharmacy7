export const MEDICINE_DB_COLUMNS = {
  id: 'id',
  name: 'name',
  genericName: 'genericname',
  category: 'category',
  price: 'price',
  cost: 'cost',
  stock: 'stock',
  expiryDate: 'expirydate',
  location: 'location',
  tabletsPerStrip: 'tabletsperstrip',
  animalType: 'animaltype',
  description: 'description',
};

export const BATCH_DB_COLUMNS = {
  id: 'id',
  medicine_id: 'medicine_id',
  batchNumber: 'batchnumber',
  batchLabel: 'batchlabel',
  quantity: 'quantity',
  expiryDate: 'expirydate',
  purchaseCost: 'purchasecost',
  sellingPrice: 'sellingprice',
  location: 'location',
  stockInDate: 'stockindate',
  notes: 'notes',
};

export const CUSTOMER_DB_COLUMNS = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  address: 'address',
  totalPurchaseAmount: 'totalpurchaseamount',
  cashPaid: 'cashpaid',
  dueAmount: 'dueamount',
  totalDue: 'totaldue',
  createdAt: 'createdat',
};

export const CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS = {
  id: 'id',
  customer_id: 'customer_id',
  type: 'type',
  createdAt: 'createdat',
  purchaseDate: 'purchasedate',
  paymentDate: 'paymentdate',
  invoiceNumber: 'invoicenumber',
  products: 'products',
  totalPurchaseAmount: 'totalpurchaseamount',
  cashPaid: 'cashpaid',
  dueCreated: 'duecreated',
  paymentAmount: 'paymentamount',
  previousDue: 'previousdue',
  remainingDue: 'remainingdue',
  totalOutstandingDue: 'totaloutstandingdue',
  paymentStatus: 'paymentstatus',
};

export const COMPANY_DB_COLUMNS = {
  id: 'id',
  name: 'name',
  contact: 'contact',
  address: 'address',
  totalPurchaseAmount: 'totalpurchaseamount',
  amountPaid: 'amountpaid',
  dueAmount: 'dueamount',
};

export const COMPANY_TRANSACTION_DB_COLUMNS = {
  id: 'id',
  company_id: 'company_id',
  type: 'type',
  createdAt: 'createdat',
  date: 'date',
  products: 'products',
  totalAmount: 'totalamount',
  amountPaid: 'amountpaid',
  dueAmount: 'dueamount',
  dueDate: 'duedate',
  paymentDate: 'paymentdate',
  previousDue: 'previousdue',
  remainingDue: 'remainingdue',
  totalOutstandingDue: 'totaloutstandingdue',
};

export const TRANSACTION_DB_COLUMNS = {
  id: 'id',
  timestamp: 'timestamp',
  salesperson: 'salesperson',
  subtotal: 'subtotal',
  discount: 'discount',
  total: 'total',
  cashReceived: 'cashreceived',
  changeGiven: 'changegiven',
  paymentType: 'paymenttype',
  customer_id: 'customer_id',
};

export const TRANSACTION_ITEM_DB_COLUMNS = {
  id: 'id',
  transaction_id: 'transaction_id',
  medicine_id: 'medicine_id',
  name: 'name',
  batchNumber: 'batchnumber',
  quantity: 'quantity',
  price: 'price',
  cost: 'cost',
  expiryDate: 'expirydate',
  shelfLocation: 'shelflocation',
};

export const RETURN_DB_COLUMNS = {
  id: 'id',
  returnDate: 'returndate',
  originalInvoiceId: 'originalinvoiceid',
  customer_id: 'customer_id',
  customerName: 'customername',
  medicineId: 'medicineid',
  medicineName: 'medicinename',
  batchNumber: 'batchnumber',
  batchLabel: 'batchlabel',
  returnQuantity: 'returnquantity',
  reason: 'reason',
  refundAmount: 'refundamount',
  dueAdjustment: 'dueadjustment',
  cashRefund: 'cashrefund',
  refundType: 'refundtype',
  processedBy: 'processedby',
  status: 'status',
};

export const INVENTORY_HISTORY_DB_COLUMNS = {
  id: 'id',
  createdAt: 'createdat',
  addedBy: 'addedby',
  medicineName: 'medicinename',
  companyName: 'companyname',
  category: 'category',
  batchNo: 'batchno',
  previousStock: 'previousstock',
  addedQuantity: 'addedquantity',
  newTotalStock: 'newtotalstock',
  purchaseCost: 'purchasecost',
  sellingPrice: 'sellingprice',
  totalAmount: 'totalamount',
  expiryDate: 'expirydate',
  shelfLocation: 'shelflocation',
  action: 'action',
};

export const COMPANY_HISTORY_DB_COLUMNS = {
  id: 'id',
  createdAt: 'createdat',
  addedBy: 'addedby',
  companyName: 'companyname',
  medicineNames: 'medicinenames',
  quantity: 'quantity',
  totalAmount: 'totalamount',
  amountPaid: 'amountpaid',
  remainingPayable: 'remainingpayable',
  paymentStatus: 'paymentstatus',
};

export const MEDICINE_HISTORY_DB_COLUMNS = {
  id: 'id',
  createdAt: 'createdat',
  updatedBy: 'updatedby',
  medicineId: 'medicineid',
  medicineName: 'medicinename',
  genericName: 'genericname',
  category: 'category',
  animalType: 'animaltype',
  action: 'action',
  previousStock: 'previousstock',
  addedQuantity: 'addedquantity',
  currentStock: 'currentstock',
  purchaseCost: 'purchasecost',
  sellingPrice: 'sellingprice',
  expiryDate: 'expirydate',
  shelfLocation: 'shelflocation',
  batchNo: 'batchno',
  supplier: 'supplier',
  notes: 'notes',
};

export const FINANCIAL_REPORT_DB_COLUMNS = {
  id: 'id',
  reportDate: 'reportdate',
  createdAt: 'createdat',
  lastUpdatedAt: 'lastupdatedat',
  totalSalesAmount: 'totalsalesamount',
  totalPurchaseCost: 'totalpurchasecost',
  grossProfit: 'grossprofit',
  netProfit: 'netprofit',
  totalCashReceived: 'totalcashreceived',
  totalDueCollected: 'totalduecollected',
  totalCustomerDueCreated: 'totalcustomerduecreated',
  totalAmountPaidToCompanies: 'totalamountpaidtocompanies',
  totalCompanyPayable: 'totalcompanypayable',
  totalTransactions: 'totaltransactions',
  totalReturnRefunds: 'totalreturnrefunds',
  totalDueAdjusted: 'totaldueadjusted',
  returnTransactions: 'returntransactions',
  salesTransactions: 'salestransactions',
  companyPurchases: 'companypurchases',
  customerPayments: 'customerpayments',
  companyPayments: 'companypayments',
  isClosed: 'isclosed',
};

export const SHOP_BALANCE_DB_COLUMNS = {
  id: 'id',
  value: 'value',
};

export function mapPayload(payload, columnMap) {
  if (!payload || typeof payload !== 'object') return payload;
  const mapped = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!Object.prototype.hasOwnProperty.call(columnMap, key)) continue;
    const dbKey = columnMap[key] ?? key;
    mapped[dbKey] = value;
  }
  return mapped;
}

export function mapMany(payloads, columnMap) {
  if (!Array.isArray(payloads)) return [];
  return payloads.map((item) => mapPayload(item, columnMap));
}

const reverseMap = (columnMap) => {
  const reversed = {};
  for (const [frontendKey, dbKey] of Object.entries(columnMap)) {
    if (dbKey !== frontendKey) {
      reversed[dbKey] = frontendKey;
    }
  }
  return reversed;
};

export const MEDICINE_DB_COLUMNS_REVERSE = reverseMap(MEDICINE_DB_COLUMNS);
export const BATCH_DB_COLUMNS_REVERSE = reverseMap(BATCH_DB_COLUMNS);
export const CUSTOMER_DB_COLUMNS_REVERSE = reverseMap(CUSTOMER_DB_COLUMNS);
export const CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS_REVERSE = reverseMap(CUSTOMER_PAYMENT_HISTORY_DB_COLUMNS);
export const COMPANY_DB_COLUMNS_REVERSE = reverseMap(COMPANY_DB_COLUMNS);
export const COMPANY_TRANSACTION_DB_COLUMNS_REVERSE = reverseMap(COMPANY_TRANSACTION_DB_COLUMNS);
export const TRANSACTION_DB_COLUMNS_REVERSE = reverseMap(TRANSACTION_DB_COLUMNS);
export const TRANSACTION_ITEM_DB_COLUMNS_REVERSE = reverseMap(TRANSACTION_ITEM_DB_COLUMNS);
export const RETURN_DB_COLUMNS_REVERSE = reverseMap(RETURN_DB_COLUMNS);
export const INVENTORY_HISTORY_DB_COLUMNS_REVERSE = reverseMap(INVENTORY_HISTORY_DB_COLUMNS);
export const COMPANY_HISTORY_DB_COLUMNS_REVERSE = reverseMap(COMPANY_HISTORY_DB_COLUMNS);
export const MEDICINE_HISTORY_DB_COLUMNS_REVERSE = reverseMap(MEDICINE_HISTORY_DB_COLUMNS);
export const FINANCIAL_REPORT_DB_COLUMNS_REVERSE = reverseMap(FINANCIAL_REPORT_DB_COLUMNS);
export const SHOP_BALANCE_DB_COLUMNS_REVERSE = reverseMap(SHOP_BALANCE_DB_COLUMNS);

export function fromDbPayload(payload, reverseColumnMap) {
  if (!payload || typeof payload !== 'object') return payload;
  const mapped = {};
  for (const [key, value] of Object.entries(payload)) {
    const frontendKey = reverseColumnMap[key] ?? key;
    mapped[frontendKey] = value;
  }
  return mapped;
}

export function fromDbMany(payloads, reverseColumnMap) {
  if (!Array.isArray(payloads)) return [];
  return payloads.map((item) => fromDbPayload(item, reverseColumnMap));
}
