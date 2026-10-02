const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const repairTicketRoutes = require("./routes/repairTicketRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RepairDesk API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/auth/me", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/repair-tickets", repairTicketRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;