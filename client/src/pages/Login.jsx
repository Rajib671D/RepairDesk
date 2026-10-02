import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      const backendMessage = error.response?.data?.message;
      setErrorMessage(backendMessage || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
          {/* Branding */}
          <div className="mb-7 flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path
                  d="M12.5 2.5 15 5l-2 2 2.5 2.5L13 12l-2.5-2.5L7 13l-3-3 3.5-3.5L5 4l2.5-2.5L10 4Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-gray-900">
              RepairDesk
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-[13.5px] text-gray-500">
              Sign in to manage your service center.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-[13.5px] text-gray-900 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                placeholder="••••••••"
              />
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M10 7v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="10" cy="13.25" r="0.9" fill="currentColor" />
                  </svg>
                </span>
                <p className="text-[12.5px] font-medium text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-md bg-gray-900 px-4 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12px] text-gray-400">
          RepairDesk Service Center Management
        </p>
      </div>
    </div>
  );
};

export default Login;