import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStats(response.data.stats);
      } catch (error) {
        const backendMessage = error.response?.data?.message;
        setErrorMessage(backendMessage || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const cardConfig = stats
    ? [
        {
          key: "todaysRepairs",
          label: "Today's Repairs",
          value: stats.todaysRepairs,
          caption: "Tickets created today",
          iconColor: "text-gray-700",
          iconBg: "bg-gray-900/5",
          barColor: "bg-gray-900",
          icon: (
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <rect x="3" y="4" width="14" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 7.5h14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )
        },
        {
          key: "pendingRepairs",
          label: "Pending Repairs",
          value: stats.pendingRepairs,
          caption: "Not yet delivered",
          iconColor: "text-amber-700",
          iconBg: "bg-amber-50",
          barColor: "bg-amber-400",
          icon: (
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          key: "completedRepairs",
          label: "Completed Repairs",
          value: stats.completedRepairs,
          caption: "Marked as delivered",
          iconColor: "text-emerald-700",
          iconBg: "bg-emerald-50",
          barColor: "bg-emerald-500",
          icon: (
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 10.25 9.1 12.5 13.2 7.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          key: "revenue",
          label: "Total Revenue",
          value: formatCurrency(stats.revenue),
          caption: "Across all repair tickets",
          iconColor: "text-indigo-700",
          iconBg: "bg-indigo-50",
          barColor: "bg-indigo-500",
          icon: (
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <rect x="2.5" y="5" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5.5 12.25h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )
        },
        {
          key: "customers",
          label: "Customers",
          value: stats.customers,
          caption: "Registered in RepairDesk",
          iconColor: "text-violet-700",
          iconBg: "bg-violet-50",
          barColor: "bg-violet-500",
          icon: (
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <circle cx="10" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4 17c.6-3 2.8-4.75 6-4.75S15.4 14 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )
        }
      ]
    : [];

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">Dashboard</h2>
            <p className="mt-1 text-[13.5px] text-gray-500">
              An overview of repair activity and business performance.
            </p>
          </div>
          <p className="shrink-0 text-[12.5px] font-medium text-gray-400">{today}</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <>
          <div className="mb-3 h-3 w-16 animate-pulse rounded bg-gray-100" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5"
              >
                <div className="absolute inset-y-0 left-0 w-[3px] bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-9 w-9 animate-pulse rounded-md bg-gray-100" />
                </div>
                <div className="mt-6 h-7 w-16 animate-pulse rounded bg-gray-100" />
                <div className="mt-2.5 h-2.5 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Error state */}
      {!isLoading && errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 7v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="10" cy="13.25" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-red-700">Unable to load dashboard</p>
            <p className="mt-0.5 text-[13px] text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Empty state (no stats object at all) */}
      {!isLoading && !errorMessage && !stats && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
              <rect x="3" y="4" width="14" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 8h14M7 11.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-sm font-medium text-gray-700">No dashboard data available</p>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Metrics will appear here once repair activity has been recorded.
          </p>
        </div>
      )}

      {/* KPI grid */}
      {!isLoading && !errorMessage && stats && (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Overview
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cardConfig.map((card) => (
              <div
                key={card.key}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-sm"
              >
                <span
                  className={`absolute inset-y-0 left-0 w-[3px] ${card.barColor} opacity-70 transition-opacity group-hover:opacity-100`}
                />
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-gray-500">{card.label}</p>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-md ${card.iconBg} ${card.iconColor} transition-transform group-hover:scale-105`}
                  >
                    {card.icon}
                  </span>
                </div>
                <p className="mt-5 text-[27px] font-semibold leading-none tracking-tight text-gray-900">
                  {card.value}
                </p>
                <p className="mt-2.5 text-[12.5px] text-gray-400">{card.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;