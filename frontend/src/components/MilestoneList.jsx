// Milestone List Component
import React, { useState, useEffect } from 'react';
import { useMilestones } from '../context/MilestoneContext';

const MilestoneList = ({ projectId, onMilestoneSelect }) => {
  const { milestones, loading, error, fetchMilestones, deleteMilestone } = useMilestones();
  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const projectMilestones = milestones[projectId] || [];

  useEffect(() => {
    if (projectId) {
      fetchMilestones(projectId);
    }
  }, [projectId]);

  const getFilteredMilestones = () => {
    if (filter === 'all') return projectMilestones;
    if (filter === 'pending') return projectMilestones.filter(m => m.status === 'Pending');
    if (filter === 'completed') return projectMilestones.filter(m => m.status === 'Completed');
    if (filter === 'overdue') return projectMilestones.filter(m => m.isOverdue);
    return projectMilestones;
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue && status !== 'Completed') return 'bg-red-100 text-red-700';
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleDelete = async (milestoneId) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      await deleteMilestone(milestoneId, projectId);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading milestones...</p>
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

  const filteredMilestones = getFilteredMilestones();

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
            All ({projectMilestones.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({projectMilestones.filter(m => m.status === 'Pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({projectMilestones.filter(m => m.status === 'Completed').length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue ({projectMilestones.filter(m => m.isOverdue).length})
          </button>
        </div>
      </div>

      {/* Milestone List */}
      {filteredMilestones.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No milestones found. Create your first milestone!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onMilestoneSelect && onMilestoneSelect(milestone)}
                    >
                      {milestone.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(milestone.status, milestone.isOverdue)}`}>
                      {milestone.status}
                    </span>
                    {milestone.isOverdue && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        Overdue
                      </span>
                    )}
                    {milestone.isDueSoon && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        Due Soon
                      </span>
                    )}
                  </div>

                  {milestone.description && (
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Target: <span className={`font-medium ${milestone.isOverdue ? 'text-red-600' : ''}`}>
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    </span>
                    {milestone.completedDate && (
                      <span>
                        Completed: <span className="font-medium text-green-600">
                          {new Date(milestone.completedDate).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(milestone.id)}
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

export default MilestoneList;

