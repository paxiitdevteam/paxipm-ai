// Issue Register Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const IssueRegister = ({ projectId, onIssueSelect }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchIssues();
    }
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/issues/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/issues/${issueId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete issue');
        }

        setIssues(issues.filter(i => i.id !== issueId));
      } catch (err) {
        alert(err.message || 'Failed to delete issue');
      }
    }
  };

  const getFilteredIssues = () => {
    if (filter === 'all') return issues;
    return issues.filter(i => i.status === filter);
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-gray-100 text-gray-700';
    if (severity === 'Critical') return 'bg-red-100 text-red-700';
    if (severity === 'High') return 'bg-orange-100 text-orange-700';
    if (severity === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading issues...</p>
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

  const filteredIssues = getFilteredIssues();

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
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Open' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open ({issues.filter(i => i.status === 'Open').length})
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Resolved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved ({issues.filter(i => i.status === 'Resolved').length})
          </button>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No issues found. Create your first issue entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onIssueSelect && onIssueSelect(issue)}
                    >
                      {issue.title}
                    </h4>
                    {issue.severity && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>

                  {issue.description && (
                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {issue.owner && (
                      <span>Owner: <span className="font-medium">{issue.owner}</span></span>
                    )}
                  </div>

                  {issue.resolution && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-gray-700">
                      <strong>Resolution:</strong> {issue.resolution}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(issue.id)}
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

export default IssueRegister;

