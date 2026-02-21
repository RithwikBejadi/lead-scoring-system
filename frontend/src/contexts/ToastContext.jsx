/**
 * FILE: contexts/ToastContext.jsx
 * PURPOSE: Toast notification system for user feedback
 */

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const success = useCallback(
    (message) => showToast(message, "success"),
    [showToast],
  );

  const error = useCallback(
    (message) => showToast(message, "error"),
    [showToast],
  );

  const info = useCallback(
    (message) => showToast(message, "info"),
    [showToast],
  );

  const warning = useCallback(
    (message) => showToast(message, "warning"),
    [showToast],
  );

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    toasts,
    showToast,
    success,
    error,
    info,
    warning,
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px]
              animate-slide-in-right
              ${
                toast.type === "success"
                  ? "bg-green-500"
                  : toast.type === "error"
                    ? "bg-red-500"
                    : toast.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
