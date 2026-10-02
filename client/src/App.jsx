import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Customers from "./pages/Customers.jsx";
import Devices from "./pages/Devices.jsx";
import RepairTickets from "./pages/RepairTickets.jsx";
import Invoices from "./pages/Invoices.jsx";
import Payments from "./pages/Payments.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/repairs" element={<RepairTickets />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;