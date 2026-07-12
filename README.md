# 🚛 TransitOps

## Smart Transport Operations Platform

TransitOps is a full-stack fleet and transport operations management platform developed for the **Odoo Hackathon**.

The platform helps transport organizations manage vehicles, drivers, trips, dispatch operations, maintenance activities, fuel consumption, operational expenses, and fleet performance through a centralized and responsive dashboard.

---

## 📌 Problem Statement

Transport organizations often manage vehicles, drivers, trips, maintenance records, fuel usage, and operational expenses using disconnected systems or manual processes.

This can result in:

- Vehicle scheduling conflicts
- Driver assignment conflicts
- Assignment of unavailable vehicles
- Assignment of suspended drivers
- Assignment of drivers with expired licences
- Vehicle overloading
- Poor maintenance tracking
- Inaccurate operational cost calculations
- Limited visibility into fleet performance

TransitOps solves these problems by providing an integrated platform with centralized fleet data, automated validation, role-based access control, operational workflows, and performance analytics.

---

## ✨ Core Features

### 🔐 Authentication and Role-Based Access Control

- Secure user authentication
- Password hashing
- JWT-based authorization
- Protected frontend and backend routes
- Role-based access control

Supported roles:

- Admin
- Fleet Manager
- Driver
- Safety Officer
- Financial Analyst

---

### 🚚 Vehicle Management

- Register new vehicles
- View fleet information
- Update vehicle details
- Track vehicle availability
- Track odometer readings
- Manage vehicle regions
- Prevent duplicate registration numbers
- Retire vehicles while preserving operational history

Vehicle statuses:

- `AVAILABLE`
- `ON_TRIP`
- `IN_SHOP`
- `RETIRED`

---

### 👨‍✈️ Driver Management

- Register drivers
- Update driver information
- Track licence categories
- Track licence expiry dates
- Manage driver availability
- Maintain driver safety scores
- Prevent duplicate licence numbers
- Identify expired or soon-to-expire licences

Driver statuses:

- `AVAILABLE`
- `ON_TRIP`
- `OFF_DUTY`
- `SUSPENDED`

---

### 🗺️ Trip and Dispatch Management

- Create trips
- Assign vehicles and drivers
- Record source and destination
- Record cargo weight
- Track planned distance
- Dispatch trips
- Complete trips
- Cancel trips
- Record final odometer readings
- Record fuel consumption
- Track trip revenue

Trip statuses:

- `DRAFT`
- `DISPATCHED`
- `COMPLETED`
- `CANCELLED`

---

### 🛡️ Dispatch Validation

Before dispatching a trip, TransitOps validates that:

- The selected vehicle is available
- The selected vehicle is not retired
- The selected vehicle is not under maintenance
- The selected driver is available
- The selected driver is not suspended
- The selected driver's licence has not expired
- The selected vehicle is not assigned to another active trip
- The selected driver is not assigned to another active trip
- Cargo weight does not exceed the vehicle's maximum load capacity

---

### 🔄 Automatic Status Management

When a trip is dispatched:

```text
Trip    → DISPATCHED
Vehicle → ON_TRIP
Driver  → ON_TRIP
```

When a dispatched trip is completed or cancelled:

```text
Vehicle → AVAILABLE
Driver  → AVAILABLE
```

Related database updates are performed using transactions to maintain data consistency.

---

### 🔧 Maintenance Management

- Create vehicle maintenance records
- Record maintenance descriptions
- Track maintenance costs
- Start maintenance activities
- Complete maintenance activities
- Track maintenance history

When maintenance starts:

```text
Maintenance → ACTIVE
Vehicle     → IN_SHOP
```

When maintenance is completed:

```text
Maintenance → COMPLETED
Vehicle     → AVAILABLE
```

---

### ⛽ Fuel Management

