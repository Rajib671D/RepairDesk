import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const PAYMENTS_URL = `${API_BASE_URL}/api/payments`;
const INVOICES_URL = `${API_BASE_URL}/api/invoices`;

const METHOD_OPTIONS = ["cash", "card", "upi", "bank_transfer"];
const STATUS_OPTIONS = ["pending", "completed", "failed"];

const emptyForm = {
  invoice: "",
  amount: "",
  method: "cash",
  status: "completed",
  transactionId: ""
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
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700"
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingInvoiceLabel, setEditingInvoiceLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchPayments = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(PAYMENTS_URL, {
        headers: getAuthHeaders()
      });

      setPayments(response.data.payments);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setIsInvoicesLoading(true);

    try {
      const response = await axios.get(INVOICES_URL, {
        headers: getAuthHeaders()
      });

      setInvoices(response.data.invoices);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load invoices.");
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const getInvoiceLabel = (invoice) => {
    if (!invoice) {
      return "";
    }

    const parts = [
      invoice.invoiceNumber,
      invoice.customer?.name,
      invoice.total !== undefined ? formatCurrency(invoice.total) : ""
    ].filter(Boolean);

    return parts.join(" - ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setEditingInvoiceLabel("");
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openEditForm = (payment) => {
    setFormData({
      invoice: payment.invoice?._id || payment.invoice || "",
      amount:
        payment.amount !== undefined && payment.amount !== null ? payment.amount : "",
      method: payment.method || "cash",
      status: payment.status || "completed",
      transactionId: payment.transactionId || ""
    });
    setEditingId(payment._id);
    setEditingInvoiceLabel(
      payment.invoice?.invoiceNumber || payment.invoice || ""
    );
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
    setEditingInvoiceLabel("");
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
        const { amount, method, status, transactionId } = formData;

        const payload = {
          amount: amount === "" ? undefined : Number(amount),
          method,
          status,
          transactionId
        };

        await axios.put(`${PAYMENTS_URL}/${editingId}`, payload, {
          headers: getAuthHeaders()
        });

        setSuccessMessage("Payment updated successfully.");
      } else {
        const { invoice, amount, method, transactionId } = formData;

        const payload = {
          invoice,
          amount: amount === "" ? undefined : Number(amount),
          method,
          transactionId
        };

        await axios.post(PAYMENTS_URL, payload, {
          headers: getAuthHeaders()
        });

        setSuccessMessage("Payment recorded successfully.");
      }

      closeForm();
      await fetchPayments();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to save payment.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(`${PAYMENTS_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      setSuccessMessage("Payment deleted successfully.");
      await fetchPayments();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to delete payment.");
    }
  };

  const summary = {
    totalPayments: payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    totalCollected: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const previewAmount = formData.amount === "" ? 0 : Number(formData.amount);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Payments</h2>
          <p className="mt-1 text-[13.5px] text-gray-500">
            Track repair payments, payment methods, and transaction status.
          </p>
          {!isLoading && !errorMessage && (
            <p className="mt-2 text-[12.5px] font-medium text-gray-400">
              {payments.length} {payments.length === 1 ? "payment" : "payments"}
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
            Record Payment
          </button>
        )}
      </div>

      {/* Summary */}
      {!isLoading && !errorMessage && (
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex sm:items-center sm:gap-0 sm:divide-x sm:divide-gray-100">
          <div className="sm:pr-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Total Payments
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.totalPayments}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Completed</p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">{summary.completed}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Pending</p>
            <p className="mt-1 text-lg font-semibold text-amber-700">{summary.pending}</p>
          </div>
          <div className="sm:pl-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Total Collected
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(summary.totalCollected)}
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
              {editingId ? "Edit Payment" : "Record Payment"}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {editingId
                ? "Update the payment amount, method, and status."
                : "Record a payment against an existing invoice."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">
                  Invoice <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {editingInvoiceLabel || "-"}
                  </div>
                ) : isInvoicesLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-500">
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-gray-300" />
                    Loading invoices...
                  </div>
                ) : (
                  <select
                    name="invoice"
                    value={formData.invoice}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Select an invoice</option>
                    {invoices.map((invoice) => (
                      <option key={invoice._id} value={invoice._id}>
                        {getInvoiceLabel(invoice)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3.5 py-2.5 transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                  <span className="text-[13px] text-gray-400">₹</span>
                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="w-full text-[13.5px] text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  required
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  {METHOD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatLabel(option)}
                    </option>
                  ))}
                </select>
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

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">Transaction ID</label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="Optional reference number"
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Amount preview */}
            <div className="mt-5 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="text-[13px] font-medium text-gray-600">Payment Amount</span>
              <span className="text-[15px] font-semibold text-gray-900">
                {formatCurrency(previewAmount)}
              </span>
            </div>

            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingId ? "Update Payment" : "Record Payment"}
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
                <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-gray-100" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 sm:block" />
                <div className="flex shrink-0 items-center gap-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
                <div className="hidden h-2.5 w-14 animate-pulse rounded bg-gray-100 md:block" />
                <div className="hidden h-5 w-16 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-2.5 w-20 animate-pulse rounded bg-gray-100 xl:block" />
                <div className="h-7 w-20 shrink-0 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <rect x="2.5" y="5" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5.5 12.25h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-sm font-medium text-gray-700">No payments yet</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Record a payment to start tracking repair collections.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Record Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Payment
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Invoice
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Method
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Paid At
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Transaction ID
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[12.5px] font-medium text-gray-700">
                        {payment._id ? payment._id.slice(-6).toUpperCase() : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {payment.invoice?.invoiceNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900/5 text-[12px] font-semibold text-gray-700">
                          {getInitial(payment.invoice?.customer?.name)}
                        </div>
                        <span className="text-gray-800">
                          {payment.invoice?.customer?.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{formatLabel(payment.method)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
                          STATUS_BADGE[payment.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(payment.paidAt)}</td>
                    <td className="max-w-[160px] px-5 py-3.5 text-gray-600">
                      <span className="block truncate" title={payment.transactionId || ""}>
                        {payment.transactionId || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(payment)}
                          aria-label="Edit payment"
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
                          onClick={() => handleDelete(payment._id)}
                          aria-label="Delete payment"
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

export default Payments;