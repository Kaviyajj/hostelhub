# HostelHub – Smart Hostel Management System

HostelHub is a modern, responsive, full-stack Hostel Management System for colleges and universities. It features secure JWT authentication, role-based dashboards (Admin, Warden, Student), interactive custom SVG analytics, fee receipt downloads, visitors logs, and database utilities.

## Technology Stack

- **Frontend**: React.js + Vite
- **Styling**: Tailwind CSS v3
- **Backend**: Node.js + Express.js
- **Database**: SQLite (default zero-config) / MySQL (supported via `.env`)
- **ORM**: Sequelize
- **Authentication**: JWT + bcryptjs
- **File Uploads**: Multer
- **Receipts**: PDFKit

---

## Folder Structure

```
hostelhub/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize database connection config
│   │   ├── controllers/     # Controller logic (auth, admin, warden, student, shared)
│   │   ├── middleware/      # Auth (JWT protect/authorize), upload (Multer), logger
│   │   ├── models/          # Relational Sequelize models index
│   │   ├── routes/          # API route mappings (/api/...)
│   │   ├── seeders/         # Seed script for generating sample dataset
│   │   └── app.js           # Server startup script
│   ├── database.sqlite      # SQLite database file (generated after seed/sync)
│   ├── uploads/             # Static file storage directories (images, pdfs)
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Sidebar, Topbar, StatCard, SVG charts)
│   │   ├── context/         # AuthContext and ThemeContext (Light/Dark mode)
│   │   ├── pages/           # Pages (Login, Admin, Warden, Student Dashboards)
│   │   ├── services/        # Fetch API service layer
│   │   ├── App.jsx          # Route manager
│   │   ├── index.css        # Tailwind directives and variables
│   │   └── main.jsx         # DOM entry
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
├── schema.sql               # Pure MySQL Schema fallback script
└── README.md                # Quickstart instructions
```

---

## Installation & Running Locally

### Step 1: Install and Seed Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Initialize the database schema and populate it with sample datasets:
   ```bash
   npm run seed
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on **http://localhost:5000**.*

### Step 2: Install and Start Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install frontend packages:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch and be accessible at **http://localhost:5173**.*

---

## Mock Account Credentials

Use these pre-seeded accounts to explore the role-based dashboards:

| User Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hostelhub.com` | `adminpassword` |
| **Warden** (Block A) | `sarah.warden@hostelhub.com` | `wardenpassword` |
| **Warden** (Block B) | `robert.warden@hostelhub.com` | `wardenpassword` |
| **Student** (Female) | `alice@hostelhub.com` | `studentpassword` |
| **Student** (Male) | `charlie@hostelhub.com` | `studentpassword` |

---

## Switching to MySQL Database

To connect the application to your local/cloud MySQL server instead of SQLite:
1. Open the backend configuration file `backend/.env`.
2. Uncomment the MySQL variables and fill in your connection details:
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=hostelhub
   DB_PORT=3306
   ```
3. Create the database `hostelhub` on your MySQL server.
4. Run the seed command to create tables and import datasets:
   ```bash
   npm run seed
   ```
5. Restart your backend server (`npm run dev`). Sequelize will connect to MySQL automatically.
