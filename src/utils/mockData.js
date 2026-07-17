export const initialMedicines = [
  {
    id: "MED-001",
    name: "Napa Extend",
    genericName: "Paracetamol",
    category: "Tablet",
    price: 3.00,
    cost: 2.30,
    stock: 12, // Low stock alert (under 15)
    expiryDate: "2027-08-15",
    location: "Rack A-1",
    description: "For pain relief and fever"
  },
  {
    id: "MED-002",
    name: "Seclo 20",
    genericName: "Omeprazole",
    category: "Capsule",
    price: 7.00,
    cost: 5.50,
    stock: 120,
    expiryDate: "2026-08-20", // Expiring soon (about 1 month if today is July 2026)
    location: "Rack B-2",
    description: "Proton pump inhibitor for acidity"
  },
  {
    id: "MED-003",
    name: "Fexo 120",
    genericName: "Fexofenadine Hydrochloride",
    category: "Tablet",
    price: 10.00,
    cost: 8.00,
    stock: 8, // Low stock
    expiryDate: "2027-01-10",
    location: "Rack A-3",
    description: "Antihistamine for allergies"
  },
  {
    id: "MED-004",
    name: "Tusca Syrup",
    genericName: "Dextromethorphan + Guaiphenesin",
    category: "Syrup",
    price: 85.00,
    cost: 70.00,
    stock: 25,
    expiryDate: "2026-08-10", // Expiring soon
    location: "Rack C-1",
    description: "Cough suppressant syrup"
  },
  {
    id: "MED-005",
    name: "Moxacil 500",
    genericName: "Amoxicillin",
    category: "Capsule",
    price: 8.50,
    cost: 6.80,
    stock: 5, // Low stock
    expiryDate: "2028-03-30",
    location: "Rack D-1",
    description: "Broad-spectrum antibiotic"
  },
  {
    id: "MED-006",
    name: "Alatrol 10",
    genericName: "Cetirizine Hydrochloride",
    category: "Tablet",
    price: 3.50,
    cost: 2.70,
    stock: 200,
    expiryDate: "2027-12-05",
    location: "Rack A-2",
    description: "Antiallergic tablet"
  },
  {
    id: "MED-007",
    name: "Sergel 20",
    genericName: "Esomeprazole",
    category: "Capsule",
    price: 8.00,
    cost: 6.20,
    stock: 90,
    expiryDate: "2026-07-28", // Urgent: Expiring in less than a month!
    location: "Rack B-1",
    description: "Anti-ulcerant for heartburn"
  },
  {
    id: "MED-008",
    name: "Amodis 400",
    genericName: "Metronidazole",
    category: "Tablet",
    price: 4.50,
    cost: 3.50,
    stock: 45,
    expiryDate: "2027-05-18",
    location: "Rack D-2",
    description: "Antiprotozoal and antibacterial"
  },
  {
    id: "MED-009",
    name: "Ceevit 250",
    genericName: "Vitamin C (Ascorbic Acid)",
    category: "Tablet (Chewable)",
    price: 2.50,
    cost: 1.80,
    stock: 350,
    expiryDate: "2027-10-22",
    location: "Rack E-1",
    description: "Chewable vitamin C supplement"
  },
  {
    id: "MED-010",
    name: "Insulatard Penfill",
    genericName: "Isophane Insulin (NPH)",
    category: "Injection",
    price: 420.00,
    cost: 370.00,
    stock: 18,
    expiryDate: "2027-02-14",
    location: "Fridge",
    description: "Insulin suspension for diabetes management"
  },
  {
    id: "MED-011",
    name: "Losectil 20",
    genericName: "Esomeprazole",
    category: "Capsule",
    price: 9.50,
    cost: 7.20,
    stock: 60,
    expiryDate: "2027-06-18",
    location: "Rack B-3",
    description: "Acid reflux and ulcer relief"
  },
  {
    id: "MED-012",
    name: "Azi 500",
    genericName: "Azithromycin",
    category: "Tablet",
    price: 28.00,
    cost: 21.00,
    stock: 22,
    expiryDate: "2026-12-30",
    location: "Rack D-3",
    description: "Antibiotic for bacterial infections"
  },
  {
    id: "MED-013",
    name: "Nexum 40",
    genericName: "Esomeprazole",
    category: "Capsule",
    price: 12.00,
    cost: 9.00,
    stock: 74,
    expiryDate: "2027-11-02",
    location: "Rack B-4",
    description: "Gastric acid reducer"
  },
  {
    id: "MED-014",
    name: "Monas 10",
    genericName: "Montelukast",
    category: "Tablet",
    price: 6.50,
    cost: 5.10,
    stock: 140,
    expiryDate: "2028-01-20",
    location: "Rack A-4",
    description: "Anti-allergy and asthma support"
  },
  {
    id: "MED-015",
    name: "Zerif 200",
    genericName: "Cefixime",
    category: "Tablet",
    price: 32.00,
    cost: 26.00,
    stock: 38,
    expiryDate: "2027-09-14",
    location: "Rack D-4",
    description: "Broad-spectrum antibiotic"
  }
];

