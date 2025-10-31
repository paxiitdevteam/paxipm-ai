import React, { useState } from "react";

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [charter, setCharter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setCharter("");
    
    try {
      const res = await fetch("http://localhost:5000/api/ai/charter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, description }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate charter");
      }
      
      const data = await res.json();
      setCharter(data.charter);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">PaxiPM AI</h1>
      <input
        className="border rounded p-2 w-80 mb-2"
        placeholder="Project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
      <textarea
        className="border rounded p-2 w-80 mb-4"
        placeholder="Project description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !projectName || !description}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Generating..." : "Generate Charter"}
      </button>
      
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-80">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {charter && (
        <div className="mt-6 bg-white p-4 shadow w-80">
          <h2 className="font-semibold mb-2">AI Charter Output</h2>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{charter}</p>
        </div>
      )}
    </div>
  );
}
