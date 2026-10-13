import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const SignupForm = () => {
  const navigate = useNavigate();
  const { register, googleLogin, isLoading } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [formData, setFormData] = useState({
    name: "",
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
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Call register
    const result = await register(formData);

    if (result.success) {
      showSuccess("Account created successfully!");
      navigate("/dashboard");
    } else {
      setError(result.error || "Registration failed");
      showError(result.error || "Registration failed");
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
    <div className="w-full lg:w-[45%] h-full overflow-y-auto bg-surface-light dark:bg-background-dark flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 relative z-10 shadow-xl lg:shadow-none">
      {/* Logo area */}
      <div className="absolute top-8 left-8 lg:left-16 flex items-center gap-2">
        <div className="w-6 h-6 bg-primary dark:bg-white rounded-full flex items-center justify-center">
          <span className="material-icons-outlined text-white dark:text-primary text-[14px]">
            bolt
          </span>
        </div>
        <span className="font-bold tracking-tight text-sm text-primary dark:text-white">
          Lead Intelligence
        </span>
      </div>

      <div className="max-w-md w-full mx-auto space-y-8 mt-12 lg:mt-0">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-primary dark:text-white">
            Get started for free
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm lg:text-base">
            Join 1,000+ teams building better.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-background-dark text-sm font-medium text-text-primary-light dark:text-text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-light dark:bg-background-dark px-2 text-text-secondary-light dark:text-text-secondary-dark">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="block w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent text-primary dark:text-white placeholder-text-secondary-light focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              id="name"
              placeholder="John Doe"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
              htmlFor="email"
            >
              Work Email
            </label>
            <input
              className="block w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent text-primary dark:text-white placeholder-text-secondary-light focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              id="email"
              placeholder="name@company.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="block w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent text-primary dark:text-white placeholder-text-secondary-light focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
              id="password"
              placeholder="••••••••"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="pt-2">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white dark:bg-white dark:text-primary dark:hover:bg-slate-200 font-medium py-3.5 px-4 rounded-full transition-transform active:scale-[0.99] shadow-lg shadow-primary/20 dark:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
          Already have an account?{" "}
          <Link
            className="text-primary dark:text-white font-medium hover:underline"
            to="/login"
          >
            Log in
          </Link>
        </p>

        <div className="pt-4 border-t border-border-light dark:border-border-dark">
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark text-center">
            By clicking "Create Account", you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