export const initialCompanies = [
  {
    id: "COMP-001",
    name: "Beximco Pharmaceuticals",
    contact: "01711123456",
    address: "Dhanmondi, Dhaka",
    totalPurchaseAmount: 25000,
    amountPaid: 18000,
    dueAmount: 7000,
    transactionHistory: [
      {
        id: "CTX-1001",
        type: "purchase",
        createdAt: "2026-05-18T10:00:00.000Z",
        date: "2026-05-18T10:00:00.000Z",
        products: [
          { name: "Napa Extend", quantity: 100 },
          { name: "Seclo 20", quantity: 50 }
        ],
        totalAmount: 25000,
        amountPaid: 15000,
        dueAmount: 10000,
        dueDate: "2026-06-18",
        paymentDate: null
      },
      {
        id: "CTX-1002",
        type: "payment",
        createdAt: "2026-06-02T10:00:00.000Z",
        date: "2026-06-02T10:00:00.000Z",
        amount: 3000,
        remainingDue: 7000
      }
    ]
  },
  {
    id: "COMP-002",
    name: "Square Pharmaceuticals",
    contact: "01822234567",
    address: "Pabna",
    totalPurchaseAmount: 12000,
    amountPaid: 12000,
    dueAmount: 0,
    transactionHistory: [
      {
        id: "CTX-2001",
        type: "purchase",
        createdAt: "2026-07-01T10:00:00.000Z",
        date: "2026-07-01T10:00:00.000Z",
        products: [
          { name: "Fexo 120", quantity: 80 }
        ],
        totalAmount: 12000,
        amountPaid: 12000,
        dueAmount: 0,
        dueDate: "2026-08-01",
        paymentDate: "2026-07-01"
      }
    ]
  },
  {
    id: "COMP-003",
    name: "ACI Limited",
    contact: "01933345678",
    address: "Gulshan, Dhaka",
    totalPurchaseAmount: 42000,
    amountPaid: 20000,
    dueAmount: 22000,
    transactionHistory: [
      {
        id: "CTX-3001",
        type: "purchase",
        createdAt: "2026-04-10T10:00:00.000Z",
        date: "2026-04-10T10:00:00.000Z",
        products: [
          { name: "Moxacil 500", quantity: 200 },
          { name: "Tusca Syrup", quantity: 40 }
        ],
        totalAmount: 42000,
        amountPaid: 20000,
        dueAmount: 22000,
        dueDate: "2026-05-10",
        paymentDate: null
      },
      {
        id: "CTX-3002",
        type: "payment",
        createdAt: "2026-05-05T10:00:00.000Z",
        date: "2026-05-05T10:00:00.000Z",
        amount: 20000,
        remainingDue: 22000
      }
    ]
  },
  {
    id: "COMP-004",
    name: "Renata Limited",
    contact: "01644456789",
    address: "Mirpur, Dhaka",
    totalPurchaseAmount: 18500,
    amountPaid: 9000,
    dueAmount: 9500,
    transactionHistory: [
      {
        id: "CTX-4001",
        type: "purchase",
        createdAt: "2026-06-22T10:00:00.000Z",
        date: "2026-06-22T10:00:00.000Z",
        products: [
          { name: "Napa Extend", quantity: 150 },
          { name: "Seclo 20", quantity: 60 }
        ],
        totalAmount: 18500,
        amountPaid: 9000,
        dueAmount: 9500,
        dueDate: "2026-07-22",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-005",
    name: "Opsonin Pharma",
    contact: "01555567890",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 9000,
    amountPaid: 9000,
    dueAmount: 0,
    transactionHistory: [
      {
        id: "CTX-5001",
        type: "purchase",
        createdAt: "2026-07-12T10:00:00.000Z",
        date: "2026-07-12T10:00:00.000Z",
        products: [
          { name: "Fexo 120", quantity: 30 }
        ],
        totalAmount: 9000,
        amountPaid: 9000,
        dueAmount: 0,
        dueDate: "2026-08-12",
        paymentDate: "2026-07-12"
      }
    ]
  },
  {
    id: "COMP-006",
    name: "Eskayef Pharmaceuticals",
    contact: "01366678901",
    address: "Bogura Sadar",
    totalPurchaseAmount: 0,
    amountPaid: 0,
    dueAmount: 0,
    transactionHistory: []
  },
  {
    id: "COMP-007",
    name: "Incepta Pharmaceuticals",
    contact: "01788001122",
    address: "Mymensingh",
    totalPurchaseAmount: 15400,
    amountPaid: 9400,
    dueAmount: 6000,
    transactionHistory: [
      {
        id: "CTX-7001",
        type: "purchase",
        createdAt: "2026-07-14T10:30:00.000Z",
        date: "2026-07-14T10:30:00.000Z",
        products: [
          { name: "Azi 500", quantity: 100 },
          { name: "Losectil 20", quantity: 80 }
        ],
        totalAmount: 15400,
        amountPaid: 9400,
        dueAmount: 6000,
        dueDate: "2026-08-14",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-008",
    name: "Healthcare Pharmaceuticals",
    contact: "01799002211",
    address: "Dhaka",
    totalPurchaseAmount: 22350,
    amountPaid: 12350,
    dueAmount: 10000,
    transactionHistory: [
      {
        id: "CTX-8001",
        type: "purchase",
        createdAt: "2026-07-15T11:10:00.000Z",
        date: "2026-07-15T11:10:00.000Z",
        products: [
          { name: "Nexum 40", quantity: 90 },
          { name: "Monas 10", quantity: 150 }
        ],
        totalAmount: 22350,
        amountPaid: 12350,
        dueAmount: 10000,
        dueDate: "2026-08-15",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-009",
    name: "Radiant Pharmaceuticals",
    contact: "01888003344",
    address: "Narayanganj",
    totalPurchaseAmount: 7600,
    amountPaid: 7600,
    dueAmount: 0,
    transactionHistory: [
      {
        id: "CTX-9001",
        type: "purchase",
        createdAt: "2026-07-16T09:15:00.000Z",
        date: "2026-07-16T09:15:00.000Z",
        products: [
          { name: "Zerif 200", quantity: 25 }
        ],
        totalAmount: 7600,
        amountPaid: 7600,
        dueAmount: 0,
        dueDate: "2026-07-16",
        paymentDate: "2026-07-16"
      }
    ]
  }
];

export const initialCustomers = [
  {
    id: "CUST-001",
    name: "Rahim Mia",
    phone: "01711122334",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 5000,
    cashPaid: 2000,
    dueAmount: 3000,
    totalDue: 3000,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-001a",
        type: "sale",
        createdAt: "2026-05-25T10:00:00.000Z",
        purchaseDate: "2026-05-25T10:00:00.000Z",
        invoiceNumber: "INV-1001",
        totalBill: 5000,
        cashPaid: 2000,
        dueAmount: 3000,
        duePaymentDate: null,
        amountReceived: 2000,
        remainingDue: 3000,
        paymentStatus: "Partial Due"
      },
      {
        id: "hist-001b",
        type: "payment",
        createdAt: "2026-06-05T12:00:00.000Z",
        paymentDate: "2026-06-05T12:00:00.000Z",
        amountReceived: 2000,
        remainingDue: 3000,
        invoiceNumber: "INV-1001"
      }
    ]
  },
  {
    id: "CUST-002",
    name: "Karim Uddin",
    phone: "01822233445",
    address: "Bogura Sadar",
    totalPurchaseAmount: 1200,
    cashPaid: 1200,
    dueAmount: 0,
    totalDue: 0,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-002a",
        type: "sale",
        createdAt: "2026-07-01T09:00:00.000Z",
        purchaseDate: "2026-07-01T09:00:00.000Z",
        invoiceNumber: "INV-1002",
        totalBill: 1200,
        cashPaid: 1200,
        dueAmount: 0,
        duePaymentDate: "2026-07-01T09:00:00.000Z",
        amountReceived: 1200,
        remainingDue: 0,
        paymentStatus: "Paid"
      }
    ]
  },
  {
    id: "CUST-003",
    name: "Fatima Begum",
    phone: "01933344556",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 8000,
    cashPaid: 3000,
    dueAmount: 5000,
    totalDue: 5000,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-003a",
        type: "sale",
        createdAt: "2026-06-08T11:00:00.000Z",
        purchaseDate: "2026-06-08T11:00:00.000Z",
        invoiceNumber: "INV-1003",
        totalBill: 8000,
        cashPaid: 3000,
        dueAmount: 5000,
        duePaymentDate: null,
        amountReceived: 3000,
        remainingDue: 5000,
        paymentStatus: "Partial Due"
      }
    ]
  },
  {
    id: "CUST-004",
    name: "Soshop Ali",
    phone: "01644455667",
    address: "Bogura",
    totalPurchaseAmount: 2500,
    cashPaid: 0,
    dueAmount: 2500,
    totalDue: 2500,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-004a",
        type: "sale",
        createdAt: "2026-07-10T15:00:00.000Z",
        purchaseDate: "2026-07-10T15:00:00.000Z",
        invoiceNumber: "INV-1004",
        totalBill: 2500,
        cashPaid: 0,
        dueAmount: 2500,
        duePaymentDate: null,
        amountReceived: 0,
        remainingDue: 2500,
        paymentStatus: "Full Due"
      }
    ]
  },
  {
    id: "CUST-005",
    name: "Nasrin Akter",
    phone: "01555566778",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 15000,
    cashPaid: 4000,
    dueAmount: 11000,
    totalDue: 11000,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-005a",
        type: "sale",
        createdAt: "2026-04-20T09:30:00.000Z",
        purchaseDate: "2026-04-20T09:30:00.000Z",
        invoiceNumber: "INV-1005",
        totalBill: 15000,
        cashPaid: 4000,
        dueAmount: 11000,
        duePaymentDate: null,
        amountReceived: 4000,
        remainingDue: 11000,
        paymentStatus: "Full Due"
      },
      {
        id: "hist-005b",
        type: "payment",
        createdAt: "2026-05-22T10:00:00.000Z",
        paymentDate: "2026-05-22T10:00:00.000Z",
        amountReceived: 4000,
        remainingDue: 11000,
        invoiceNumber: "INV-1005"
      }
    ]
  },
  {
    id: "CUST-006",
    name: "Jahangir Alam",
    phone: "01366677889",
    address: "Shajahanpur, Bogura",
    totalPurchaseAmount: 3200,
    cashPaid: 1200,
    dueAmount: 2000,
    totalDue: 2000,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-006a",
        type: "sale",
        createdAt: "2026-06-28T13:00:00.000Z",
        purchaseDate: "2026-06-28T13:00:00.000Z",
        invoiceNumber: "INV-1006",
        totalBill: 3200,
        cashPaid: 1200,
        dueAmount: 2000,
        duePaymentDate: null,
        amountReceived: 1200,
        remainingDue: 2000,
        paymentStatus: "Partial Due"
      }
    ]
  },
  {
    id: "CUST-007",
    name: "Salma Khatun",
    phone: "01477788990",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 0,
    cashPaid: 0,
    dueAmount: 0,
    totalDue: 0,
    dueEntries: [],
    paymentHistory: []
  },
  {
    id: "CUST-008",
    name: "Hafizur Rahman",
    phone: "01770001122",
    address: "Khalispur, Bogura",
    totalPurchaseAmount: 9600,
    cashPaid: 5600,
    dueAmount: 4000,
    totalDue: 4000,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-008a",
        type: "sale",
        createdAt: "2026-07-13T08:40:00.000Z",
        purchaseDate: "2026-07-13T08:40:00.000Z",
        invoiceNumber: "INV-1008",
        totalBill: 9600,
        cashPaid: 5600,
        dueAmount: 4000,
        duePaymentDate: null,
        amountReceived: 5600,
        remainingDue: 4000,
        paymentStatus: "Partial Due"
      }
    ]
  },
  {
    id: "CUST-009",
    name: "Morsheda Begum",
    phone: "01880002233",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 0,
    cashPaid: 0,
    dueAmount: 1200,
    totalDue: 1200,
    createdAt: "2026-07-01T09:00:00.000Z",
    dueEntries: [],
    paymentHistory: []
  },
  {
    id: "CUST-010",
    name: "Arif Hossain",
    phone: "01990001122",
    address: "Dupchanchia, Bogura",
    totalPurchaseAmount: 14500,
    cashPaid: 9500,
    dueAmount: 5000,
    totalDue: 5000,
    createdAt: "2026-06-18T14:30:00.000Z",
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-010a",
        type: "sale",
        createdAt: "2026-06-18T14:30:00.000Z",
        purchaseDate: "2026-06-18T14:30:00.000Z",
        invoiceNumber: "INV-1010",
        totalBill: 14500,
        cashPaid: 9500,
        dueAmount: 5000,
        duePaymentDate: null,
        amountReceived: 9500,
        remainingDue: 5000,
        paymentStatus: "Partial Due"
      }
    ]
  },
  {
    id: "CUST-011",
    name: "Lipi Akter",
    phone: "01733344556",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 2100,
    cashPaid: 2100,
    dueAmount: 0,
    totalDue: 0,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-011a",
        type: "sale",
        createdAt: "2026-07-15T17:20:00.000Z",
        purchaseDate: "2026-07-15T17:20:00.000Z",
        invoiceNumber: "INV-1011",
        totalBill: 2100,
        cashPaid: 2100,
        dueAmount: 0,
        duePaymentDate: "2026-07-15T17:20:00.000Z",
        amountReceived: 2100,
        remainingDue: 0,
        paymentStatus: "Paid"
      }
    ]
  }
];

