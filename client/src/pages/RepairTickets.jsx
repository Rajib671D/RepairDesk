import { useState, useEffect } from "react";
import axios from "axios";

const TICKETS_URL = "http://localhost:5000/api/repair-tickets";
const DEVICES_URL = "http://localhost:5000/api/devices";

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS = [
  "received",
  "diagnosing",
  "waiting_for_parts",
  "repairing",
  "testing",
  "ready",
  "delivered"
];

const emptyForm = {
  device: "",
  problem: "",
  priority: "medium",
  status: "received",
  expectedDate: "",
  cost: "",
  notes: ""
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

const getInitial = (name) => {
  if (!name) {
    return "?";
  }
  return name.trim().charAt(0).toUpperCase();
};

const PRIORITY_BADGE = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700"
};

const STATUS_BADGE = {
  received: "bg-gray-100 text-gray-600",
  diagnosing: "bg-sky-50 text-sky-700",
  waiting_for_parts: "bg-amber-50 text-amber-700",
  repairing: "bg-indigo-50 text-indigo-700",
  testing: "bg-violet-50 text-violet-700",
  ready: "bg-emerald-50 text-emerald-700",
  delivered: "bg-gray-100 text-gray-600"
};

const IN_PROGRESS_STATUSES = ["diagnosing", "waiting_for_parts", "repairing", "testing"];

const RepairTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [devices, setDevices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingDeviceLabel, setEditingDeviceLabel] = useState("");
  const [editingAssignedTechnician, setEditingAssignedTechnician] = useState("");
  const [editingAssignedTechnicianLabel, setEditingAssignedTechnicianLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(TICKETS_URL, {
        headers: getAuthHeaders()
      });

      setTickets(response.data.tickets);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load repair tickets.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDevices = async () => {
    setIsDevicesLoading(true);

    try {
      const response = await axios.get(DEVICES_URL, {
        headers: getAuthHeaders()
      });

      setDevices(response.data.devices);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load devices.");
    } finally {
      setIsDevicesLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchDevices();
  }, []);

  const getDeviceLabel = (device) => {
    if (!device) {
      return "";
    }

    const deviceName = [device.brand, device.model].filter(Boolean).join(" ");
    const customerName = device.customer?.name || "";

    return customerName ? `${deviceName} - ${customerName}` : deviceName;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setEditingDeviceLabel("");
    setEditingAssignedTechnician("");
    setEditingAssignedTechnicianLabel("");
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openEditForm = (ticket) => {
    setFormData({
      device: ticket.device?._id || "",
      problem: ticket.problem || "",
      priority: ticket.priority || "medium",
      status: ticket.status || "received",
      expectedDate: ticket.expectedDate ? ticket.expectedDate.substring(0, 10) : "",
      cost: ticket.cost !== undefined && ticket.cost !== null ? ticket.cost : "",
      notes: ticket.notes || ""
    });
    setEditingId(ticket._id);
    setEditingDeviceLabel(getDeviceLabel(ticket.device));
    setEditingAssignedTechnician(ticket.assignedTechnician?._id || "");
    setEditingAssignedTechnicianLabel(
      ticket.assignedTechnician
        ? `${ticket.assignedTechnician.name} (${ticket.assignedTechnician.email})`
        : "Not assigned"
    );
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
    setEditingDeviceLabel("");
    setEditingAssignedTechnician("");
    setEditingAssignedTechnicianLabel("");
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
        const { problem, priority, status, expectedDate, cost, notes } = formData;

        await axios.put(
          `${TICKETS_URL}/${editingId}`,
          {
            problem,
            priority,
            status,
            assignedTechnician: editingAssignedTechnician || undefined,
            expectedDate: expectedDate || undefined,
            cost: cost === "" ? undefined : Number(cost),
            notes
          },
          { headers: getAuthHeaders() }
        );

        setSuccessMessage("Repair ticket updated successfully.");
      } else {
        const { device, problem, priority, expectedDate, cost, notes } = formData;

        await axios.post(
          TICKETS_URL,
          {
            device,
            problem,
            priority,
            expectedDate: expectedDate || undefined,
            cost: cost === "" ? undefined : Number(cost),
            notes
          },
          { headers: getAuthHeaders() }
        );

        setSuccessMessage("Repair ticket added successfully.");
      }

      closeForm();
      await fetchTickets();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to save repair ticket.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this repair ticket?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(`${TICKETS_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      setSuccessMessage("Repair ticket deleted successfully.");
      await fetchTickets();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to delete repair ticket.");
    }
  };

  const summary = {
    received: tickets.filter((t) => t.status === "received").length,
    inProgress: tickets.filter((t) => IN_PROGRESS_STATUSES.includes(t.status)).length,
    ready: tickets.filter((t) => t.status === "ready").length,
    delivered: tickets.filter((t) => t.status === "delivered").length
  };

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Repair Tickets</h2>
          <p className="mt-1 text-[13.5px] text-gray-500">
            Track repair progress, priorities, technicians, and service costs.
          </p>
          {!isLoading && !errorMessage && (
            <p className="mt-2 text-[12.5px] font-medium text-gray-400">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
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
            Add Repair Ticket
          </button>
        )}
      </div>

      {/* Workflow summary */}
      {!isLoading && !errorMessage && (
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4 sm:flex sm:items-center sm:gap-0 sm:divide-x sm:divide-gray-100">
          <div className="sm:pr-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Received</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.received}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">In Progress</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.inProgress}</p>
          </div>
          <div className="sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Ready</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.ready}</p>
          </div>
          <div className="sm:pl-6">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Delivered</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{summary.delivered}</p>
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
              {editingId ? "Edit Repair Ticket" : "Add Repair Ticket"}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {editingId
                ? "Update the repair status, priority, cost, and service details."
                : "Create a new repair ticket and record the reported issue."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">
                  Device <span className="text-red-500">*</span>
                </label>
                {editingId ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {editingDeviceLabel || "-"}
                  </div>
                ) : isDevicesLoading ? (
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] text-gray-500">
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-gray-300" />
                    Loading devices...
                  </div>
                ) : (
                  <select
                    name="device"
                    value={formData.device}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Select a device</option>
                    {devices.map((device) => (
                      <option key={device._id} value={device._id}>
                        {getDeviceLabel(device)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {editingId && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-gray-700">Assigned Technician</label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] text-gray-600">
                    {editingAssignedTechnicianLabel || "Not assigned"}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">
                  Problem <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe the reported issue..."
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  {PRIORITY_OPTIONS.map((option) => (
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Expected Date</label>
                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate}
                  onChange={handleInputChange}
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Estimated Cost</label>
                <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3.5 py-2.5 transition-colors focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                  <span className="text-[13px] text-gray-400">₹</span>
                  <input
                    type="number"
                    name="cost"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full text-[13.5px] text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Add any additional repair notes..."
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : editingId ? "Update Ticket" : "Save Ticket"}
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
                <div className="hidden h-2.5 w-24 animate-pulse rounded bg-gray-100 sm:block" />
                <div className="hidden flex-1 h-2.5 animate-pulse rounded bg-gray-100 md:block" />
                <div className="hidden h-5 w-16 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-5 w-20 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 xl:block" />
                <div className="h-7 w-20 shrink-0 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M12.5 2.5 15 5l-2 2 2.5 2.5L13 12l-2.5-2.5L7 13l-3-3 3.5-3.5L5 4l2.5-2.5L10 4Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M4 16.5 7 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-sm font-medium text-gray-700">No repair tickets yet</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Create your first repair ticket to start tracking service work.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add Repair Ticket
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Ticket
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Device
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Issue
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Priority
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Technician
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Expected
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Cost
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{ticket.ticketNumber}</p>
                      <p className="mt-0.5 text-[11.5px] text-gray-400">Repair ticket</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900/5 text-[12px] font-semibold text-gray-700">
                          {getInitial(ticket.device?.customer?.name)}
                        </div>
                        <span className="text-gray-800">{ticket.device?.customer?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-800">
                        {[ticket.device?.brand, ticket.device?.model].filter(Boolean).join(" ") || "-"}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-gray-400">{ticket.device?.type || "-"}</p>
                    </td>
                    <td className="max-w-[220px] px-5 py-3.5 text-gray-600">
                      <span className="block truncate" title={ticket.problem || ""}>
                        {ticket.problem || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
                          PRIORITY_BADGE[ticket.priority] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
                          STATUS_BADGE[ticket.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {ticket.assignedTechnician ? (
                        <span className="text-gray-700">{ticket.assignedTechnician.name}</span>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {ticket.expectedDate
                        ? new Date(ticket.expectedDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {formatCurrency(ticket.cost)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(ticket)}
                          aria-label="Edit ticket"
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
                          onClick={() => handleDelete(ticket._id)}
                          aria-label="Delete ticket"
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

export default RepairTickets;