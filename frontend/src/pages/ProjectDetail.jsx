import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProject(id, token);
  }, [id, navigate]);

  const fetchProject = async (projectId, token) => {
    try {
      setLoading(true);
      const res = await fetch(`${config.API_BASE_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch project");
      }

      const data = await res.json();
      setProject(data);
    } catch (err) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Project not found"}</p>
          <button
            onClick={() => navigate("/projects")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/projects")}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-800">{project.description || "No description provided"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
              <p className="text-gray-800">{project.client || "N/A"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <span
                className={`px-3 py-1 rounded text-sm inline-block ${
                  project.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "Completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {project.status}
              </span>
            </div>

            {project.riskScore !== null && project.riskScore !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Score</h3>
                <span
                  className={`px-3 py-1 rounded text-sm inline-block ${
                    project.riskScore >= 70
                      ? "bg-red-100 text-red-800"
                      : project.riskScore >= 40
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {project.riskScore}/100
                </span>
              </div>
            )}

            {project.startDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Start Date</h3>
                <p className="text-gray-800">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
            )}

            {project.endDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">End Date</h3>
                <p className="text-gray-800">{new Date(project.endDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/ai-tools")}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Generate AI Charter
            </button>
            <button
              onClick={() => navigate("/ai-tools")}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
            >
              Calculate Risk Score
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

