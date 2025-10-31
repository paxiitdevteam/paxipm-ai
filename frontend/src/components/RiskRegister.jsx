// Risk Register Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const RiskRegister = ({ projectId, onRiskSelect }) => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchRisks();
    }
  }, [projectId]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/risks/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (riskId) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/risks/${riskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete risk');
        }

        setRisks(risks.filter(r => r.id !== riskId));
      } catch (err) {
        alert(err.message || 'Failed to delete risk');
      }
    }
  };

  const getFilteredRisks = () => {
    if (filter === 'all') return risks;
    return risks.filter(r => r.status === filter);
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
        <p className="mt-2 text-gray-600">Loading risks...</p>
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

  const filteredRisks = getFilteredRisks();

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
            All ({risks.length})
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Open' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open ({risks.filter(r => r.status === 'Open').length})
          </button>
          <button
            onClick={() => setFilter('Mitigated')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Mitigated' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mitigated ({risks.filter(r => r.status === 'Mitigated').length})
          </button>
        </div>
      </div>

      {filteredRisks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No risks found. Create your first risk entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onRiskSelect && onRiskSelect(risk)}
                    >
                      {risk.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                      Score: {risk.riskScore || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      risk.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {risk.status}
                    </span>
                  </div>

                  {risk.description && (
                    <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {risk.probability && (
                      <span>Probability: <span className="font-medium">{risk.probability}</span></span>
                    )}
                    {risk.impact && (
                      <span>Impact: <span className="font-medium">{risk.impact}</span></span>
                    )}
                    {risk.owner && (
                      <span>Owner: <span className="font-medium">{risk.owner}</span></span>
                    )}
                  </div>

                  {risk.mitigationPlan && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                      <strong>Mitigation:</strong> {risk.mitigationPlan}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(risk.id)}
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

export default RiskRegister;

