# SOKA Predictions - Standalone PHP Backend Setup & Deployment Guide
## Host URL: `https://cheerplex.com/soka_king`

This directory (`/php-backend`) contains the pure **PHP + MySQL** backend server code.
You can host this directly on your cPanel web server at `cheerplex.com/soka_king` and connect your local Next.js frontend to it over HTTP REST APIs.

---

## 📁 Directory Structure to Upload to cPanel

Upload all files inside `/php-backend/` to your server path `public_html/soka_king/`:

```
public_html/soka_king/
├── config.php            # Database & M-Pesa API credentials
├── db.php                # MySQL PDO Database Connection Class
├── schema.sql            # Full MySQL Schema & Seed Data Script
└── api/
    ├── .htaccess         # Apache Mod_Rewrite rules for clean URLs
    ├── index.php         # Master REST API Front Controller Router
    └── predictions.php   # Direct PHP endpoint fallback
```

---

## 🛠️ Step 1: Create MySQL Database on cPanel (cheerplex.com)

1. Log into your **cPanel** dashboard on `cheerplex.com`.
2. Go to **MySQL® Databases**.
3. Create a new database name, e.g. `cheerple_soka_king`.
4. Create a new user, e.g. `cheerple_soka_user`, and set a strong password.
5. Assign **ALL PRIVILEGES** to `cheerple_soka_user` on `cheerple_soka_king`.
6. Open **phpMyAdmin** in cPanel, select `cheerple_soka_king`, click **Import**, choose `schema.sql`, and click **Go**.
   *(This will automatically create all tables and populate initial predictions, jackpots, VIP packages, and site settings!)*

---

## ⚙️ Step 2: Configure `config.php`

Open `public_html/soka_king/config.php` on your server and update your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cheerple_soka_king'); // Your cPanel Database Name
define('DB_USER', 'cheerple_soka_user'); // Your cPanel DB Username
define('DB_PASS', 'SokaKingSecret2026!'); // Your cPanel DB Password
define('DB_PORT', '3306');
```

---

## 🚀 Step 3: Test Your Remote PHP Backend Endpoints

Once uploaded, test these URLs in your browser or Postman:

- **API Health Check**: `https://cheerplex.com/soka_king/api/health`
- **Predictions**: `https://cheerplex.com/soka_king/api/predictions`
- **Jackpots**: `https://cheerplex.com/soka_king/api/jackpots`
- **VIP Packages**: `https://cheerplex.com/soka_king/api/vip-packages`
- **Odds Packs**: `https://cheerplex.com/soka_king/api/odds-packs`
- **Site Settings**: `https://cheerplex.com/soka_king/api/site-settings`

---

## 💻 Step 4: Configure Your Local Next.js Frontend

On your local machine where Next.js runs (`http://localhost:3000`):

1. Open `.env.local` (or `.env`) in your local project root:
   ```env
   BACKEND_URL=https://cheerplex.com/soka_king
   NEXT_PUBLIC_BACKEND_URL=https://cheerplex.com/soka_king
   ```

2. Run your local Next.js dev server:
   ```bash
   npm run dev
   ```

Now your local Next.js web application running on your PC will automatically fetch data from and post votes, STK pushes, and purchases to `https://cheerplex.com/soka_king` PHP backend!
