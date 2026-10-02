import { useState, useEffect } from "react";
import axios from "axios";

const DEVICES_URL = "http://localhost:5000/api/devices";
const CUSTOMERS_URL = "http://localhost:5000/api/customers";

const emptyForm = {
  customer: "",
  type: "",
  brand: "",
  model: "",
  serialNumber: "",
  color: ""
};

const getInitial = (name) => {
  if (!name) {
    return "?";
  }
  return name.trim().charAt(0).toUpperCase();
};

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCustomersLoading, setIsCustomersLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingCustomerLabel, setEditingCustomerLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchDevices = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(DEVICES_URL, {
        headers: getAuthHeaders()
      });

      setDevices(response.data.devices);
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to load devices.");
    } finally {
      setIsLoading(false);
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
    fetchDevices();
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setEditingCustomerLabel("");
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const openEditForm = (device) => {
    setFormData({
      customer: device.customer?._id || "",
      type: device.type || "",
      brand: device.brand || "",
      model: device.model || "",
      serialNumber: device.serialNumber || "",
      color: device.color || ""
    });
    setEditingId(device._id);
    setEditingCustomerLabel(
      device.customer ? `${device.customer.name} (${device.customer.phone})` : ""
    );
    setIsFormOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyForm);
    setEditingId(null);
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
        const { type, brand, model, serialNumber, color } = formData;

        await axios.put(
          `${DEVICES_URL}/${editingId}`,
          { type, brand, model, serialNumber, color },
          { headers: getAuthHeaders() }
        );

        setSuccessMessage("Device updated successfully.");
      } else {
        await axios.post(DEVICES_URL, formData, {
          headers: getAuthHeaders()
        });

        setSuccessMessage("Device added successfully.");
      }

      closeForm();
      await fetchDevices();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to save device.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this device?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.delete(`${DEVICES_URL}/${id}`, {
        headers: getAuthHeaders()
      });

      setSuccessMessage("Device deleted successfully.");
      await fetchDevices();
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Failed to delete device.");
    }
  };

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Devices</h2>
          <p className="mt-1 text-[13.5px] text-gray-500">
            Manage registered devices and their customer ownership.
          </p>
          {!isLoading && !errorMessage && (
            <p className="mt-2 text-[12.5px] font-medium text-gray-400">
              {devices.length} {devices.length === 1 ? "device" : "devices"}
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
            Add Device
          </button>
        )}
      </div>

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
              {editingId ? "Edit Device" : "Add Device"}
            </h3>
            <p className="mt-0.5 text-[13px] text-gray-500">
              {editingId
                ? "Update the device information below."
                : "Register a device and link it to a customer."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
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
                        {customer.name} ({customer.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Device Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  placeholder="Laptop"
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  placeholder="Lenovo"
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  placeholder="ThinkPad E14"
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="SN123456789"
                  className="rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Black"
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
                {isSaving ? "Saving..." : editingId ? "Update Device" : "Save Device"}
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
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="hidden h-2.5 w-20 animate-pulse rounded bg-gray-100 sm:block" />
                <div className="hidden h-2.5 w-16 animate-pulse rounded bg-gray-100 md:block" />
                <div className="hidden h-2.5 w-24 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="hidden h-2.5 w-14 animate-pulse rounded bg-gray-100 lg:block" />
                <div className="h-7 w-20 shrink-0 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <rect x="4.5" y="2.5" width="11" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 14.75h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-sm font-medium text-gray-700">No devices yet</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Register your first device to start tracking repairs and customer equipment.
            </p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Add Device
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Device
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Serial Number
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Color
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devices.map((device) => (
                  <tr key={device._id} className="transition-colors hover:bg-gray-50/70">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">
                        {[device.brand, device.model].filter(Boolean).join(" ") || "-"}
                      </p>
                      <p className="mt-0.5 text-[12px] text-gray-400">{device.type || "-"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900/5 text-[12px] font-semibold text-gray-700">
                          {getInitial(device.customer?.name)}
                        </div>
                        <span className="text-gray-800">{device.customer?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{device.customer?.phone || "-"}</td>
                    <td className="px-5 py-3.5 text-gray-600">{device.type || "-"}</td>
                    <td className="px-5 py-3.5 font-mono text-[12.5px] text-gray-600">
                      {device.serialNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{device.color || "-"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(device)}
                          aria-label="Edit device"
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
                          onClick={() => handleDelete(device._id)}
                          aria-label="Delete device"
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

export default Devices;