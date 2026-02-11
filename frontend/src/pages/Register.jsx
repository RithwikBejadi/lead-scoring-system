/**
 * FILE: pages/Register.jsx
 * PURPOSE: Registration page with Google OAuth (primary) and email/password (secondary)
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { register, googleLogin, isAuthenticated, error, clearError } =
    useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await googleLogin();
    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
    setIsSubmitting(false);
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!name || !email || !password) {
      setLocalError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const result = await register({ email, password, name });
    if (result.success) {
      navigate("/dashboard", { replace: true });
    }
    setIsSubmitting(false);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-6 h-6 bg-black"></div>
            <span className="font-bold text-lg tracking-tight">LeadScorer</span>
          </Link>

          <h1 className="text-3xl font-black tracking-tight mb-2">
            Create account
          </h1>
          <p className="text-gray-500 mb-8">
            Get started with LeadScorer for free
          </p>

          {/* Error message */}
          {displayError && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 text-sm">
              {displayError}
            </div>
          )}

          {/* Google Sign-In - Primary */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full h-12 flex items-center justify-center gap-3 border border-gray-200 hover:border-black font-semibold text-sm transition-colors disabled:opacity-50 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-400 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Email form toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full h-12 border border-gray-200 hover:border-black font-semibold text-sm transition-colors"
            >
              Sign up with Email
            </button>
          ) : (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 focus:border-black focus:outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-black text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-black hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-black items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-2xl">
              rocket_launch
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Start scoring in minutes</h2>
          <p className="text-white/60 leading-relaxed">
            Set up your scoring rules, integrate our SDK, and start prioritizing
            your best leads. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
