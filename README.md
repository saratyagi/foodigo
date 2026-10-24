# 🍔 Foodigo

A full-stack food ordering and discovery platform — similar to Zomato — where users can browse restaurants, search for food, add items to cart, place orders, and track delivery in real time.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Test Harness](#test-harness)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## About

Foodigo is a food discovery and delivery application that connects users with local restaurants. Users can browse menus, search by cuisine or dish, manage their cart, place orders, and track their delivery — all from a clean, fast interface.

---

## ✨ Features

- 🔐 User authentication — register, login, logout
- 🔍 Restaurant and dish search with filters (cuisine, price, rating)
- 🍽️ Browse restaurant menus
- 🛒 Add, update, and remove items from cart
- 💳 Checkout and order placement
- 📦 Real-time order tracking and status updates
- ⭐ Ratings and reviews for restaurants
- 📍 Delivery address management
- 👤 User profile and order history
- 🔄 Reorder from past orders

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Python (Django / Flask) |
| Database | (your DB here — e.g. PostgreSQL / SQLite) |
| API | REST |
| Auth | (e.g. JWT / Session) |

> Update the table above to match your exact setup.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- Node.js & npm
- (your database — e.g. PostgreSQL)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/foodigo.git
cd foodigo
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate        # Django
python manage.py runserver      # runs on http://localhost:8000
```

> For Flask: `flask run` instead of the manage.py commands.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

### 4. Open the app

Go to `http://localhost:5173` (or whichever port your frontend runs on) in your browser.

---

## 📁 Project Structure

```
foodigo/
├── backend/               # Python backend (Django / Flask)
│   ├── main app files
│   ├── models/
│   ├── views/
│   └── requirements.txt
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── foodigo-automation/    # Automated UI test harness (separate, additive)
└── README.md
```

---

## 🧪 Test Harness

Foodigo includes a separate automated UI test harness (`foodigo-automation/`) built with **Playwright**. It drives the app like a real user and verifies the core flows work correctly.

**The harness covers:**
- Unit tests — pricing, delivery fees, cart totals, discounts, distance/ETA
- Integration/API tests — auth, restaurant search, order placement (payment mocked), order status
- End-to-end flows — browse → add to cart → checkout

**Important:** the harness is completely separate from the app. It does not modify any application code and does not run unless explicitly triggered.

### Running the test harness

Make sure Foodigo (both backend and frontend) is running first, then:

```bash
cd foodigo-automation
pytest                    # run all tests
```

Or use the one-click visible demo (opens a browser and walks through the order flow):

```bash
npm run demo              # opens GO-button control page
```

Then open `http://localhost:4000` and click **GO**.

---

## 📸 Screenshots

> Add screenshots of your app here.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

> Built by [Your Name](https://github.com/your-username)
