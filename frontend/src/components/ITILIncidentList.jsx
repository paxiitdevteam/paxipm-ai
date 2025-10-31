// ITIL Incident List Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const ITILIncidentList = ({ projectId, onIncidentSelect }) => {
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [slas, setSLAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchIncidents();
      fetchAssets();
      fetchSLAs();
    }
  }, [projectId]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/itil-incidents/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/itam/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  const fetchSLAs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/sla/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSLAs(data);
      }
    } catch (err) {
      console.error('Error fetching SLAs:', err);
    }
  };

  const handleDelete = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/itil-incidents/${incidentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete incident');
        }

        setIncidents(incidents.filter(i => i.id !== incidentId));
      } catch (err) {
        alert(err.message || 'Failed to delete incident');
      }
    }
  };

  const getFilteredIncidents = () => {
    if (filter === 'all') return incidents;
    return incidents.filter(i => i.status === filter || i.priority === filter);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Critical') return 'bg-red-100 text-red-700';
    if (priority === 'High') return 'bg-orange-100 text-orange-700';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusColor = (status) => {
    if (status === 'Open') return 'bg-red-100 text-red-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    if (status === 'Resolved') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getAssetName = (assetId) => {
    if (!assetId) return 'N/A';
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  const getSLAName = (slaId) => {
    if (!slaId) return 'N/A';
    const sla = slas.find(s => s.id === slaId);
    return sla ? sla.name : 'Unknown SLA';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading incidents...</p>
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

  const filteredIncidents = getFilteredIncidents();

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
            All ({incidents.length})
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Open' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open ({incidents.filter(i => i.status === 'Open').length})
          </button>
          <button
            onClick={() => setFilter('Critical')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Critical' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Critical ({incidents.filter(i => i.priority === 'Critical').length})
          </button>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No incidents found. Create your first incident!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onIncidentSelect && onIncidentSelect(incident)}
                    >
                      {incident.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                    {incident.isOverdue && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        Overdue
                      </span>
                    )}
                  </div>

                  {incident.description && (
                    <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    {incident.reportedBy && (
                      <div>
                        <span className="font-medium">Reported By:</span> {incident.reportedBy}
                      </div>
                    )}
                    {incident.assignedTo && (
                      <div>
                        <span className="font-medium">Assigned To:</span> {incident.assignedTo}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Asset:</span> {getAssetName(incident.assetId)}
                    </div>
                    <div>
                      <span className="font-medium">SLA:</span> {getSLAName(incident.slaId)}
                    </div>
                  </div>

                  {incident.resolution && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-gray-700">
                      <strong>Resolution:</strong> {incident.resolution}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(incident.id)}
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

export default ITILIncidentList;

