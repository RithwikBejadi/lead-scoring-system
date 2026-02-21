import { useState, useEffect } from "react";
import api from "../api/axios.config";

export default function Settings() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await api.get("/auth/project");
      setProject(response.data.data.project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-icons animate-spin text-blue-600 text-4xl">
          refresh
        </span>
      </div>
    );
  }

  const apiEndpoint = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const scriptSnippet = `<script 
  src="${apiEndpoint}/sdk/ls.js" 
  data-api-key="${project?.apiKey}"
></script>`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons">folder</span>
            Project Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={project?.name || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={project?._id || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons">key</span>
            API Key
          </h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-800 break-all flex-1">
                {project?.apiKey}
              </code>
              <button
                onClick={() => copyToClipboard(project?.apiKey)}
                className="ml-4 p-2 hover:bg-gray-200 rounded-md transition"
                title="Copy API Key"
              >
                <span className="material-icons text-gray-600">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ⚠️ Keep this key secret. Anyone with this key can send events to
            your project.
          </p>
        </div>

        {/* Integration Snippet */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="material-icons">code</span>
            Integration Snippet
          </h2>
          <p className="text-gray-700 mb-4">
            Add this script to your website's{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">&lt;head&gt;</code>{" "}
            section to start tracking:
          </p>
          <div className="bg-gray-900 p-4 rounded-md relative">
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{scriptSnippet}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(scriptSnippet)}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition"
              title="Copy snippet"
            >
              <span className="material-icons text-gray-400 text-sm">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              ✨ What It Does
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Automatic tracking</strong>: Page views, clicks, form
                submissions
              </li>
              <li>
                • <strong>Session tracking</strong>: Duration and engagement
                metrics
              </li>
              <li>
                • <strong>Custom events</strong>: Use{" "}
                <code className="bg-blue-100 px-1 rounded">
                  window.ls.track()
                </code>
              </li>
              <li>
                • <strong>User identification</strong>: Use{" "}
                <code className="bg-blue-100 px-1 rounded">
                  window.ls.identify()
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
