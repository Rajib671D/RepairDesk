import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const INVOICES_URL = `${API_BASE_URL}/api/invoices`;
const TICKETS_URL = `${API_BASE_URL}/api/repair-tickets`;
const CUSTOMERS_URL = `${API_BASE_URL}/api/customers`;

const STATUS_OPTIONS = ["unpaid", "paid", "cancelled"];

const emptyForm = {
  repairTicket: "",
  customer: "",
  subtotal: "",
  discount: "",
  tax: "",
  status: "unpaid"
};

const formatLabel = (value) => {
  if (!value) {
    return "";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN");
};

const getInitial = (name) => {
  if (!name) {
    return "?";
  }
  return name.trim().charAt(0).toUpperCase();
};

const STATUS_BADGE = {
  unpaid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700"
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isTicketsLoading, setIsTicketsLoading] = useState(true);
  const [isCustomersLoading, setIsCustomersLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingTicketLabel, setEditingTicketLabel] = useState("");
  const [editingCustomerLabel, setEditingCustomerLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchInvoices = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(INVOICES_URL, {
        headers: getAuthHeaders()
      });

      setInvoices(response.data.invoices);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = async () => {
    setIsTicketsLoading(true);

    try {
      const response = await axios.get(TICKETS_URL, {
        headers: getAuthHeaders()
      });

      setTickets(response.data.tickets);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load repair tickets.");
    } finally {
      setIsTicketsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setIsCustomersLoading(true);

    try {
      const response = await axios.get(CUSTOMERS_URL, {
        headers: getAuthHeaders()
      });

      setCustomers(response.data.customers);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load customers.");
    } finally {
      setIsCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchTickets();
    fetchCustomers();
  }, []);

  const getTicketLabel = (ticket) => {
    if (!ticket) {
      return "";
    }

    const customerName = ticket.device?.customer?.name || "";
    const deviceName = [ticket.device?.brand, ticket.device?.model]
      .filter(Boolean)
      .join(" ");

    const parts = [ticket.ticketNumber, customerName, deviceName].filter(Boolean);

    return parts.join(" - ");
  };

  const getCustomerLabel = (customer) => {
    if (!customer) {
      return "";
    }

    return [customer.name, customer.phone].filter(Boolean).join(" - ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setEditingTicketLabel("");
    setEditingCustomerLabel("");
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openEditForm = (invoice) => {
    setFormData({
      repairTicket: invoice.repairTicket?._id || invoice.repairTicket || "",
      customer: invoice.customer?._id || invoice.customer || "",
      subtotal:
        invoice.subtotal !== undefined && invoice.subtotal !== null
          ? invoice.subtotal
          : "",
      discount:
        invoice.discount !== undefined && invoice.discount !== null
          ? invoice.discount
          : "",
      tax: invoice.tax !== undefined && invoice.tax !== null ? invoice.tax : "",
      status: invoice.status || "unpaid"
    });
    setEditingId(invoice._id);
    setEditingTicketLabel(
      invoice.repairTicket?.ticketNumber || invoice.repairTicket || ""
    );
    setEditingCustomerLabel(
      invoice.customer?.name
        ? `${invoice.customer.name}${invoice.customer.phone ? " - " + invoice.customer.phone : ""}`
        : invoice.customer || ""
    );
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
    setEditingTicketLabel("");
    setEditingCustomerLabel("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingId) {
        const { discount, tax, status } = formData;

        const payload = {
          discount: discount === "" ? 0 : Number(discount),
          tax: tax === "" ? 0 : Number(tax),
          status
        };

        await axios.put(`${INVOICES_URL}/${editingId}`, payload, {
          headers: getAuthHeaders()
        });

        setSuccessMessage("Invoice updated successfully.");
      } else {
        const { repairTicket, customer, subtotal, discount, tax } = formData;

        const payload = {
          repairTicket,
          customer,
          subtotal: Number(subtotal),
          discount: discount === "" ? 0 : Number(discount),
          tax: tax === "" ? 0 : Number(tax)
        };

        await axios.post(INVOICES_URL, payload, {
          headers: getAuthHeaders()
        });

        setSuccessMessage("Invoice created successfully.");
      }

      closeForm();
      await fetchInvoices();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(`${INVOICES_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      setSuccessMessage("Invoice deleted successfully.");
      await fetchInvoices();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to delete invoice.");
    }
  };

  const summary = {
    totalInvoices: invoices.length,
    unpaid: invoices.filter((inv) => inv.status === "unpaid").length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    totalBilled: invoices
      .filter((inv) => inv.status !== "cancelled")
      .reduce((sum, inv) => sum + (inv.total || 0), 0)
  };

  const previewDiscount = formData.discount === "" ? 0 : Number(formData.discount);
  const previewTax = formData.tax === "" ? 0 : Number(formData.tax);
  const previewSubtotal = formData.subtotal === "" ? 0 : Number(formData.subtotal);
  const previewTotal = previewSubtotal - previewDiscount + previewTax;

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Invoices</h2>
          <p className="mt-1 text-[13.5px] text-gray-500">
            Manage repair invoices, billing amounts, and payment status.
          </p>
          {!isLoading && !errorMessage && (
            <p className="mt-2 text-[12.5px] font-medium text-gray-400">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          )}
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Create Invoice
          </button>
        )}
      </div>

      {/* Summary */}
      {!isLoading && !errorMessage && (
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex sm:items-center sm:gap-0 sm:divide-x sm:divide-gray-100">
          <div className="sm:pr-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Total Invoices
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.totalInvoices}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Unpaid</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">{summary.unpaid}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Paid</p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">{summary.paid}</p>
          </div>
          <div className="sm:pl-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Total Billed
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(summary.totalBilled)}
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 7v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="13.25" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <p className="text-[13px] font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
              <path d="M5 10.25 8.1 13.5 15 6.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-[13px] font-medium text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* Form */}
      {isFormOpen && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-gray-900">
              {editingId ? "Edit Invoice" : "Create Invoice"}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {editingId
                ? "Update the discount, tax, and payment status."
                : "Create an invoice for a completed or active repair service."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Repair Ticket <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {editingTicketLabel || "-"}
                  </div>
                ) : isTicketsLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-500">
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-gray-300" />
                    Loading repair tickets...
                  </div>
                ) : (
                  <select
                    name="repairTicket"
                    value={formData.repairTicket}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Select a repair ticket</option>
                    {tickets.map((ticket) => (
                      <option key={ticket._id} value={ticket._id}>
                        {getTicketLabel(ticket)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Customer <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {editingCustomerLabel || "-"}
                  </div>
                ) : isCustomersLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-500">
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-gray-300" />
                    Loading customers...
                  </div>
                ) : (
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {getCustomerLabel(customer)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Subtotal <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {formatCurrency(formData.subtotal)}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3.5 py-2.5 transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                    <span className="text-[13px] text-gray-400">₹</span>
                    <input
                      type="number"
                      name="subtotal"
                      min="0"
                      step="0.01"
                      value={formData.subtotal}
                      onChange={handleInputChange}
                      required
                      className="w-full text-[13.5px] text-gray-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Discount</label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3.5 py-2.5 transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                  <span className="text-[13px] text-gray-400">₹</span>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full text-[13.5px] text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Tax</label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3.5 py-2.5 transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                  <span className="text-[13px] text-gray-400">₹</span>
                  <input
                    type="number"
                    name="tax"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full text-[13.5px] text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              {editingId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {formatLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Total preview */}
            <div className="mt-5 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-[13px] font-medium text-gray-600">
                {editingId ? "Current Total" : "Invoice Total"}
              </span>
              <span className="text-[15px] font-semibold text-gray-900">
                {formatCurrency(previewTotal)}
              </span>
            </div>

            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingId ? "Update Invoice" : "Create Invoice"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-gray-300 px-4 py-2.5 text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-gray-100" />
                <div className="flex shrink-0 items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 sm:block" />
                <div className="hidden h-2.5 w-14 animate-pulse rounded bg-gray-100 md:block" />
                <div className="hidden h-2.5 w-14 animate-pulse rounded bg-gray-100 md:block" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-5 w-16 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 xl:block" />
                <div className="h-7 w-20 shrink-0 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M5.5 2.5h9v15l-2.25-1.5L10 17.5l-2.25-1.5L5.5 17.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path d="M7.75 7h4.5M7.75 10h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-sm font-medium text-gray-700">No invoices yet</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Create an invoice to start tracking repair billing.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Invoice
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Repair Ticket
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Subtotal
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Discount
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Tax
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Issued
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="mt-0.5 text-[11.5px] text-gray-400">Invoice</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900/5 text-[12px] font-semibold text-gray-700">
                          {getInitial(invoice.customer?.name)}
                        </div>
                        <span className="text-gray-800">{invoice.customer?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {invoice.repairTicket?.ticketNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatCurrency(invoice.discount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {formatCurrency(invoice.tax)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
                          STATUS_BADGE[invoice.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {formatDate(invoice.issuedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(invoice)}
                          aria-label="Edit invoice"
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-[12.5px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                            <path
                              d="M13.5 3.5 16.5 6.5 7 16H4v-3Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(invoice._id)}
                          aria-label="Delete invoice"
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-[12.5px] font-medium text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                            <path
                              d="M4.5 6h11M8 6V4.5h4V6m-7 0 .6 9.2a1 1 0 0 0 1 .8h5.8a1 1 0 0 0 1-.8L15 6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;