import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const SigninForm = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    // Call login
    const result = await login(formData);

    if (result.success) {
      showSuccess("Welcome back!");
      navigate("/dashboard");
    } else {
      setError(result.error || "Invalid credentials");
      showError(result.error || "Invalid credentials");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await googleLogin();
    if (result.success) {
      showSuccess("Welcome!");
      navigate("/dashboard");
    } else if (result.error && result.error !== "Google sign-in cancelled") {
      showError(result.error);
    }
  };

  return (
    <div className="w-full lg:w-[45%] h-full bg-surface-light dark:bg-background-dark flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-16 xl:px-24 relative z-10">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary dark:bg-white rounded-lg flex items-center justify-center">
            <span className="material-icons-outlined text-white dark:text-black text-lg">
              insights
            </span>
          </div>
          <span className="font-semibold text-xl tracking-tight text-primary dark:text-white">
            Lead Intelligence
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-primary dark:text-white">
            Welcome back
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Enter your details to access your dashboard.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark ml-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-4 py-3 bg-transparent border border-border-light rounded-lg text-text-primary-light placeholder-text-secondary-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 dark:border-border-dark dark:text-text-primary-dark dark:focus:border-white dark:focus:ring-white"
              id="email"
              placeholder="name@company.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label
                className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark"
                htmlFor="password"
              >
                Password
              </label>
              <a
                className="text-xs font-medium text-text-secondary-light hover:text-primary dark:hover:text-white transition-colors"
                href="#"
              >
                Forgot password?
              </a>
            </div>
            <input
              className="w-full px-4 py-3 bg-transparent border border-border-light rounded-lg text-text-primary-light placeholder-text-secondary-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 dark:border-border-dark dark:text-text-primary-dark dark:focus:border-white dark:focus:ring-white"
              id="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <button
            className="w-full bg-primary text-white dark:bg-white dark:text-black font-medium py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 dark:shadow-white/10 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-light dark:bg-background-dark px-2 text-text-secondary-light dark:text-text-secondary-dark">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 border border-border-light dark:border-border-dark rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5 group-hover:opacity-80 transition-opacity"
              viewBox="0 0 24 24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              Continue with Google
            </span>
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Don't have an account?{" "}
            <Link
              className="text-primary dark:text-white font-medium hover:underline"
              to="/signup"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 sm:left-12 lg:left-16 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
        © 2024 Lead Intelligence Inc.
      </div>
    </div>
  );
};

export default SigninForm;
