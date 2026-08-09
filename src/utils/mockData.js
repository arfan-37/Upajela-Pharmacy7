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
    location: "North Rack 1",
    description: "For pain relief and fever",
    batches: [
      {
        id: "BATCH-MED-001",
        quantity: 12,
        expiryDate: "2027-08-15",
        purchaseCost: 2.30,
        sellingPrice: 3.00,
        location: "North Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "South Rack 2",
    description: "Proton pump inhibitor for acidity",
    batches: [
      {
        id: "BATCH-MED-002",
        quantity: 120,
        expiryDate: "2026-08-20",
        purchaseCost: 5.50,
        sellingPrice: 7.00,
        location: "South Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "North Rack 3",
    description: "Antihistamine for allergies",
    batches: [
      {
        id: "BATCH-MED-003",
        quantity: 8,
        expiryDate: "2027-01-10",
        purchaseCost: 8.00,
        sellingPrice: 10.00,
        location: "North Rack 3",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "East Rack 1",
    description: "Cough suppressant syrup",
    batches: [
      {
        id: "BATCH-MED-004",
        quantity: 25,
        expiryDate: "2026-08-10",
        purchaseCost: 70.00,
        sellingPrice: 85.00,
        location: "East Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "West Rack 1",
    description: "Broad-spectrum antibiotic",
    batches: [
      {
        id: "BATCH-MED-005",
        quantity: 5,
        expiryDate: "2028-03-30",
        purchaseCost: 6.80,
        sellingPrice: 8.50,
        location: "West Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "North Rack 2",
    description: "Antiallergic tablet",
    batches: [
      {
        id: "BATCH-MED-006",
        quantity: 200,
        expiryDate: "2027-12-05",
        purchaseCost: 2.70,
        sellingPrice: 3.50,
        location: "North Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "South Rack 1",
    description: "Anti-ulcerant for heartburn",
    batches: [
      {
        id: "BATCH-MED-007",
        quantity: 90,
        expiryDate: "2026-07-28",
        purchaseCost: 6.20,
        sellingPrice: 8.00,
        location: "South Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "West Rack 2",
    description: "Antiprotozoal and antibacterial",
    batches: [
      {
        id: "BATCH-MED-008",
        quantity: 45,
        expiryDate: "2027-05-18",
        purchaseCost: 3.50,
        sellingPrice: 4.50,
        location: "West Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "North Rack 1",
    description: "Chewable vitamin C supplement",
    batches: [
      {
        id: "BATCH-MED-009",
        quantity: 350,
        expiryDate: "2027-10-22",
        purchaseCost: 1.80,
        sellingPrice: 2.50,
        location: "North Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "North Rack 1",
    description: "Insulin suspension for diabetes management",
    batches: [
      {
        id: "BATCH-MED-010",
        quantity: 18,
        expiryDate: "2027-02-14",
        purchaseCost: 370.00,
        sellingPrice: 420.00,
        location: "North Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "South Rack 3",
    description: "Acid reflux and ulcer relief",
    batches: [
      {
        id: "BATCH-MED-011",
        quantity: 60,
        expiryDate: "2027-06-18",
        purchaseCost: 7.20,
        sellingPrice: 9.50,
        location: "South Rack 3",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "West Rack 3",
    description: "Antibiotic for bacterial infections",
    batches: [
      {
        id: "BATCH-MED-012",
        quantity: 22,
        expiryDate: "2026-12-30",
        purchaseCost: 21.00,
        sellingPrice: 28.00,
        location: "West Rack 3",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "South Rack 4",
    description: "Gastric acid reducer",
    batches: [
      {
        id: "BATCH-MED-013",
        quantity: 74,
        expiryDate: "2027-11-02",
        purchaseCost: 9.00,
        sellingPrice: 12.00,
        location: "South Rack 4",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
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
    location: "North Rack 4",
    description: "Anti-allergy and asthma support",
    batches: [
      {
        id: "BATCH-MED-014",
        quantity: 140,
        expiryDate: "2028-01-20",
        purchaseCost: 5.10,
        sellingPrice: 6.50,
        location: "North Rack 4",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-016",
    name: "Aceclo 200",
    genericName: "Aceclofenac",
    category: "Tablet",
    price: 5.00,
    cost: 3.80,
    stock: 55,
    expiryDate: "2026-05-20",
    location: "North Rack 5",
    description: "Pain relief and anti-inflammatory",
    batches: [
      {
        id: "BATCH-MED-016",
        quantity: 55,
        expiryDate: "2026-05-20",
        purchaseCost: 3.80,
        sellingPrice: 5.00,
        location: "North Rack 5",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-017",
    name: "Rivotril 0.5",
    genericName: "Clonazepam",
    category: "Tablet",
    price: 15.00,
    cost: 11.50,
    stock: 20,
    expiryDate: "2026-06-30",
    location: "South Rack 1",
    description: "Anticonvulsant and anxiolytic",
    batches: [
      {
        id: "BATCH-MED-017",
        quantity: 20,
        expiryDate: "2026-06-30",
        purchaseCost: 11.50,
        sellingPrice: 15.00,
        location: "South Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-018",
    name: "Nitromak 5",
    genericName: "Glyceryl Trinitrate",
    category: "Tablet",
    price: 18.00,
    cost: 14.00,
    stock: 0,
    expiryDate: "2026-07-18",
    location: "South Rack 2",
    description: "Anti-anginal tablet - EXPIRED",
    batches: [
      {
        id: "BATCH-MED-018",
        quantity: 0,
        expiryDate: "2026-07-18",
        purchaseCost: 14.00,
        sellingPrice: 18.00,
        location: "South Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-019",
    name: "Ciprocin 500",
    genericName: "Ciprofloxacin",
    category: "Tablet",
    price: 22.00,
    cost: 17.50,
    stock: 40,
    expiryDate: "2026-05-15",
    location: "West Rack 5",
    description: "Antibiotic for infections",
    batches: [
      {
        id: "BATCH-MED-019",
        quantity: 40,
        expiryDate: "2026-05-15",
        purchaseCost: 17.50,
        sellingPrice: 22.00,
        location: "West Rack 5",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-020",
    name: "Clopilet 75",
    genericName: "Clopidogrel Bisulfate",
    category: "Tablet",
    price: 35.00,
    cost: 28.00,
    stock: 30,
    expiryDate: "2026-04-20",
    location: "East Rack 1",
    description: "Antiplatelet for heart patients",
    batches: [
      {
        id: "BATCH-MED-020",
        quantity: 30,
        expiryDate: "2026-04-20",
        purchaseCost: 28.00,
        sellingPrice: 35.00,
        location: "East Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-021",
    name: "Pantec D",
    genericName: "Pantoprazole + Domperidone",
    category: "Capsule",
    price: 12.00,
    cost: 9.50,
    stock: 65,
    expiryDate: "2026-08-01",
    location: "South Rack 5",
    description: "Acidity and gastric relief",
    batches: [
      {
        id: "BATCH-MED-021",
        quantity: 65,
        expiryDate: "2026-08-01",
        purchaseCost: 9.50,
        sellingPrice: 12.00,
        location: "South Rack 5",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-022",
    name: "Rifadin 600",
    genericName: "Rifampicin",
    category: "Tablet",
    price: 45.00,
    cost: 36.00,
    stock: 18,
    expiryDate: "2026-07-25",
    location: "West Rack 1",
    description: "Anti-TB antibiotic - expiring very soon",
    batches: [
      {
        id: "BATCH-MED-022",
        quantity: 18,
        expiryDate: "2026-07-25",
        purchaseCost: 36.00,
        sellingPrice: 45.00,
        location: "West Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-023",
    name: "Etorikox 90",
    genericName: "Etoricoxib",
    category: "Tablet",
    price: 20.00,
    cost: 15.50,
    stock: 48,
    expiryDate: "2026-09-15",
    location: "North Rack 6",
    description: "Pain relief for arthritis",
    batches: [
      {
        id: "BATCH-MED-023",
        quantity: 48,
        expiryDate: "2026-09-15",
        purchaseCost: 15.50,
        sellingPrice: 20.00,
        location: "North Rack 6",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-024",
    name: "Met XL 25",
    genericName: "Metoprolol Succinate",
    category: "Tablet",
    price: 16.00,
    cost: 12.50,
    stock: 35,
    expiryDate: "2026-10-01",
    location: "East Rack 2",
    description: "Beta-blocker for blood pressure",
    batches: [
      {
        id: "BATCH-MED-024",
        quantity: 35,
        expiryDate: "2026-10-01",
        purchaseCost: 12.50,
        sellingPrice: 16.00,
        location: "East Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-025",
    name: "Brufen 400",
    genericName: "Ibuprofen",
    category: "Tablet",
    price: 8.00,
    cost: 6.20,
    stock: 90,
    expiryDate: "2026-08-10",
    location: "North Rack 7",
    description: "Pain reliever and fever reducer",
    batches: [
      {
        id: "BATCH-MED-025",
        quantity: 90,
        expiryDate: "2026-08-10",
        purchaseCost: 6.20,
        sellingPrice: 8.00,
        location: "North Rack 7",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-026",
    name: "Septran DS",
    genericName: "Trimethoprim + Sulfamethoxazole",
    category: "Tablet",
    price: 25.00,
    cost: 19.50,
    stock: 60,
    expiryDate: "2027-03-15",
    location: "West Rack 6",
    description: "Broad-spectrum antibiotic",
    batches: [
      {
        id: "BATCH-MED-026",
        quantity: 60,
        expiryDate: "2027-03-15",
        purchaseCost: 19.50,
        sellingPrice: 25.00,
        location: "West Rack 6",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-027",
    name: "Bromhexine 8",
    genericName: "Bromhexine Hydrochloride",
    category: "Tablet",
    price: 6.00,
    cost: 4.50,
    stock: 120,
    expiryDate: "2027-06-20",
    location: "North Rack 2",
    description: "Expectorant for cough",
    batches: [
      {
        id: "BATCH-MED-027",
        quantity: 120,
        expiryDate: "2027-06-20",
        purchaseCost: 4.50,
        sellingPrice: 6.00,
        location: "North Rack 2",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-028",
    name: "Norflox TZ",
    genericName: "Norfloxacin + Tinidazole",
    category: "Tablet",
    price: 30.00,
    cost: 23.00,
    stock: 45,
    expiryDate: "2027-04-10",
    location: "West Rack 7",
    description: "Antibiotic and antiprotozoal",
    batches: [
      {
        id: "BATCH-MED-028",
        quantity: 45,
        expiryDate: "2027-04-10",
        purchaseCost: 23.00,
        sellingPrice: 30.00,
        location: "West Rack 7",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-029",
    name: "Telmisafe 40",
    genericName: "Telmisartan",
    category: "Tablet",
    price: 28.00,
    cost: 21.00,
    stock: 75,
    expiryDate: "2027-07-01",
    location: "East Rack 3",
    description: "Angiotensin receptor blocker for BP",
    batches: [
      {
        id: "BATCH-MED-029",
        quantity: 75,
        expiryDate: "2027-07-01",
        purchaseCost: 21.00,
        sellingPrice: 28.00,
        location: "East Rack 3",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  },
  {
    id: "MED-031",
    name: "Test Expire 20",
    genericName: "Paracetamol",
    category: "Tablet",
    price: 10.00,
    cost: 7.50,
    stock: 50,
    expiryDate: "2026-07-19",
    location: "North Rack 1",
    description: "Dummy medicine for auto-expiry testing",
    batches: [
      {
        id: "BATCH-MED-031",
        quantity: 50,
        expiryDate: "2026-07-19",
        purchaseCost: 7.50,
        sellingPrice: 10.00,
        location: "North Rack 1",
        stockInDate: "2026-07-01T10:00:00.000Z",
        notes: "Initial stock"
      },
    ],
    animalType: 'Other',
  }

];

export const initialCompanies = [,
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
    id: "COMP-010",
    name: "Innova Pharma",
    contact: "01812004567",
    address: "Chittagong",
    totalPurchaseAmount: 15800,
    amountPaid: 8000,
    dueAmount: 7800,
    transactionHistory: [
      {
        id: "CTX-10010",
        type: "purchase",
        createdAt: "2026-06-28T10:00:00.000Z",
        date: "2026-06-28T10:00:00.000Z",
        products: [
          { name: "Aceclo 200", quantity: 200 },
          { name: "Bromhexine 8", quantity: 300 }
        ],
        totalAmount: 15800,
        amountPaid: 8000,
        dueAmount: 7800,
        dueDate: "2026-07-28",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-011",
    name: "Bengal Chemicals",
    contact: "01733007890",
    address: "Narayanganj",
    totalPurchaseAmount: 6400,
    amountPaid: 6400,
    dueAmount: 0,
    transactionHistory: [
      {
        id: "CTX-10011",
        type: "purchase",
        createdAt: "2026-07-10T09:00:00.000Z",
        date: "2026-07-10T09:00:00.000Z",
        products: [
          { name: "Rivotril 0.5", quantity: 100 },
          { name: "Nitromak 5", quantity: 50 }
        ],
        totalAmount: 6400,
        amountPaid: 6400,
        dueAmount: 0,
        dueDate: "2026-08-10",
        paymentDate: "2026-07-10"
      }
    ]
  },
  {
    id: "COMP-012",
    name: "Popular Pharmaceuticals",
    contact: "01944008901",
    address: "Savar, Dhaka",
    totalPurchaseAmount: 28500,
    amountPaid: 12000,
    dueAmount: 16500,
    transactionHistory: [
      {
        id: "CTX-10012",
        type: "purchase",
        createdAt: "2026-07-05T11:00:00.000Z",
        date: "2026-07-05T11:00:00.000Z",
        products: [
          { name: "Ciprocin 500", quantity: 150 },
          { name: "Clopilet 75", quantity: 100 },
          { name: "Telmisafe 40", quantity: 200 }
        ],
        totalAmount: 28500,
        amountPaid: 12000,
        dueAmount: 16500,
        dueDate: "2026-08-05",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-013",
    name: "Pharma 2000",
    contact: "01655009012",
    address: "Gazipur",
    totalPurchaseAmount: 9500,
    amountPaid: 5000,
    dueAmount: 4500,
    transactionHistory: [
      {
        id: "CTX-10013",
        type: "purchase",
        createdAt: "2026-07-14T10:00:00.000Z",
        date: "2026-07-14T10:00:00.000Z",
        products: [
          { name: "Etorikox 90", quantity: 120 },
          { name: "Met XL 25", quantity: 80 }
        ],
        totalAmount: 9500,
        amountPaid: 5000,
        dueAmount: 4500,
        dueDate: "2026-08-14",
        paymentDate: null
      }
    ]
  },
  {
    id: "COMP-014",
    name: "Abu Pharmaceuticals",
    contact: "01566000123",
    address: "Manikganj",
    totalPurchaseAmount: 11200,
    amountPaid: 11200,
    dueAmount: 0,
    transactionHistory: [
      {
        id: "CTX-10014",
        type: "purchase",
        createdAt: "2026-07-16T08:30:00.000Z",
        date: "2026-07-16T08:30:00.000Z",
        products: [
          { name: "Brufen 400", quantity: 250 },
          { name: "Glucored Forte", quantity: 100 }
        ],
        totalAmount: 11200,
        amountPaid: 11200,
        dueAmount: 0,
        dueDate: "2026-08-16",
        paymentDate: "2026-07-16"
      }
    ]
  }
];

export const initialCustomers = [,
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
    id: "CUST-012",
    name: "Rafiqul Islam",
    phone: "01677001123",
    address: "Bogura",
    totalPurchaseAmount: 3500,
    cashPaid: 2000,
    dueAmount: 1500,
    totalDue: 1500,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-012a",
        type: "sale",
        createdAt: "2026-07-05T10:00:00.000Z",
        purchaseDate: "2026-07-05T10:00:00.000Z",
        invoiceNumber: "INV-1012",
        totalBill: 3500,
        cashPaid: 2000,
        dueAmount: 1500,
        duePaymentDate: null,
        amountReceived: 2000,
        remainingDue: 1500,
        paymentStatus: "Partial Due"
      }
    ]
  },
  {
    id: "CUST-013",
    name: "Nazma Sultana",
    phone: "01788002234",
    address: "Sherpur, Bogura",
    totalPurchaseAmount: 7200,
    cashPaid: 7200,
    dueAmount: 0,
    totalDue: 0,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-013a",
        type: "sale",
        createdAt: "2026-07-08T14:00:00.000Z",
        purchaseDate: "2026-07-08T14:00:00.000Z",
        invoiceNumber: "INV-1013",
        totalBill: 7200,
        cashPaid: 7200,
        dueAmount: 0,
        duePaymentDate: "2026-07-08T14:00:00.000Z",
        amountReceived: 7200,
        remainingDue: 0,
        paymentStatus: "Paid"
      }
    ]
  },
  {
    id: "CUST-014",
    name: "Mahmudul Hasan",
    phone: "01899003345",
    address: "Shibganj, Bogura",
    totalPurchaseAmount: 4800,
    cashPaid: 0,
    dueAmount: 4800,
    totalDue: 4800,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-014a",
        type: "sale",
        createdAt: "2026-07-12T09:00:00.000Z",
        purchaseDate: "2026-07-12T09:00:00.000Z",
        invoiceNumber: "INV-1014",
        totalBill: 4800,
        cashPaid: 0,
        dueAmount: 4800,
        duePaymentDate: null,
        amountReceived: 0,
        remainingDue: 4800,
        paymentStatus: "Full Due"
      }
    ]
  },
  {
    id: "CUST-015",
    name: "Rahima Khatun",
    phone: "01910004456",
    address: "Sherpur",
    totalPurchaseAmount: 15600,
    cashPaid: 6000,
    dueAmount: 9600,
    totalDue: 9600,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-015a",
        type: "sale",
        createdAt: "2026-06-15T11:00:00.000Z",
        purchaseDate: "2026-06-15T11:00:00.000Z",
        invoiceNumber: "INV-1015",
        totalBill: 15600,
        cashPaid: 6000,
        dueAmount: 9600,
        duePaymentDate: null,
        amountReceived: 6000,
        remainingDue: 9600,
        paymentStatus: "Partial Due"
      },
      {
        id: "hist-015b",
        type: "payment",
        createdAt: "2026-07-01T10:00:00.000Z",
        paymentDate: "2026-07-01T10:00:00.000Z",
        amountReceived: 2000,
        remainingDue: 9600,
        invoiceNumber: "INV-1015"
      },
      {
        id: "hist-015c",
        type: "payment",
        createdAt: "2026-07-10T16:00:00.000Z",
        paymentDate: "2026-07-10T16:00:00.000Z",
        amountReceived: 1000,
        remainingDue: 6600,
        invoiceNumber: "INV-1015"
      }
    ]
  },
  {
    id: "CUST-016",
    name: "Jahangir Alam",
    phone: "01322005567",
    address: "Dupchanchia, Bogura",
    totalPurchaseAmount: 2200,
    cashPaid: 0,
    dueAmount: 2200,
    totalDue: 2200,
    dueEntries: [],
    paymentHistory: [
      {
        id: "hist-016a",
        type: "sale",
        createdAt: "2026-07-15T08:00:00.000Z",
        purchaseDate: "2026-07-15T08:00:00.000Z",
        invoiceNumber: "INV-1016",
        totalBill: 2200,
        cashPaid: 0,
        dueAmount: 2200,
        duePaymentDate: null,
        amountReceived: 0,
        remainingDue: 2200,
        paymentStatus: "Full Due"
      }
    ]
  }
];

export const initialTransactions = [,
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
    changeGiven: 20.85,
    animalType: 'Other',
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
    changeGiven: 0.50,
    animalType: 'Other',
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
    changeGiven: 47.50,
    animalType: 'Other',
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
    changeGiven: 25.30,
    animalType: 'Other',
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
    changeGiven: 8.12,
    animalType: 'Other',
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
    changeGiven: 31.60,
    animalType: 'Other',
  },
  {
    id: "TX-1008",
    timestamp: "2026-07-11T10:45:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-016", name: "Aceclo 200", quantity: 15, price: 5.00, cost: 3.80 },
      { id: "MED-020", name: "Clopilet 75", quantity: 10, price: 35.00, cost: 28.00 }
    ],
    subtotal: 650.00,
    discount: 20.00,
    tax: 31.50,
    total: 661.50,
    cashReceived: 700.00,
    changeGiven: 38.50,
    animalType: 'Other',
  },
  {
    id: "TX-1009",
    timestamp: "2026-07-12T11:30:00Z",
    salesperson: "Upazila (Admin)",
    items: [
      { id: "MED-021", name: "Pantec D", quantity: 20, price: 12.00, cost: 9.50 },
      { id: "MED-025", name: "Brufen 400", quantity: 30, price: 8.00, cost: 6.20 }
    ],
    subtotal: 480.00,
    discount: 10.00,
    tax: 23.50,
    total: 493.50,
    cashReceived: 500.00,
    changeGiven: 6.50,
    animalType: 'Other',
  },
  {
    id: "TX-1010",
    timestamp: "2026-07-13T16:15:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-026", name: "Septran DS", quantity: 25, price: 25.00, cost: 19.50 },
      { id: "MED-027", name: "Bromhexine 8", quantity: 40, price: 6.00, cost: 4.50 }
    ],
    subtotal: 850.00,
    discount: 0.00,
    tax: 42.50,
    total: 892.50,
    cashReceived: 900.00,
    changeGiven: 7.50,
    animalType: 'Other',
  },
  {
    id: "TX-1011",
    timestamp: "2026-07-14T09:20:00Z",
    salesperson: "Upazila (Admin)",
    items: [
      { id: "MED-029", name: "Telmisafe 40", quantity: 15, price: 28.00, cost: 21.00 },
      { id: "MED-030", name: "Glucored Forte", quantity: 10, price: 18.00, cost: 14.00 }
    ],
    subtotal: 600.00,
    discount: 15.00,
    tax: 29.25,
    total: 614.25,
    cashReceived: 620.00,
    changeGiven: 5.75,
    animalType: 'Other',
  },
  {
    id: "TX-1012",
    timestamp: "2026-07-15T13:45:00Z",
    salesperson: "Assistant",
    items: [
      { id: "MED-022", name: "Rifadin 600", quantity: 5, price: 45.00, cost: 36.00 },
      { id: "MED-023", name: "Etorikox 90", quantity: 8, price: 20.00, cost: 15.50 },
      { id: "MED-024", name: "Met XL 25", quantity: 12, price: 16.00, cost: 12.50 }
    ],
    subtotal: 532.00,
    discount: 5.00,
    tax: 26.35,
    total: 553.35,
    cashReceived: 560.00,
    changeGiven: 6.65,
    animalType: 'Other',
  },
];

export const initialFinancialReports = [
  {
    id: "RPT-2026-07-27-1001",
    reportDate: "2026-07-27",
    createdAt: "2026-07-27T00:00:00.000Z",
    lastUpdatedAt: "2026-07-27T18:30:00.000Z",
    totalSalesAmount: 2450.00,
    totalPurchaseCost: 1420.00,
    grossProfit: 1030.00,
    netProfit: 1030.00,
    totalCashReceived: 1850.00,
    totalDueCollected: 300.00,
    totalCustomerDueCreated: 450.00,
    totalAmountPaidToCompanies: 1200.00,
    totalCompanyPayable: 800.00,
    totalTransactions: 18,
    salesTransactions: [
      { id: "TX-2001", timestamp: "2026-07-27T10:15:00Z", salesperson: "Assistant", total: 320.00, cashReceived: 320.00, items: [{name:"Napa Extend", quantity:20, price:3.00}] },
      { id: "TX-2002", timestamp: "2026-07-27T11:30:00Z", salesperson: "Upazila (Admin)", total: 580.00, cashReceived: 500.00, items: [{name:"Seclo 20", quantity:30, price:7.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-001", companyName: "Incepta Pharmaceuticals", totalAmount: 1200.00, amountPaid: 1200.00, dueAmount: 0, date: "2026-07-27T09:00:00Z", products: [{name:"Napa Extend", quantity:100}] }
    ],
    customerPayments: [
      { customerId: "CUST-001", customerName: "Abdul Karim", amount: 300.00, date: "2026-07-27T14:20:00Z", remainingDue: 1200.00, invoiceNumber: "INV-2001" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-26-1002",
    reportDate: "2026-07-26",
    createdAt: "2026-07-26T00:00:00.000Z",
    lastUpdatedAt: "2026-07-26T19:45:00.000Z",
    totalSalesAmount: 1890.00,
    totalPurchaseCost: 1120.00,
    grossProfit: 770.00,
    netProfit: 770.00,
    totalCashReceived: 1500.00,
    totalDueCollected: 200.00,
    totalCustomerDueCreated: 320.00,
    totalAmountPaidToCompanies: 800.00,
    totalCompanyPayable: 650.00,
    totalTransactions: 14,
    salesTransactions: [
      { id: "TX-1991", timestamp: "2026-07-26T09:20:00Z", salesperson: "Assistant", total: 450.00, cashReceived: 450.00, items: [{name:"Fexo 120", quantity:25, price:7.00}] },
      { id: "TX-1992", timestamp: "2026-07-26T15:10:00Z", salesperson: "Upazila (Admin)", total: 680.00, cashReceived: 600.00, items: [{name:"Napa Extend", quantity:40, price:3.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-002", companyName: "Square Pharmaceuticals", totalAmount: 800.00, amountPaid: 800.00, dueAmount: 0, date: "2026-07-26T10:30:00Z", products: [{name:"Seclo 20", quantity:60}] }
    ],
    customerPayments: [
      { customerId: "CUST-002", customerName: "Rahima Begum", amount: 200.00, date: "2026-07-26T16:45:00Z", remainingDue: 800.00, invoiceNumber: "INV-1991" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-25-1003",
    reportDate: "2026-07-25",
    createdAt: "2026-07-25T00:00:00.000Z",
    lastUpdatedAt: "2026-07-25T20:00:00.000Z",
    totalSalesAmount: 2100.00,
    totalPurchaseCost: 1350.00,
    grossProfit: 750.00,
    netProfit: 750.00,
    totalCashReceived: 1700.00,
    totalDueCollected: 250.00,
    totalCustomerDueCreated: 380.00,
    totalAmountPaidToCompanies: 950.00,
    totalCompanyPayable: 720.00,
    totalTransactions: 16,
    salesTransactions: [
      { id: "TX-1981", timestamp: "2026-07-25T10:00:00Z", salesperson: "Upazila (Admin)", total: 520.00, cashReceived: 520.00, items: [{name:"Ace 500", quantity:30, price:5.00}] },
      { id: "TX-1982", timestamp: "2026-07-25T14:25:00Z", salesperson: "Assistant", total: 390.00, cashReceived: 350.00, items: [{name:"Fexo 120", quantity:20, price:7.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-003", companyName: "Beximco Pharmaceuticals", totalAmount: 950.00, amountPaid: 600.00, dueAmount: 350.00, date: "2026-07-25T11:00:00Z", products: [{name:"Ace 500", quantity:80}, {name:"Fexo 120", quantity:40}] }
    ],
    customerPayments: [
      { customerId: "CUST-003", customerName: "Mohammad Ali", amount: 250.00, date: "2026-07-25T17:30:00Z", remainingDue: 1500.00, invoiceNumber: "INV-1981" }
    ],
    companyPayments: [
      { companyId: "COMP-003", companyName: "Beximco Pharmaceuticals", amount: 350.00, date: "2026-07-25T16:00:00Z", remainingDue: 0 }
    ],
    isClosed: false
  },
  {
    id: "RPT-2026-07-24-1004",
    reportDate: "2026-07-24",
    createdAt: "2026-07-24T00:00:00.000Z",
    lastUpdatedAt: "2026-07-24T21:15:00.000Z",
    totalSalesAmount: 1750.00,
    totalPurchaseCost: 980.00,
    grossProfit: 770.00,
    netProfit: 770.00,
    totalCashReceived: 1400.00,
    totalDueCollected: 180.00,
    totalCustomerDueCreated: 280.00,
    totalAmountPaidToCompanies: 600.00,
    totalCompanyPayable: 450.00,
    totalTransactions: 12,
    salesTransactions: [
      { id: "TX-1971", timestamp: "2026-07-24T09:45:00Z", salesperson: "Assistant", total: 410.00, cashReceived: 410.00, items: [{name:"Napa Extend", quantity:50, price:3.00}] },
      { id: "TX-1972", timestamp: "2026-07-24T16:20:00Z", salesperson: "Upazila (Admin)", total: 620.00, cashReceived: 550.00, items: [{name:"Seclo 20", quantity:40, price:7.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-004", companyName: "Renata Limited", totalAmount: 600.00, amountPaid: 600.00, dueAmount: 0, date: "2026-07-24T10:00:00Z", products: [{name:"Napa Extend", quantity:120}] }
    ],
    customerPayments: [
      { customerId: "CUST-004", customerName: "Fatima Akter", amount: 180.00, date: "2026-07-24T18:00:00Z", remainingDue: 900.00, invoiceNumber: "INV-1971" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-23-1005",
    reportDate: "2026-07-23",
    createdAt: "2026-07-23T00:00:00.000Z",
    lastUpdatedAt: "2026-07-23T19:30:00.000Z",
    totalSalesAmount: 1980.00,
    totalPurchaseCost: 1150.00,
    grossProfit: 830.00,
    netProfit: 830.00,
    totalCashReceived: 1600.00,
    totalDueCollected: 220.00,
    totalCustomerDueCreated: 340.00,
    totalAmountPaidToCompanies: 700.00,
    totalCompanyPayable: 580.00,
    totalTransactions: 15,
    salesTransactions: [
      { id: "TX-1961", timestamp: "2026-07-23T11:00:00Z", salesperson: "Upazila (Admin)", total: 480.00, cashReceived: 480.00, items: [{name:"Ace 500", quantity:40, price:5.00}] },
      { id: "TX-1962", timestamp: "2026-07-23T15:45:00Z", salesperson: "Assistant", total: 350.00, cashReceived: 300.00, items: [{name:"Fexo 120", quantity:25, price:7.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-001", companyName: "Incepta Pharmaceuticals", totalAmount: 700.00, amountPaid: 700.00, dueAmount: 0, date: "2026-07-23T09:30:00Z", products: [{name:"Seclo 20", quantity:50}] }
    ],
    customerPayments: [
      { customerId: "CUST-005", customerName: "Nasir Uddin", amount: 220.00, date: "2026-07-23T17:15:00Z", remainingDue: 1100.00, invoiceNumber: "INV-1961" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-22-1006",
    reportDate: "2026-07-22",
    createdAt: "2026-07-22T00:00:00.000Z",
    lastUpdatedAt: "2026-07-22T20:45:00.000Z",
    totalSalesAmount: 1650.00,
    totalPurchaseCost: 950.00,
    grossProfit: 700.00,
    netProfit: 700.00,
    totalCashReceived: 1300.00,
    totalDueCollected: 150.00,
    totalCustomerDueCreated: 260.00,
    totalAmountPaidToCompanies: 500.00,
    totalCompanyPayable: 400.00,
    totalTransactions: 11,
    salesTransactions: [
      { id: "TX-1951", timestamp: "2026-07-22T10:30:00Z", salesperson: "Assistant", total: 380.00, cashReceived: 380.00, items: [{name:"Napa Extend", quantity:45, price:3.00}] },
      { id: "TX-1952", timestamp: "2026-07-22T16:00:00Z", salesperson: "Upazila (Admin)", total: 520.00, cashReceived: 480.00, items: [{name:"Ace 500", quantity:35, price:5.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-002", companyName: "Square Pharmaceuticals", totalAmount: 500.00, amountPaid: 500.00, dueAmount: 0, date: "2026-07-22T11:00:00Z", products: [{name:"Napa Extend", quantity:100}] }
    ],
    customerPayments: [
      { customerId: "CUST-006", customerName: "Salma Khatun", amount: 150.00, date: "2026-07-22T18:30:00Z", remainingDue: 750.00, invoiceNumber: "INV-1951" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-21-1007",
    reportDate: "2026-07-21",
    createdAt: "2026-07-21T00:00:00.000Z",
    lastUpdatedAt: "2026-07-21T21:00:00.000Z",
    totalSalesAmount: 1820.00,
    totalPurchaseCost: 1080.00,
    grossProfit: 740.00,
    netProfit: 740.00,
    totalCashReceived: 1450.00,
    totalDueCollected: 190.00,
    totalCustomerDueCreated: 300.00,
    totalAmountPaidToCompanies: 650.00,
    totalCompanyPayable: 520.00,
    totalTransactions: 13,
    salesTransactions: [
      { id: "TX-1941", timestamp: "2026-07-21T09:15:00Z", salesperson: "Upazila (Admin)", total: 440.00, cashReceived: 440.00, items: [{name:"Seclo 20", quantity:25, price:7.00}] },
      { id: "TX-1942", timestamp: "2026-07-21T14:50:00Z", salesperson: "Assistant", total: 370.00, cashReceived: 330.00, items: [{name:"Fexo 120", quantity:30, price:7.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-003", companyName: "Beximco Pharmaceuticals", totalAmount: 650.00, amountPaid: 650.00, dueAmount: 0, date: "2026-07-21T10:00:00Z", products: [{name:"Ace 500", quantity:60}] }
    ],
    customerPayments: [
      { customerId: "CUST-007", customerName: "Rafiqul Islam", amount: 190.00, date: "2026-07-21T19:00:00Z", remainingDue: 1300.00, invoiceNumber: "INV-1941" }
    ],
    companyPayments: [],
    isClosed: false
  },
  {
    id: "RPT-2026-07-20-1008",
    reportDate: "2026-07-20",
    createdAt: "2026-07-20T00:00:00.000Z",
    lastUpdatedAt: "2026-07-20T20:30:00.000Z",
    totalSalesAmount: 1560.00,
    totalPurchaseCost: 880.00,
    grossProfit: 680.00,
    netProfit: 680.00,
    totalCashReceived: 1250.00,
    totalDueCollected: 140.00,
    totalCustomerDueCreated: 220.00,
    totalAmountPaidToCompanies: 450.00,
    totalCompanyPayable: 380.00,
    totalTransactions: 10,
    salesTransactions: [
      { id: "TX-1931", timestamp: "2026-07-20T11:00:00Z", salesperson: "Assistant", total: 360.00, cashReceived: 360.00, items: [{name:"Napa Extend", quantity:40, price:3.00}] },
      { id: "TX-1932", timestamp: "2026-07-20T15:30:00Z", salesperson: "Upazila (Admin)", total: 410.00, cashReceived: 380.00, items: [{name:"Ace 500", quantity:28, price:5.00}] }
    ],
    companyPurchases: [
      { companyId: "COMP-001", companyName: "Incepta Pharmaceuticals", totalAmount: 450.00, amountPaid: 450.00, dueAmount: 0, date: "2026-07-20T09:00:00Z", products: [{name:"Seclo 20", quantity:40}] }
    ],
    customerPayments: [
      { customerId: "CUST-008", customerName: "Jahangir Alam", amount: 140.00, date: "2026-07-20T17:45:00Z", remainingDue: 980.00, invoiceNumber: "INV-1931" }
    ],
    companyPayments: [],
    isClosed: false
  }
];