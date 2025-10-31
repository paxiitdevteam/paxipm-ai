import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatAssistant from "../components/ChatAssistant";
import config from "../config";

export default function AITools() {
  const [activeTab, setActiveTab] = useState("chat");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">AI Tools</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === "chat"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              AI Chat Assistant
            </button>
            <button
              onClick={() => setActiveTab("charter")}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === "charter"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Generate Charter
            </button>
            <button
              onClick={() => setActiveTab("risk-analysis")}
              className={`px-6 py-3 font-medium ${
                activeTab === "risk-analysis"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Risk Analysis
            </button>
            <button
              onClick={() => setActiveTab("project-setup")}
              className={`px-6 py-3 font-medium ${
                activeTab === "project-setup"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Project Setup
            </button>
            <button
              onClick={() => setActiveTab("reporting")}
              className={`px-6 py-3 font-medium ${
                activeTab === "reporting"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Reporting
            </button>
            <button
              onClick={() => setActiveTab("pmo-report")}
              className={`px-6 py-3 font-medium ${
                activeTab === "pmo-report"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              PMO Report
            </button>
          </div>

          <div className="p-6">
            {activeTab === "chat" && (
              <div className="h-[600px]">
                <ChatAssistant />
              </div>
            )}
            {activeTab === "charter" && <CharterGenerator />}
            {activeTab === "risk-analysis" && <RiskAnalysisGenerator />}
            {activeTab === "project-setup" && <ProjectSetupGenerator />}
            {activeTab === "reporting" && <ReportingGenerator />}
            {activeTab === "pmo-report" && <PMOReportGenerator />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Charter Generator Component
function CharterGenerator() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/api/ai/charter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ projectName, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate charter");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Generate Project Charter</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={4}
            placeholder="Enter project description"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !projectName || !description}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Generating..." : "Generate Charter"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h3 className="font-semibold mb-2">Generated Charter:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result.charter}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Risk Analysis Generator Component
function RiskAnalysisGenerator() {
  const [projectDescription, setProjectDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      const res = await fetch(`${config.API_BASE_URL}/api/ai/risk-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectDescription,
          duration: parseInt(duration),
          teamSize: parseInt(teamSize),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate risk analysis");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk Analysis (Charter + WBS + Risks)</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={4}
            placeholder="Enter project description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="e.g., 12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
            <input
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="e.g., 5"
            />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !projectDescription || !duration || !teamSize}
          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Analyzing..." : "Generate Risk Analysis"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h3 className="font-semibold mb-2">Risk Analysis Results:</h3>
            <pre className="text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Project Setup Generator Component
function ProjectSetupGenerator() {
  const [project, setProject] = useState("");
  const [progress, setProgress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      const res = await fetch(`${config.API_BASE_URL}/api/ai/project-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project,
          progress: parseInt(progress),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate project setup");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Project Setup</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
          <input
            type="number"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g., 60"
            min="0"
            max="100"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !project || !progress}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Generating..." : "Generate Project Setup"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h3 className="font-semibold mb-2">Project Setup Results:</h3>
            <pre className="text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Reporting Generator Component
function ReportingGenerator() {
  const [progressData, setProgressData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(progressData);
      } catch (e) {
        throw new Error("Invalid JSON format for progress data");
      }

      const res = await fetch(`${config.API_BASE_URL}/api/ai/reporting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progressData: parsedData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Progress Reporting & Risk Rating</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progress Data (JSON)</label>
          <textarea
            value={progressData}
            onChange={(e) => setProgressData(e.target.value)}
            className="w-full border rounded p-2 font-mono text-sm"
            rows={8}
            placeholder='{"tasks": [], "delays": [], "resource_load": {}}'
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !progressData}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded p-4 mt-4">
            <h3 className="font-semibold mb-2">Report Results:</h3>
            <pre className="text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// PMO Report Generator Component
function PMOReportGenerator() {
  const [projectData, setProjectData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(projectData);
      } catch (e) {
        throw new Error("Invalid JSON format for project data");
      }

      const res = await fetch(`${config.API_BASE_URL}/api/ai/pmo-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectData: parsedData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate PMO report");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">PMO Status Report</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Data (JSON)</label>
          <textarea
            value={projectData}
            onChange={(e) => setProjectData(e.target.value)}
            className="w-full border rounded p-2 font-mono text-sm"
            rows={8}
            placeholder='{"project": {...}, "status": "...", "achievements": [], "blockers": []}'
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !projectData}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Generating..." : "Generate PMO Report"}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 rounded p-4 mt-4 space-y-4">
            {result.plain_text_report && (
              <div>
                <h3 className="font-semibold mb-2">Plain Text Report:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{result.plain_text_report}</p>
              </div>
            )}
            {result.json_summary && (
              <div>
                <h3 className="font-semibold mb-2">JSON Summary:</h3>
                <pre className="text-gray-700 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(result.json_summary, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