export const initialTransactions = [
  {
    id: "TX-1001",
    timestamp: "2026-07-08T10:15:30Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-001", name: "Napa Extend", quantity: 10, price: 3.00, cost: 2.30 },
      { id: "MED-002", name: "Seclo 20", quantity: 14, price: 7.00, cost: 5.50 }
    ],
    subtotal: 128.00,
    discount: 5.00,
    tax: 6.15,
    total: 129.15,
    cashReceived: 150.00,
    changeGiven: 20.85
  },
  {
    id: "TX-1002",
    timestamp: "2026-07-08T14:22:10Z",
    salesperson: "Upazila (Admin)",
    items: [
      { id: "MED-006", name: "Alatrol 10", quantity: 30, price: 3.50, cost: 2.70 },
      { id: "MED-004", name: "Tusca Syrup", quantity: 1, price: 85.00, cost: 70.00 },
      { id: "MED-010", name: "Insulatard Penfill", quantity: 1, price: 420.00, cost: 370.00 }
    ],
    subtotal: 610.00,
    discount: 20.00,
    tax: 29.50,
    total: 619.50,
    cashReceived: 620.00,
    changeGiven: 0.50
  },
  {
    id: "TX-1003",
    timestamp: "2026-07-08T18:45:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-009", name: "Ceevit 250", quantity: 20, price: 2.50, cost: 1.80 }
    ],
    subtotal: 50.00,
    discount: 0.00,
    tax: 2.50,
    total: 52.50,
    cashReceived: 100.00,
    changeGiven: 47.50
  },
  {
    id: "TX-1004",
    timestamp: "2026-07-09T11:20:00Z",
    salesperson: "Upazila (Admin)",
    items: [
      { id: "MED-011", name: "Losectil 20", quantity: 12, price: 9.50, cost: 7.20 },
      { id: "MED-012", name: "Azi 500", quantity: 4, price: 28.00, cost: 21.00 }
    ],
    subtotal: 224.00,
    discount: 10.00,
    tax: 10.70,
    total: 224.70,
    cashReceived: 250.00,
    changeGiven: 25.30
  },
  {
    id: "TX-1005",
    timestamp: "2026-07-09T16:05:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-003", name: "Fexo 120", quantity: 5, price: 10.00, cost: 8.00 },
      { id: "MED-009", name: "Ceevit 250", quantity: 15, price: 2.50, cost: 1.80 }
    ],
    subtotal: 87.50,
    discount: 0.00,
    tax: 4.38,
    total: 91.88,
    cashReceived: 100.00,
    changeGiven: 8.12
  },
  {
    id: "TX-1006",
    timestamp: "2026-07-10T10:30:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-013", name: "Nexum 40", quantity: 8, price: 12.00, cost: 9.00 },
      { id: "MED-014", name: "Monas 10", quantity: 20, price: 6.50, cost: 5.10 }
    ],
    subtotal: 220.00,
    discount: 12.00,
    tax: 10.40,
    total: 218.40,
    cashReceived: 250.00,
    changeGiven: 31.60
  },
  {
    id: "TX-1007",
    timestamp: "2026-07-10T15:45:00Z",
    salesperson: "Upazila (Admin)",
    items: [
      { id: "MED-015", name: "Zerif 200", quantity: 3, price: 32.00, cost: 26.00 },
      { id: "MED-001", name: "Napa Extend", quantity: 18, price: 3.00, cost: 2.30 }
    ],
    subtotal: 150.00,
    discount: 0.00,
    tax: 7.50,
    total: 157.50,
    cashReceived: 200.00,
    changeGiven: 42.50
  }
];