- Record fuel refills
- Track fuel quantity
- Track total fuel cost
- Associate fuel records with vehicles
- Optionally associate fuel records with trips
- Maintain vehicle fuel history

---

### 💰 Expense Management

- Record operational expenses
- Associate expenses with vehicles
- Optionally associate expenses with trips
- Track expense history

Supported expense categories:

- Toll
- Fine
- Other

---

### 📊 Dashboard and Analytics

The dashboard provides operational information such as:

- Total vehicles
- Available vehicles
- Vehicles currently on trips
- Vehicles under maintenance
- Total drivers
- Available drivers
- Active trips
- Completed trips
- Total revenue
- Fuel costs
- Maintenance costs
- Other operational expenses
- Fleet utilization
- Vehicle performance

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- Zod
- JWT
- bcrypt

### Database

- PostgreSQL
- Prisma ORM
- Prisma Migrate
- Prisma Studio

### Development and Collaboration

- Git
- GitHub
- ESLint

---

## 🏗️ System Architecture

```text
┌──────────────────────────┐
│      React + Vite        │
│        Frontend          │
└─────────────┬────────────┘
              │
              │ HTTP / REST API
              ▼
┌──────────────────────────┐
│      Express.js API      │
│                         │
│ Authentication          │
│ Authorization           │
│ Input Validation        │
│ Business Logic          │
└─────────────┬────────────┘
              │
              │ Prisma Client
              ▼
┌──────────────────────────┐
│       PostgreSQL         │
│     Local Database       │
└──────────────────────────┘
```

---

## 🗃️ Database Entities

The database contains the following core entities:

- Role
- User
- Vehicle
- Driver
- Trip
- Maintenance Log
- Fuel Log
- Expense

Main relationships:

```text
Role
 └── Users

User
 └── Driver Profile

Vehicle
 ├── Trips
 ├── Maintenance Logs
 ├── Fuel Logs
 └── Expenses

Driver
 └── Trips

Trip
 ├── Fuel Logs
 └── Expenses
```

---

## 📁 Project Structure

```text
TransitOps/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ui/
│   │   │
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── app.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── prisma.config.ts
│
├── .gitignore
├── README.md
└── package.json
```

> The actual structure may vary as development continues.

---

# 🚀 Local Setup

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Git

Recommended:

- VS Code
- pgAdmin

---

## 1. Clone the Repository

```bash
git clone https://github.com/Sandeep-12pcm/TransitOps.git
```

Move into the project:

```bash
cd TransitOps
```

---

## 2. Install Frontend Dependencies

```bash
cd client
```

```bash
npm install
```

---

## 3. Configure the Frontend Environment

Create:

```text
client/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 4. Install Backend Dependencies

Move to the backend:

```bash
cd ../server
```

Install dependencies:

```bash
npm install
```

---

## 5. Create a PostgreSQL Database

Create a local PostgreSQL database named:

```text
odoo_hackathon
```

You can create it using pgAdmin or PostgreSQL CLI.

---

## 6. Configure Backend Environment Variables

Create:

```text
server/.env
```

Use `server/.env.example` as a template.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/odoo_hackathon?schema=public"

PORT=5000

JWT_SECRET="replace_with_a_secure_secret"

JWT_EXPIRES_IN="1d"

CLIENT_URL="http://localhost:5173"
```

Replace:

```text
USERNAME
```

and:

```text
PASSWORD
```

with your local PostgreSQL credentials.

> Never commit the `.env` file to GitHub.

---

## 7. Apply Prisma Migrations

From the `server` folder, run:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## 8. Seed the Database

Run:

```bash
npx prisma db seed
```

This inserts sample roles, users, vehicles, drivers, trips, maintenance records, fuel records, and expenses.

---

## 9. Run the Backend

From the `server` folder:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

---

## 10. Run the Frontend

Open another terminal:

```bash
cd client
```

Run:

