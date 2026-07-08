# Shabab er Dokan - Pharmacy Management System

A premium, modern, and high-fidelity Pharmacy Management & POS System built for **Shabab er Dokan**. This application runs entirely in the browser as a fast Single Page Application (SPA) and uses `localStorage` for complete offline capability and data persistence.

## Features

1. **Role-Based Access Control (RBAC):**
   * **Admin Mode (Shabab):** Full visibility into financial metrics (Revenue, Costs, and Net Profits), interactive SVG charts displaying sales performance, and access to add/modify/delete medicine inventory items.
   * **Staff Mode (Assistant):** Hidden financial numbers, disabled access to reports, and read-only inventory lookup. Staff can operate the POS station to enter sales information.
2. **Point of Sale (POS) Billing:**
   * Rapid search by Brand name, Generic name (chemical compound), or Category.
   * Restrict additions to cart based on actual stock limits.
   * Interactive subtotaling, custom discounts, VAT (5%) calculation, cash input, and change due tracking.
3. **Thermal Receipt Printing:**
   * Overlay invoice mockup with printable CSS formatting (`@media print`) optimized for standard 80mm POS thermal receipt printers.
4. **Alerts System:**
   * Low Stock alerts (whenever items drop below 15 units).
   * Expiry date warning list showing expired batches or those expiring within 3 months.
5. **Initial Seeding:**
   * Pre-populated with standard local medicines (e.g. Napa Extend, Seclo 20, Fexo 120, Sergel 20) for instant demonstration.

## Technologies Used

* **Vite + React** (Frontend Library & Build Tool)
* **Vanilla CSS** (Component modular styling and design system tokens)
* **HTML5 Canvas / inline SVG** (For custom analytics graphs)
* **LocalStorage API** (Persistent state storage)

## Getting Started

Follow these steps to run the application locally on your machine:

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (recommended LTS version).

### Installation

1. Clone this repository (or copy the files):
   ```bash
   git clone https://github.com/SaifHassanEmon/Pharmacy-management-System.git
   cd "Shabab er Dokan"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

## Production Build

To bundle the application for production:
```bash
npm run build
```
The output files will be written to the `dist/` directory, which can be hosted on static platforms like Netlify, Vercel, or GitHub Pages.

---
*Created with ❤️ for Shabab er Dokan.*
