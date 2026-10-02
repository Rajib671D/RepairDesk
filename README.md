# RepairDesk

A full-stack service center management system built for mobile, laptop, and electronics repair businesses.

RepairDesk helps service centers manage customers, devices, repair tickets, invoices, payments, and operational activity from a single dashboard.

## Features

* Secure JWT-based authentication
* Role-based access control
* Customer management
* Device management
* Repair ticket management
* Repair status workflow
* Technician assignment
* Invoice management
* Payment tracking
* Revenue dashboard
* Responsive web interface
* RESTful backend APIs
* MongoDB database integration
* Input validation and error handling

## Repair Workflow

```text
Received
   ↓
Diagnosing
   ↓
Waiting for Parts
   ↓
Repairing
   ↓
Testing
   ↓
Ready
   ↓
Delivered
```

## User Roles

### Admin

* Manage customers, devices, repair tickets, invoices, and payments
* Access dashboard information
* Manage administrative operations

### Technician

* View assigned repair work
* Update repair progress
* Update repair status

### Receptionist

* Register customers and devices
* Create repair tickets
* Manage customer-facing service operations

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Zod
* Multer

### Development & Deployment

* Git
* GitHub
* MongoDB Atlas
* Vercel
* Render

## Project Structure

```text
RepairDesk/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── scripts/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
└── README.md
```

## Dashboard

The dashboard provides an overview of service center activity, including:

* Today's repairs
* Pending repairs
* Completed repairs
* Total revenue
* Customer count

## Screenshots

### Dashboard

![RepairDesk Dashboard](./Screenshot%202026-08-02%20192345.png)

### Repair Management

![RepairDesk Repair Management](./Screenshot%202026-08-02%20192650.png)

### Application Interface

![RepairDesk Interface](./Screenshot%202026-10-02%20001641.png)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rajib671D/RepairDesk.git
cd RepairDesk
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit your actual environment variables or database credentials.

### 5. Start the backend

From the `server` directory:

```bash
npm run dev
```

### 6. Start the frontend

From the `client` directory:

```bash
npm run dev
```

The frontend will run on the Vite development server and communicate with the Express backend.

## API Modules

The backend provides REST APIs for:

```text
Authentication
Customers
Devices
Repair Tickets
Invoices
Payments
Dashboard
Reports
Users
```

Authentication uses JWT tokens, while protected routes use middleware for authentication and role-based authorization.

## Database

RepairDesk uses MongoDB with Mongoose.

Main collections include:

* Users
* Customers
* Devices
* Repair Tickets
* Invoices
* Payments

Relationships between entities are handled using MongoDB references and Mongoose population.

## Security

The application includes:

* JWT authentication
* Protected API routes
* Role-based authorization
* Password hashing
* Request validation
* MongoDB ObjectId validation
* Centralized error handling
* Environment-based configuration

## Current Status

The core application is implemented with functional frontend and backend modules for authentication, customers, devices, repair tickets, invoices, payments, and dashboard operations.

Deployment and production configuration are planned as the next stage.

## Future Improvements

* Production deployment
* Automated notifications
* Customer repair-status tracking
* Printable invoices
* Advanced reporting
* Technician performance analytics
* Search and filtering improvements
* Automated backups

## Author

**Rajib Das**

Computer Science Engineering — Artificial Intelligence & Machine Learning

GitHub: [Rajib671D](https://github.com/Rajib671D)