```bash
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

---

## 🧪 Useful Prisma Commands

Format the Prisma schema:

```bash
npx prisma format
```

Validate the Prisma schema:

```bash
npx prisma validate
```

Create and apply a development migration:

```bash
npx prisma migrate dev --name migration_name
```

Apply existing migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed the database:

```bash
npx prisma db seed
```

Open Prisma Studio:

```bash
npx prisma studio
```

---

## 🔀 Git Collaboration Workflow

The project follows this branch structure:

```text
main
└── develop
    ├── feature/database-schema
    ├── feature/auth-vehicles
    ├── feature/drivers-trips
    ├── feature/maintenance-finance
    └── feature/dashboard-ui
```

Development workflow:

```text
Feature Branch
      ↓
Pull Request
      ↓
Develop Branch
      ↓
Integration Testing
      ↓
Main Branch
```

Before starting work:

```bash
git checkout develop
```

```bash
git pull origin develop
```

Create a feature branch:

```bash
git checkout -b feature/feature-name
```

After completing a feature:

```bash
git add .
```

```bash
git commit -m "feat: add feature description"
```

```bash
git push -u origin feature/feature-name
```

Create a pull request:

```text
feature/feature-name
          ↓
       develop
```

After integration testing:

```text
develop
    ↓
  main
```

---

## 📝 Commit Convention

Examples:

```bash
git commit -m "feat: add vehicle management"
```

```bash
git commit -m "feat: implement trip dispatch workflow"
```

```bash
git commit -m "fix: prevent expired drivers from being assigned"
```

```bash
git commit -m "style: align dashboard with shared design system"
```

```bash
git commit -m "chore: update project configuration"
```

```bash
git commit -m "docs: update project setup instructions"
```

---

## 👥 Team Contributions

| Team Member | Primary Responsibility |
|---|---|
| Member 1 | PostgreSQL, Prisma schema, migrations, seed data and integration |
| Member 2 | Authentication, authorization and vehicle management |
| Member 3 | Driver management, trip management and dispatch workflow |
| Member 4 | Maintenance, fuel, expenses, dashboard and analytics |

All team members contribute through separate feature branches and pull requests.

---

## 🎯 Key Business Rules

1. Vehicle registration numbers must be unique.
2. Driver licence numbers must be unique.
3. Retired vehicles cannot be dispatched.
4. Vehicles under maintenance cannot be dispatched.
5. Suspended drivers cannot be assigned.
6. Drivers with expired licences cannot be assigned.
7. A vehicle cannot be assigned to multiple active trips.
8. A driver cannot be assigned to multiple active trips.
9. Cargo weight cannot exceed vehicle capacity.
10. Dispatching a trip changes the vehicle and driver statuses to `ON_TRIP`.
11. Completing or cancelling a dispatched trip restores vehicle and driver availability.
12. Starting maintenance changes the vehicle status to `IN_SHOP`.
13. Completing maintenance restores vehicle availability.
14. Related status changes are performed using database transactions.

---

## 🔒 Security Practices

- Passwords are hashed before storage.
- Authentication uses JSON Web Tokens.
- Protected APIs require authentication.
- Role permissions are validated on the backend.
- User input is validated before database operations.
- Database credentials are stored in environment variables.
- Environment files are excluded from Git.
- Sensitive values are not exposed to the frontend.

---

## 🔮 Future Enhancements

- Advanced fleet analytics
- PDF report generation
- CSV and Excel exports
- Driver licence expiry notifications
- Vehicle document management
- Email notifications
- Predictive maintenance
- Route optimization
- Real-time vehicle tracking
- Dark mode
- Advanced search and filtering

---

## 📄 License

This project was developed for the Odoo Hackathon.

---

## 👨‍💻 Developed By

**Team Name:** `YOUR_TEAM_NAME`

Team members:

- `MEMBER_1_NAME`
- `MEMBER_2_NAME`
- `MEMBER_3_NAME`
- `MEMBER_4_NAME`
