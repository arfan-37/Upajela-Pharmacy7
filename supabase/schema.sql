-- Enable UUID extension for potential future use
create extension if not exists "uuid-ossp";

-- Medicines table
create table if not exists public.medicines (
  id text primary key,
  name text not null,
  genericName text,
  category text,
  price numeric not null default 0,
  cost numeric not null default 0,
  stock integer not null default 0,
  expiryDate text,
  location text,
  tabletsPerStrip integer default 1,
  animalType text default 'Other',
  description text
);

-- Batches table
create table if not exists public.batches (
  id serial primary key,
  medicine_id text not null references public.medicines(id) on delete cascade,
  batchNumber text,
  batchLabel text,
  quantity integer not null default 0,
  expiryDate text,
  purchaseCost numeric not null default 0,
  sellingPrice numeric not null default 0,
  location text,
  stockInDate text,
  notes text
);

-- Customers table
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text,
  address text,
  totalPurchaseAmount numeric not null default 0,
  cashPaid numeric not null default 0,
  dueAmount numeric not null default 0,
  totalDue numeric not null default 0,
  createdAt text
);

-- Customer payment history table
create table if not exists public.customer_payment_history (
  id serial primary key,
  customer_id text not null references public.customers(id) on delete cascade,
  type text not null,
  createdAt text not null,
  purchaseDate text,
  paymentDate text,
  invoiceNumber text,
  products jsonb,
  totalPurchaseAmount numeric not null default 0,
  cashPaid numeric not null default 0,
  dueCreated numeric not null default 0,
  paymentAmount numeric not null default 0,
  previousDue numeric not null default 0,
  remainingDue numeric not null default 0,
  totalOutstandingDue numeric not null default 0,
  paymentStatus text
);

-- Companies table
create table if not exists public.companies (
  id text primary key,
  name text not null,
  contact text,
  address text,
  totalPurchaseAmount numeric not null default 0,
  amountPaid numeric not null default 0,
  dueAmount numeric not null default 0
);

-- Company transactions table
create table if not exists public.company_transactions (
  id serial primary key,
  company_id text not null references public.companies(id) on delete cascade,
  type text not null,
  createdAt text not null,
  date text,
  products jsonb,
  totalAmount numeric not null default 0,
  amountPaid numeric not null default 0,
  dueAmount numeric not null default 0,
  dueDate text,
  paymentDate text,
  previousDue numeric not null default 0,
  remainingDue numeric not null default 0,
  totalOutstandingDue numeric not null default 0
);

-- Transactions table
create table if not exists public.transactions (
  id text primary key,
  timestamp text not null,
  salesperson text,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  cashReceived numeric not null default 0,
  changeGiven numeric not null default 0,
  paymentType text,
  customer_id text references public.customers(id) on delete set null
);

-- Transaction items table
create table if not exists public.transaction_items (
  id serial primary key,
  transaction_id text not null references public.transactions(id) on delete cascade,
  medicine_id text not null references public.medicines(id) on delete restrict,
  name text not null,
  batchNumber text,
  quantity integer not null default 0,
  price numeric not null default 0,
  cost numeric not null default 0,
  expiryDate text,
  shelfLocation text
);

-- Returns table
create table if not exists public.returns (
  id serial primary key,
  returnDate text not null,
  originalInvoiceId text not null,
  customer_id text references public.customers(id) on delete set null,
  customerName text,
  medicineId text not null,
  medicineName text,
  batchNumber text,
  batchLabel text,
  returnQuantity integer not null default 0,
  reason text,
  refundAmount numeric not null default 0,
  dueAdjustment numeric not null default 0,
  cashRefund numeric not null default 0,
  refundType text,
  processedBy text,
  status text
);

-- Inventory history table
create table if not exists public.inventory_history (
  id serial primary key,
  createdAt text not null,
  addedBy text,
  medicineName text,
  companyName text,
  category text,
  batchNo text,
  previousStock integer not null default 0,
  addedQuantity integer not null default 0,
  newTotalStock integer not null default 0,
  purchaseCost numeric not null default 0,
  sellingPrice numeric not null default 0,
  totalAmount numeric not null default 0,
  expiryDate text,
  shelfLocation text,
  action text
);

-- Company history table
create table if not exists public.company_history (
  id serial primary key,
  createdAt text not null,
  addedBy text,
  companyName text,
  medicineNames text,
  quantity integer not null default 0,
  totalAmount numeric not null default 0,
  amountPaid numeric not null default 0,
  remainingPayable numeric not null default 0,
  paymentStatus text
);

-- Medicine history table
create table if not exists public.medicine_history (
  id serial primary key,
  createdAt text not null,
  updatedBy text,
  medicineId text,
  medicineName text,
  genericName text,
  category text,
  animalType text,
  action text,
  previousStock integer not null default 0,
  addedQuantity integer not null default 0,
  currentStock integer not null default 0,
  purchaseCost numeric not null default 0,
  sellingPrice numeric not null default 0,
  expiryDate text,
  shelfLocation text,
  batchNo text,
  supplier text,
  notes text
);

-- Financial reports table
create table if not exists public.financial_reports (
  id text primary key,
  reportDate text not null unique,
  createdAt text not null,
  lastUpdatedAt text not null,
  totalSalesAmount numeric not null default 0,
  totalPurchaseCost numeric not null default 0,
  grossProfit numeric not null default 0,
  netProfit numeric not null default 0,
  totalCashReceived numeric not null default 0,
  totalDueCollected numeric not null default 0,
  totalCustomerDueCreated numeric not null default 0,
  totalAmountPaidToCompanies numeric not null default 0,
  totalCompanyPayable numeric not null default 0,
  totalTransactions integer not null default 0,
  totalReturnRefunds numeric not null default 0,
  totalDueAdjusted numeric not null default 0,
  returnTransactions jsonb,
  salesTransactions jsonb,
  companyPurchases jsonb,
  customerPayments jsonb,
  companyPayments jsonb,
  isClosed boolean not null default false
);

-- Indexes for common queries
create index if not exists idx_batches_medicine_id on public.batches(medicine_id);
create index if not exists idx_transaction_items_transaction_id on public.transaction_items(transaction_id);
create index if not exists idx_transaction_items_medicine_id on public.transaction_items(medicine_id);
create index if not exists idx_customer_payment_history_customer_id on public.customer_payment_history(customer_id);
create index if not exists idx_company_transactions_company_id on public.company_transactions(company_id);
create index if not exists idx_returns_original_invoice_id on public.returns(originalInvoiceId);
create index if not exists idx_returns_customer_id on public.returns(customer_id);
create index if not exists idx_financial_reports_report_date on public.financial_reports(reportDate);
create index if not exists idx_transactions_timestamp on public.transactions(timestamp);

-- Optional: disable RLS for simplicity during initial migration
-- alter table public.medicines disable row level security;
-- alter table public.batches disable row level security;
-- alter table public.customers disable row level security;
-- alter table public.customer_payment_history disable row level security;
-- alter table public.companies disable row level security;
-- alter table public.company_transactions disable row level security;
-- alter table public.transactions disable row level security;
-- alter table public.transaction_items disable row level security;
-- alter table public.returns disable row level security;
-- alter table public.inventory_history disable row level security;
-- alter table public.company_history disable row level security;
-- alter table public.medicine_history disable row level security;
-- alter table public.financial_reports disable row level security;
