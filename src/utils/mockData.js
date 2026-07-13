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
    salesperson: "Upajela (Admin)",
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
  }
];
