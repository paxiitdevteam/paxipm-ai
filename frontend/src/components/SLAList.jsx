// SLA List Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const SLAList = ({ projectId, onSLASelect }) => {
  const [slas, setSLAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchSLAs();
    }
  }, [projectId]);

  const fetchSLAs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/sla/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch SLAs');
      }

      const data = await response.json();
      setSLAs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slaId) => {
    if (window.confirm('Are you sure you want to delete this SLA?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/sla/${slaId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete SLA');
        }

        setSLAs(slas.filter(s => s.id !== slaId));
      } catch (err) {
        alert(err.message || 'Failed to delete SLA');
      }
    }
  };

  const getFilteredSLAs = () => {
    if (filter === 'all') return slas;
    return slas.filter(s => s.status === filter);
  };

  const getRiskScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score >= 70) return 'bg-red-100 text-red-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading SLAs...</p>
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

  const filteredSLAs = getFilteredSLAs();

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
            All ({slas.length})
          </button>
          <button
            onClick={() => setFilter('Active')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({slas.filter(s => s.status === 'Active').length})
          </button>
        </div>
      </div>

      {filteredSLAs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No SLAs found. Create your first SLA!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSLAs.map((sla) => (
            <div
              key={sla.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onSLASelect && onSLASelect(sla)}
                    >
                      {sla.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskScoreColor(sla.aiRiskScore)}`}>
                      AI Risk: {sla.aiRiskScore || 0}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sla.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sla.status}
                    </span>
                  </div>

                  {sla.serviceDescription && (
                    <p className="text-sm text-gray-600 mb-2">{sla.serviceDescription}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Uptime Target:</span> {sla.targetUptime}%
                    </div>
                    <div>
                      <span className="font-medium">Response Time:</span> {sla.responseTimeTarget} min
                    </div>
                    <div>
                      <span className="font-medium">Resolution Time:</span> {sla.resolutionTimeTarget} min
                    </div>
                    {sla.startDate && (
                      <div>
                        <span className="font-medium">Start:</span> {new Date(sla.startDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {sla.penaltyClause && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                      <strong>Penalty Clause:</strong> {sla.penaltyClause}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(sla.id)}
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

export default SLAList;

