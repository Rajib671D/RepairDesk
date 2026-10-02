import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M3 10.5 10 4l7 6.5M5 9v7a1 1 0 0 0 1 1h3v-4.5h2V17h3a1 1 0 0 0 1-1V9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
  {
    label: "Customers",
    path: "/customers",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <circle cx="10" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M4 17c.6-3 2.8-4.75 6-4.75S15.4 14 16 17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  },
  {
    label: "Devices",
    path: "/devices",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <rect x="4.5" y="2.5" width="11" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 14.75h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    label: "Repair Tickets",
    path: "/repairs",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M4.5 3.5h7.75L15.5 7v9.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M7 10h6M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    label: "Invoices",
    path: "/invoices",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M5.5 2.5h9v15l-2.25-1.5L10 17.5l-2.25-1.5L5.5 17.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M7.75 7h4.5M7.75 10h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    label: "Payments",
    path: "/payments",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]">
        <rect x="2.5" y="5" width="15" height="10.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 8.5h15" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 12.25h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
];

const getPageTitle = (pathname) => {
  const match = navItems.find((item) => pathname.startsWith(item.path));
  return match ? match.label : "RepairDesk";
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8] text-gray-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 flex h-full w-64 flex-col border-r border-gray-200 bg-white transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-6">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white">
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">
            RepairDesk
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Workspace
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Account area */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              RD
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-gray-800">RepairDesk Admin</p>
              <p className="truncate text-[11.5px] text-gray-400">Service Center Console</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[18px] w-[18px]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="truncate text-[15px] font-semibold text-gray-900">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden items-center gap-2.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                RD
              </div>
              <span className="text-[13px] font-medium text-gray-700">My Account</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-200 px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f7f7f8] p-4 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;