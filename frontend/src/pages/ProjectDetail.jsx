// Project Detail Page with Tasks and Budget
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjects } from "../context/ProjectContext";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import BudgetCard from "../components/BudgetCard";
import BudgetForm from "../components/BudgetForm";
import GanttView from "../components/GanttView";
import MilestoneList from "../components/MilestoneList";
import MilestoneForm from "../components/MilestoneForm";
import RiskRegister from "../components/RiskRegister";
import RiskForm from "../components/RiskForm";
import IssueRegister from "../components/IssueRegister";
import IssueForm from "../components/IssueForm";
import { useMilestones } from "../context/MilestoneContext";
import config from "../config";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById, updateProject, loading: projectLoading } = useProjects();
  const { createMilestone, updateMilestone } = useMilestones();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editingRisk, setEditingRisk] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, tasks, gantt, milestones, risks, issues, budget

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProject();
  }, [id, navigate]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${config.API_BASE_URL}/api/projects/${id}`, {
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

  const handleBudgetSave = async (budgetData) => {
    try {
      await updateProject(id, budgetData);
      await fetchProject(); // Refresh project data
      setShowBudgetForm(false);
    } catch (err) {
      throw new Error(err.message || "Failed to update budget");
    }
  };

  const handleTaskSuccess = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    fetchProject(); // Refresh to show updated task count
  };

  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskFormClose = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleMilestoneSuccess = () => {
    setShowMilestoneForm(false);
    setEditingMilestone(null);
    fetchProject();
  };

  const handleMilestoneEdit = (milestone) => {
    setEditingMilestone(milestone);
    setShowMilestoneForm(true);
  };

  const handleMilestoneFormClose = () => {
    setShowMilestoneForm(false);
    setEditingMilestone(null);
  };

  const handleRiskSuccess = () => {
    setShowRiskForm(false);
    setEditingRisk(null);
  };

  const handleRiskEdit = (risk) => {
    setEditingRisk(risk);
    setShowRiskForm(true);
  };

  const handleRiskFormClose = () => {
    setShowRiskForm(false);
    setEditingRisk(null);
  };

  const handleIssueSuccess = () => {
    setShowIssueForm(false);
    setEditingIssue(null);
  };

  const handleIssueEdit = (issue) => {
    setEditingIssue(issue);
    setShowIssueForm(true);
  };

  const handleIssueFormClose = () => {
    setShowIssueForm(false);
    setEditingIssue(null);
  };

  if (loading || projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/projects")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-2">{project.description || "No description"}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "tasks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("gantt")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "gantt"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Gantt
              </button>
              <button
                onClick={() => setActiveTab("milestones")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "milestones"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveTab("risks")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "risks"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Risks
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "issues"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Issues
              </button>
              <button
                onClick={() => setActiveTab("budget")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "budget"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Budget
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Client</label>
                    <p className="text-gray-900">{project.client || "Not specified"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <p className="text-gray-900">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <p className="text-gray-900">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.riskScore !== null && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Risk Score</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.riskScore >= 70
                                ? "bg-red-500"
                                : project.riskScore >= 40
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${project.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{project.riskScore}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Card */}
            <div>
              <BudgetCard
                budgetedAmount={project.budgetedAmount || 0}
                spentAmount={project.spentAmount || 0}
                currencyCode={project.currencyCode || "USD"}
              />
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Task
                </button>
              </div>

              {showTaskForm && (
                <div className="mb-6">
                  <TaskForm
                    projectId={id}
                    task={editingTask}
                    onClose={handleTaskFormClose}
                    onSuccess={handleTaskSuccess}
                  />
                </div>
              )}

              <TaskList projectId={id} onTaskSelect={handleTaskEdit} />
            </div>
          </div>
        )}

        {activeTab === "gantt" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <GanttView
                projectId={id}
                projectStartDate={project.startDate}
                projectEndDate={project.endDate}
              />
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
                <button
                  onClick={() => {
                    setEditingMilestone(null);
                    setShowMilestoneForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Milestone
                </button>
              </div>

              {showMilestoneForm && (
                <div className="mb-6">
                  <MilestoneForm
                    projectId={id}
                    milestone={editingMilestone}
                    onClose={handleMilestoneFormClose}
                    onSuccess={handleMilestoneSuccess}
                  />
                </div>
              )}

              <MilestoneList projectId={id} onMilestoneSelect={handleMilestoneEdit} />
            </div>
          </div>
        )}

        {activeTab === "risks" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Risk Register</h2>
                <button
                  onClick={() => {
                    setEditingRisk(null);
                    setShowRiskForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Risk
                </button>
              </div>

              {showRiskForm && (
                <div className="mb-6">
                  <RiskForm
                    projectId={id}
                    risk={editingRisk}
                    onClose={handleRiskFormClose}
                    onSuccess={handleRiskSuccess}
                  />
                </div>
              )}

              <RiskRegister projectId={id} onRiskSelect={handleRiskEdit} />
            </div>
          </div>
        )}

        {activeTab === "issues" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Issue Register</h2>
                <button
                  onClick={() => {
                    setEditingIssue(null);
                    setShowIssueForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Issue
                </button>
              </div>

              {showIssueForm && (
                <div className="mb-6">
                  <IssueForm
                    projectId={id}
                    issue={editingIssue}
                    onClose={handleIssueFormClose}
                    onSuccess={handleIssueSuccess}
                  />
                </div>
              )}

              <IssueRegister projectId={id} onIssueSelect={handleIssueEdit} />
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetCard
              budgetedAmount={project.budgetedAmount || 0}
              spentAmount={project.spentAmount || 0}
              currencyCode={project.currencyCode || "USD"}
            />
            {showBudgetForm ? (
              <BudgetForm
                project={project}
                onSave={handleBudgetSave}
                onClose={() => setShowBudgetForm(false)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Management</h2>
                <p className="text-gray-600 mb-4">
                  Update your project budget and track spending against the allocated amount.
                </p>
                <button
                  onClick={() => setShowBudgetForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Budget
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
