import React, { useState } from "react";
import { Link } from "react-router-dom";
import config from "../config";

export default function Home() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [charter, setCharter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!projectName || !description) {
      setError("Please fill in both project name and description");
      return;
    }

    setLoading(true);
    setError("");
    setCharter("");

    try {
      const res = await fetch(`${config.API_BASE_URL}/api/ai/charter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate charter");
      }

      setCharter(data.charter || "Charter generated successfully");
    } catch (err) {
      setError(err.message || "Failed to generate charter. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">PaxiPM AI</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Project Management
              <span className="block text-blue-600 mt-2">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automate project setup, predict risks, and generate insights with AI. 
              <span className="font-semibold text-gray-900">Built specifically for IT infrastructure and software delivery projects.</span>
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              From hardware refresh cycles (PCs, laptops, tablets, phones, iPads, and all enterprise devices) to AI-powered software delivery, PaxiPM AI helps you plan, execute, and deliver faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const aiSection = document.getElementById("ai-demo-section");
                  if (aiSection) {
                    aiSection.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
              >
                Try AI Project Setup
              </button>
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-200 transition shadow-lg"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* IT Project Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              We Deliver Complex IT and Software Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage IT infrastructure and software projects with precision. From hardware refresh cycles (PCs, tablets, phones, iPads) to AI-powered software delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                title: "Device Lifecycle & PC Refresh",
                desc: "End-to-end hardware rollout, configuration, and asset management for enterprise-scale refresh programs.",
                icon: "💻"
              },
              {
                title: "Network & Cloud Transformation",
                desc: "LAN/WAN upgrades, Wi-Fi redesigns, and hybrid cloud migration with Azure and AWS integration.",
                icon: "☁️"
              },
              {
                title: "Software & SaaS Delivery",
                desc: "Full-stack software development and delivery managed through Agile, Scrum, and AI-driven automation.",
                icon: "🚀"
              },
              {
                title: "Cybersecurity & Compliance",
                desc: "Zero Trust, MFA, GDPR, and ISO 27001-aligned project delivery with AI-powered risk management.",
                icon: "🔒"
              },
              {
                title: "ITIL & Service Management",
                desc: "Aligned with ITIL 4 for ITAM, ISAM, SLA tracking, and AI-assisted incident and change management workflows.",
                icon: "📋"
              },
              {
                title: "Event & Venue IT Systems",
                desc: "Digital infrastructure deployment for stadiums and venues, covering CRM, ticketing, and POS integrations.",
                icon: "🏟️"
              },
              {
                title: "DevOps & Automation",
                desc: "Continuous integration, Dockerized environments, and infrastructure automation through AI-enabled DevOps pipelines.",
                icon: "⚙️"
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features powered by AI to help you deliver IT infrastructure and software delivery projects on time and within budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Project Setup</h3>
              <p className="text-gray-600">
                Generate project charters, scope, and WBS automatically from simple descriptions. Save hours of manual work.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Prediction</h3>
              <p className="text-gray-600">
                AI analyzes project data to predict risks (0-100 score) and provides actionable recommendations before issues arise.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Dashboard</h3>
              <p className="text-gray-600">
                Real-time overview of all projects, overdue tasks, risk scores, and AI-generated alerts in one place.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Reports</h3>
              <p className="text-gray-600">
                Generate professional PMO reports, project summaries, and insights automatically with AI. Export in seconds.
              </p>
            </div>

            {/* Feature 5 - PC Refresh */}
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hardware Refresh Projects</h3>
              <p className="text-gray-600">
                Manage complete hardware refresh cycles: PCs, laptops, tablets, phones, iPads, and all enterprise devices. Track rollout, configuration, asset management, and migration planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Project Setup Demo Section */}
      <section id="ai-demo-section" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Project Setup Demo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Try it now! Describe your IT infrastructure or software delivery project, and our AI will generate a professional project charter and WBS instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Enterprise Hardware Refresh 2025 (PCs, tablets, phones, iPads)"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  className="border border-gray-300 rounded-lg p-3 w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your project: goals, scope, timeline, team size, key challenges..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !projectName || !description}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold w-full hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              {loading ? "Generating Charter..." : "Generate AI Charter"}
            </button>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {charter && (
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI-Generated Project Charter
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(charter);
                      alert("Charter copied to clipboard!");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="text-gray-700 text-sm whitespace-pre-wrap font-sans bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                    {charter}
                  </pre>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Create account to save and manage this charter →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes. No complex setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in seconds. No credit card required. Start managing projects immediately.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Project</h3>
              <p className="text-gray-600">
                Add project details or use AI to generate charter, scope, and WBS automatically from a simple description.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI Insights</h3>
              <p className="text-gray-600">
                Receive risk predictions, automated reports, and actionable recommendations to deliver projects successfully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose PaxiPM AI?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Save Time</h3>
                    <p className="text-gray-600">Automate project setup and reporting. Focus on delivery, not paperwork.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Predict Risks Early</h3>
                    <p className="text-gray-600">AI-powered risk prediction helps you identify and mitigate issues before they impact delivery.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Better Decisions</h3>
                    <p className="text-gray-600">Data-driven insights and AI recommendations help you make informed project decisions.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-orange-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Secure & Private</h3>
                    <p className="text-gray-600">Enterprise-grade security. Your data is isolated and protected. Built for teams of all sizes.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect For</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    IT Infrastructure Projects
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Software Delivery Projects
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hardware Refresh Projects
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Project Managers
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    PMO Teams
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Agile Teams
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Project Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join teams already using AI to deliver projects faster and smarter.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Get Started Free
          </Link>
          <p className="mt-6 text-blue-100 text-sm">
            Free forever plan • No credit card required • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">PaxiPM AI</h3>
              <p className="text-sm leading-relaxed">
                AI-powered project management specifically designed for IT infrastructure and software delivery projects. Perfect for hardware refresh cycles (PCs, tablets, phones, iPads), network transformations, and enterprise deployments.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                From hardware refresh cycles (all devices) to cloud migration, manage it all with AI.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Features</Link></li>
                <li><Link to="/" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/" className="hover:text-white">AI Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">About</Link></li>
                <li><Link to="/" className="hover:text-white">Blog</Link></li>
                <li><Link to="/" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} PaxiPM AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
