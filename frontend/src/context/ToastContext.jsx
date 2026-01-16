/**
 * FILE: context/ToastContext.jsx
 * PURPOSE: Provides toast notification functionality across the app
 * USAGE: Wrap app with ToastProvider, use useToast() hook to show toasts
 */

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      setToast({ message, type, id: Date.now() });

      // Auto-dismiss after duration
      setTimeout(() => {
        setToast(null);
      }, duration);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} onClose={hideToast} />}
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

// Toast component rendered by provider
function Toast({ message, type, onClose }) {
  const isSuccess = type === "success";

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] toast-enter">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border ${
          isSuccess
            ? "bg-white border-green-200 ring-1 ring-green-100"
            : "bg-white border-red-200 ring-1 ring-red-100"
        }`}
      >
        <div
          className={`rounded-full p-1 ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <span
            className={`material-symbols-outlined text-xl ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {isSuccess ? "check" : "error"}
          </span>
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold text-slate-800">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

export default ToastContext;
