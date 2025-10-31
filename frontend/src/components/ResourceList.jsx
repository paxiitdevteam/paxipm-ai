// Resource List Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const ResourceList = ({ projectId, onResourceSelect }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchResources();
    }
  }, [projectId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/resources/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/resources/${resourceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete resource');
        }

        setResources(resources.filter(r => r.id !== resourceId));
      } catch (err) {
        alert(err.message || 'Failed to delete resource');
      }
    }
  };

  const getTotalAllocation = () => {
    return resources.reduce((sum, r) => sum + (r.allocationPercentage || 0), 0);
  };

  const getAllocationColor = (percentage) => {
    if (percentage > 100) return 'bg-red-100 text-red-700';
    if (percentage > 80) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading resources...</p>
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

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Resources</p>
            <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Allocation</p>
            <p className={`text-2xl font-bold ${getAllocationColor(getTotalAllocation()).split(' ')[0]} ${getAllocationColor(getTotalAllocation()).split(' ')[1]}`}>
              {getTotalAllocation()}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Allocation</p>
            <p className="text-2xl font-bold text-gray-900">
              {resources.length > 0 ? Math.round(getTotalAllocation() / resources.length) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Resources List */}
      {resources.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No resources assigned. Add your first resource!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onResourceSelect && onResourceSelect(resource)}
                    >
                      {resource.name}
                    </h4>
                    {resource.role && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {resource.role}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                    {resource.email && (
                      <div>
                        <span className="font-medium">Email:</span> {resource.email}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Allocation:</span>{' '}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAllocationColor(resource.allocationPercentage)}`}>
                        {resource.allocationPercentage}%
                      </span>
                    </div>
                    {resource.startDate && (
                      <div>
                        <span className="font-medium">Start:</span> {new Date(resource.startDate).toLocaleDateString()}
                      </div>
                    )}
                    {resource.endDate && (
                      <div>
                        <span className="font-medium">End:</span> {new Date(resource.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {resource.hourlyRate && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Hourly Rate:</span> ${resource.hourlyRate.toFixed(2)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(resource.id)}
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

export default ResourceList;

