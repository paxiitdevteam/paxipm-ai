import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchReports(token);
  }, [navigate]);

  const fetchReports = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${config.API_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No reports yet. Generate reports using AI Tools!</p>
            <button
              onClick={() => navigate("/ai-tools")}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Go to AI Tools
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              let summaryData;
              try {
                summaryData = typeof report.summary === 'string' 
                  ? JSON.parse(report.summary) 
                  : report.summary;
              } catch (e) {
                summaryData = { text: report.summary };
              }

              return (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Report #{report.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {report.projectId && (
                      <button
                        onClick={() => navigate(`/projects/${report.projectId}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Project
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-4">
                    {summaryData.plain_text_report ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{summaryData.plain_text_report}</p>
                    ) : summaryData.text ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{summaryData.text}</p>
                    ) : (
                      <pre className="text-gray-700 text-sm overflow-auto">
                        {JSON.stringify(summaryData, null, 2)}
                      </pre>
                    )}
                  </div>

                  {summaryData.json_summary && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                      <pre className="text-gray-600 text-sm overflow-auto bg-gray-50 p-3 rounded">
                        {JSON.stringify(summaryData.json_summary, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

