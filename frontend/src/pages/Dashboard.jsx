import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [navigate]);

  const [stats, setStats] = useState({
    totalTasks: 0,
    overdueTasks: 0,
    totalMilestones: 0,
    overdueMilestones: 0,
    openRisks: 0,
    openIssues: 0,
    totalBudget: 0,
    spentBudget: 0
  });

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsRes = await fetch(`${config.API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let projectsData = [];
      if (projectsRes.ok) {
        projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      // Fetch reports
      const reportsRes = await fetch(`${config.API_BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // Fetch tasks, milestones, risks, issues for all projects
      let totalTasks = 0;
      let overdueTasks = 0;
      let totalMilestones = 0;
      let overdueMilestones = 0;
      let openRisks = 0;
      let openIssues = 0;
      let totalBudget = 0;
      let spentBudget = 0;

      for (const project of projectsData) {
        // Calculate budget
        totalBudget += project.budgetedAmount || 0;
        spentBudget += project.spentAmount || 0;

        // Fetch tasks
        try {
          const tasksRes = await fetch(`${config.API_BASE_URL}/api/tasks/project/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tasksRes.ok) {
            const tasks = await tasksRes.json();
            totalTasks += tasks.length;
            overdueTasks += tasks.filter(t => 
              t.dueDate && new Date(t.dueDate) < new Date() && t.progress < 100
            ).length;
          }
        } catch (err) {
          console.error(`Error fetching tasks for project ${project.id}:`, err);
        }

        // Fetch milestones
        try {
          const milestonesRes = await fetch(`${config.API_BASE_URL}/api/milestones/project/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (milestonesRes.ok) {
            const milestones = await milestonesRes.json();
            totalMilestones += milestones.length;
            overdueMilestones += milestones.filter(m => 
              m.targetDate && new Date(m.targetDate) < new Date() && m.status !== 'Completed'
            ).length;
          }
        } catch (err) {
          console.error(`Error fetching milestones for project ${project.id}:`, err);
        }

        // Fetch risks
        try {
          const risksRes = await fetch(`${config.API_BASE_URL}/api/risks/project/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (risksRes.ok) {
            const risks = await risksRes.json();
            openRisks += risks.filter(r => r.status === 'Open').length;
          }
        } catch (err) {
          console.error(`Error fetching risks for project ${project.id}:`, err);
        }

        // Fetch issues
        try {
          const issuesRes = await fetch(`${config.API_BASE_URL}/api/issues/project/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (issuesRes.ok) {
            const issues = await issuesRes.json();
            openIssues += issues.filter(i => i.status === 'Open').length;
          }
        } catch (err) {
          console.error(`Error fetching issues for project ${project.id}:`, err);
        }
      }

      setStats({
        totalTasks,
        overdueTasks,
        totalMilestones,
        overdueMilestones,
        openRisks,
        openIssues,
        totalBudget,
        spentBudget
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const totalReports = reports.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">PaxiPM AI Dashboard</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-gray-700">
                {user.name} ({user.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/projects")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Projects
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Reports
            </button>
            <button
              onClick={() => navigate("/ai-tools")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              AI Tools
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{activeProjects}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Completed Projects</h3>
            <p className="text-3xl font-bold text-green-600">{completedProjects}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Tasks</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalTasks}</p>
            {stats.overdueTasks > 0 && (
              <p className="text-sm text-red-600 mt-1">{stats.overdueTasks} overdue</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Milestones</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalMilestones}</p>
            {stats.overdueMilestones > 0 && (
              <p className="text-sm text-red-600 mt-1">{stats.overdueMilestones} overdue</p>
            )}
          </div>
        </div>

        {/* Stats Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Open Risks</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.openRisks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Open Issues</h3>
            <p className="text-3xl font-bold text-red-600">{stats.openIssues}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Budget</h3>
            <p className="text-2xl font-bold text-gray-800">${stats.totalBudget.toLocaleString()}</p>
            {stats.totalBudget > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {((stats.spentBudget / stats.totalBudget) * 100).toFixed(1)}% utilized
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-purple-600">{totalReports}</p>
          </div>
        </div>

        {/* Alerts Section */}
        {(stats.overdueTasks > 0 || stats.overdueMilestones > 0 || stats.openRisks > 0 || stats.openIssues > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Attention Required</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.overdueTasks > 0 && (
                <div className="bg-white rounded p-3 border border-yellow-300">
                  <p className="text-sm font-medium text-yellow-800">{stats.overdueTasks} Overdue Tasks</p>
                  <button
                    onClick={() => navigate("/projects")}
                    className="text-xs text-yellow-600 hover:underline mt-1"
                  >
                    View Tasks →
                  </button>
                </div>
              )}
              {stats.overdueMilestones > 0 && (
                <div className="bg-white rounded p-3 border border-yellow-300">
                  <p className="text-sm font-medium text-yellow-800">{stats.overdueMilestones} Overdue Milestones</p>
                  <button
                    onClick={() => navigate("/projects")}
                    className="text-xs text-yellow-600 hover:underline mt-1"
                  >
                    View Milestones →
                  </button>
                </div>
              )}
              {stats.openRisks > 0 && (
                <div className="bg-white rounded p-3 border border-orange-300">
                  <p className="text-sm font-medium text-orange-800">{stats.openRisks} Open Risks</p>
                  <button
                    onClick={() => navigate("/projects")}
                    className="text-xs text-orange-600 hover:underline mt-1"
                  >
                    View Risks →
                  </button>
                </div>
              )}
              {stats.openIssues > 0 && (
                <div className="bg-white rounded p-3 border border-red-300">
                  <p className="text-sm font-medium text-red-800">{stats.openIssues} Open Issues</p>
                  <button
                    onClick={() => navigate("/projects")}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    View Issues →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
            <button
              onClick={() => navigate("/projects")}
              className="text-blue-600 hover:underline text-sm"
            >
              View All
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet. Create your first project!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-700 font-medium">Title</th>
                    <th className="text-left py-2 text-gray-700 font-medium">Client</th>
                    <th className="text-left py-2 text-gray-700 font-medium">Status</th>
                    <th className="text-left py-2 text-gray-700 font-medium">Risk Score</th>
                    <th className="text-left py-2 text-gray-700 font-medium">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                      <td className="py-3 text-gray-800">{project.title}</td>
                      <td className="py-3 text-gray-600">{project.client || "N/A"}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            project.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Completed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {project.riskScore !== null && project.riskScore !== undefined ? (
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              project.riskScore >= 70
                                ? "bg-red-100 text-red-800"
                                : project.riskScore >= 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {project.riskScore}/100
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="py-3 text-gray-600">
                        {project.budgetedAmount > 0 ? (
                          <span className="text-sm">
                            {project.currencyCode || 'USD'} {project.budgetedAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/projects/new")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Create New Project
            </button>
            <button
              onClick={() => navigate("/ai-tools")}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Generate AI Charter
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              View Reports
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

