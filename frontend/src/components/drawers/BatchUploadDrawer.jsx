/**
 * FILE: src/components/drawers/BatchUploadDrawer.jsx
 * PURPOSE: Drawer for uploading CSV/JSON files with batch events
 * FUNCTIONALITY: Drag-and-drop file zone, preview, upload progress
 */

import { useState, useRef } from "react";
import { eventsApi } from "../../api/events.api";
import { useToast } from "../../context/ToastContext";

export default function BatchUploadDrawer({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".json")) {
      showToast("Please upload a .csv or .json file", "error");
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const response = await eventsApi.batchUpload(file);
      setResult(response);
      showToast(`${response.queued} events queued successfully!`, "success");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      showToast(`Upload failed: ${message}`, "error");
      setResult({ error: message });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-drawer-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Batch Upload Events
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload CSV or JSON file
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
              className="hidden"
            />
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">
              cloud_upload
            </span>
            <p className="text-sm text-slate-600 font-medium">
              {file ? file.name : "Drop file here or click to browse"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports .csv and .json files
            </p>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">
                  description
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setResult(null);
                  }}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Expected Format */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Expected CSV Format:
            </h4>
            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
              <code className="text-xs text-green-400 whitespace-pre">
                {`eventType,leadEmail,timestamp
page_view,user@example.com,2024-01-01
demo_request,lead@company.com,2024-01-02`}
              </code>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                result.error
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              {result.error ? (
                <p className="text-sm text-red-700">{result.error}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total events:</span>
                    <span className="font-bold text-slate-900">
                      {result.total}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Queued:</span>
                    <span className="font-bold text-emerald-700">
                      {result.queued}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duplicates skipped:</span>
                    <span className="font-medium text-slate-600">
                      {result.duplicates}
                    </span>
                  </div>
                  {result.errors?.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-500">Errors:</span>
                      <span className="font-medium text-red-600">
                        {result.errors.length}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  upload
                </span>
                Upload Events
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
