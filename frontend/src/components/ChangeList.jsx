// Change Management List Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const ChangeList = ({ projectId, onChangeSelect }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchChanges();
    }
  }, [projectId]);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/changes/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch changes');
      }

      const data = await response.json();
      setChanges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (changeId) => {
    if (window.confirm('Are you sure you want to delete this change request?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/changes/${changeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete change');
        }

        setChanges(changes.filter(c => c.id !== changeId));
      } catch (err) {
        alert(err.message || 'Failed to delete change');
      }
    }
  };

  const getFilteredChanges = () => {
    if (filter === 'all') return changes;
    return changes.filter(c => c.status === filter || c.changeType === filter);
  };

  const getChangeTypeColor = (type) => {
    if (type === 'Emergency') return 'bg-red-100 text-red-700';
    if (type === 'Normal') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusColor = (status) => {
    if (status === 'Requested') return 'bg-yellow-100 text-yellow-700';
    if (status === 'In Review') return 'bg-blue-100 text-blue-700';
    if (status === 'Approved') return 'bg-green-100 text-green-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    if (status === 'Implemented') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading changes...</p>
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

  const filteredChanges = getFilteredChanges();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({changes.length})
          </button>
          <button
            onClick={() => setFilter('Requested')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Requested' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Requested ({changes.filter(c => c.status === 'Requested').length})
          </button>
          <button
            onClick={() => setFilter('Emergency')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Emergency' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Emergency ({changes.filter(c => c.changeType === 'Emergency').length})
          </button>
        </div>
      </div>

      {filteredChanges.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No change requests found. Create your first change request!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChanges.map((change) => (
            <div
              key={change.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onChangeSelect && onChangeSelect(change)}
                    >
                      {change.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getChangeTypeColor(change.changeType)}`}>
                      {change.changeType}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                      {change.status}
                    </span>
                  </div>

                  {change.description && (
                    <p className="text-sm text-gray-600 mb-2">{change.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    {change.requestedBy && (
                      <div>
                        <span className="font-medium">Requested By:</span> {change.requestedBy}
                      </div>
                    )}
                    {change.approvedBy && (
                      <div>
                        <span className="font-medium">Approved By:</span> {change.approvedBy}
                      </div>
                    )}
                    {change.implementedBy && (
                      <div>
                        <span className="font-medium">Implemented By:</span> {change.implementedBy}
                      </div>
                    )}
                    {change.implementationDate && (
                      <div>
                        <span className="font-medium">Implementation:</span> {new Date(change.implementationDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {change.rollbackPlan && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                      <strong>Rollback Plan:</strong> {change.rollbackPlan}
                    </div>
                  )}

                  {change.riskAssessment && (
                    <div className="mt-2 p-2 bg-orange-50 rounded text-sm text-gray-700">
                      <strong>Risk Assessment:</strong> {change.riskAssessment}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(change.id)}
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

export default ChangeList;

