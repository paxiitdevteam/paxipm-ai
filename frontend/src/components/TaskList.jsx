// Task List Component
import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

const TaskList = ({ projectId, onTaskSelect }) => {
  const { tasks, loading, error, fetchTasks, deleteTask } = useTasks();
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed
  const projectTasks = tasks[projectId] || [];

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId]);

  const getFilteredTasks = () => {
    if (filter === 'all') return projectTasks;
    if (filter === 'pending') return projectTasks.filter(t => t.progress === 0);
    if (filter === 'in-progress') return projectTasks.filter(t => t.progress > 0 && t.progress < 100);
    if (filter === 'completed') return projectTasks.filter(t => t.progress === 100);
    return projectTasks;
  };

  const getStatusColor = (progress) => {
    if (progress === 100) return 'bg-green-100 text-green-700';
    if (progress > 0) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (progress) => {
    if (progress === 100) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Not Started';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && projectTasks.find(t => t.dueDate === dueDate)?.progress < 100;
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId, projectId);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({projectTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({projectTasks.filter(t => t.progress === 0).length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress ({projectTasks.filter(t => t.progress > 0 && t.progress < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({projectTasks.filter(t => t.progress === 100).length})
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tasks found. Create your first task to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onTaskSelect && onTaskSelect(task)}
                    >
                      {task.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.progress)}`}>
                      {getStatusText(task.progress)}
                    </span>
                    {isOverdue(task.dueDate) && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>

                  {task.owner && (
                    <p className="text-sm text-gray-600 mb-2">
                      Owner: <span className="font-medium">{task.owner}</span>
                    </p>
                  )}

                  {task.dueDate && (
                    <p className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-semibold text-gray-900">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;

