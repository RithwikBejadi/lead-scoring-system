/**
 * LeadScore Login Page - Consistent with Landing Page
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await googleLogin();
    if (result.success) {
      navigate(from, { replace: true });
    }
    setIsSubmitting(false);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login({ email, password });
    if (result.success) {
      navigate(from, { replace: true });
    }
    setIsSubmitting(false);
  };

  const styles = {
    page: {
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#ffffff",
      color: "#111827",
      minHeight: "100vh",
      display: "flex",
    },
    leftPanel: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "48px",
      maxWidth: "600px",
      margin: "0 auto",
      width: "100%",
    },
    rightPanel: {
      flex: "1",
      backgroundColor: "#fafafa",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "80px",
      borderLeft: "1px solid #e5e7eb",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      textDecoration: "none",
      marginBottom: "64px",
    },
    logoBox: {
      width: "40px",
      height: "40px",
      backgroundColor: "#000",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: "18px",
    },
    logoText: {
      fontSize: "22px",
      fontWeight: 700,
      color: "#111827",
      letterSpacing: "-0.02em",
    },
    title: {
      fontSize: "32px",
      fontWeight: 800,
      color: "#111827",
      marginBottom: "12px",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "40px",
    },
    googleBtn: {
      width: "100%",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      backgroundColor: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: 500,
      color: "#374151",
      cursor: "pointer",
      marginBottom: "24px",
      transition: "all 0.2s",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "24px 0",
      color: "#9ca3af",
      fontSize: "13px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: "#e5e7eb",
    },
    dividerText: {
      padding: "0 16px",
    },
    inputGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      height: "48px",
      padding: "0 16px",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      fontSize: "15px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    submitBtn: {
      width: "100%",
      height: "48px",
      backgroundColor: "#000",
      color: "#fff",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      marginTop: "8px",
    },
    toggleBtn: {
      width: "100%",
      height: "48px",
      backgroundColor: "transparent",
      color: "#374151",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: 500,
      border: "1px solid #e5e7eb",
      cursor: "pointer",
    },
    footerLink: {
      display: "block",
      textAlign: "center",
      marginTop: "32px",
      fontSize: "14px",
      color: "#6b7280",
    },
    linkConfig: {
      color: "#111827",
      fontWeight: 600,
      textDecoration: "none",
    },
    // Right panel specific
    testimonial: {
      maxWidth: "480px",
    },
    quote: {
      fontSize: "32px",
      fontWeight: 700,
      lineHeight: 1.2,
      color: "#111827",
      letterSpacing: "-0.02em",
      marginBottom: "32px",
    },
    author: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    authorAvatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#e5e7eb",
    },
    authorInfo: {
      display: "flex",
      flexDirection: "column",
    },
    authorName: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    },
    authorRole: {
      fontSize: "14px",
      color: "#6b7280",
    },
    error: {
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#fef2f2",
      border: "1px solid #fee2e2",
      color: "#b91c1c",
      fontSize: "14px",
      marginBottom: "24px",
    },
  };

  return (
    <div style={styles.page}>
      {/* Left Panel - Login Form */}
      <div style={styles.leftPanel}>
        <div style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoBox}>L</div>
            <span style={styles.logoText}>LeadScore</span>
          </Link>

          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>
            Enter your details to access your account.
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            style={{ ...styles.googleBtn, opacity: isSubmitting ? 0.7 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
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
            Sign in with Google
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              style={styles.toggleBtn}
            >
              Continue with Email
            </button>
          ) : (
            <form onSubmit={handleEmailLogin}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
          )}

          <p style={styles.footerLink}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.linkConfig}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual/Testimonial */}
      {window.innerWidth > 1024 && (
        <div style={styles.rightPanel}>
          <div style={styles.testimonial}>
            <div
              style={{
                ...styles.logoBox,
                width: "48px",
                height: "48px",
                fontSize: "24px",
                marginBottom: "40px",
              }}
            >
              L
            </div>
            <h2 style={styles.quote}>
              "Transform your company, use the Lead Scoring engine provided by LeadScout to analyze outcomes"
            </h2>
            <div style={styles.author}>
              <div style={styles.authorInfo}>
                <div style={styles.authorName}>Sarah Chen</div>
                <div style={styles.authorRole}>VP of Sales at TechFlow</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
