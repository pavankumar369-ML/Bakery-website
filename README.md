```markdown
# Crust & Crumb — Artisan Bakery & Café E-Commerce Platform

A modern, full-stack e-commerce web application built for an artisanal bakery and café. Featuring a warm, pastry-inspired UI, responsive product catalog, persistent shopping basket, streamlined checkout modal, and a real-time order tracking lifecycle.

![Tech Stack](https://img.shields.io/badge/Tech%20Stack-Flask%20%7C%20SQLite%20%7C%20Vanilla%20JS-d4a373?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Key Features

* **Dynamic Product Catalog:** Filter artisanal goods by categories (*Breads*, *Pastries*, *Cakes*) fetched live from the backend database.
* **Interactive Shopping Basket:** Slide-in drawer with real-time quantity adjustments, price calculations, and persistent state using `localStorage`.
* **Polished Checkout Flow:** Clean, centered checkout modal collecting delivery details and simulated payment info.
* **Order Lifecycle Tracking:** Real-time milestone tracker visualising order progress (`Order Received` ➔ `Baking / Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
* **Vibrant UI/UX:** Custom warm cream and terracotta color palette, glassmorphism toast notifications, and smooth CSS transitions.

---

## 📂 Architecture & Folder Structure

```text
bakery-website/
│
├── backend/
│   ├── app.py                # Flask application factory, CORS, and DB seeding
│   ├── models.py             # SQLAlchemy models (User, Product, Order, OrderItem)
│   └── routes/
│       ├── products.py       # Catalog and filtering endpoints (/api/products)
│       └── orders.py         # Checkout and order tracking endpoints
│
├── frontend/
│   ├── css/
│   │   └── main.css          # Custom warm palette, cards, and modal styles
│   ├── js/
│   │   └── app.js            # API integration, cart drawing, and order tracker
│   └── index.html            # Main SPA shell (navbar, catalog, cart, checkout)
│
├── instance/
│   └── bakery.db             # SQLite database
│
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox, custom CSS variables, glassmorphism), Vanilla JavaScript (Modular state management, Fetch API).
* **Backend:** Python, Flask, Flask-SQLAlchemy (ORM), Flask-CORS.
* **Database:** SQLite.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.8+ installed on your system.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/bakery-website.git
   cd bakery-website
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask Backend:**
   ```bash
   cd backend
   python app.py
   ```
   *The backend server will run at `http://localhost:5000` and automatically seed initial catalog items into `bakery.db`.*

4. **Launch the Frontend:**
   * Open `frontend/index.html` directly in your web browser, or serve it using a local development server (such as the VS Code *Live Server* extension).

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
```