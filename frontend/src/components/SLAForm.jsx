// SLA Form Component
import React, { useState } from 'react';
import config from '../config';

const SLAForm = ({ projectId, sla = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: sla?.name || '',
    serviceDescription: sla?.serviceDescription || '',
    targetUptime: sla?.targetUptime || 99.90,
    responseTimeTarget: sla?.responseTimeTarget || 60,
    resolutionTimeTarget: sla?.resolutionTimeTarget || 240,
    penaltyClause: sla?.penaltyClause || '',
    aiRiskScore: sla?.aiRiskScore || 0,
    status: sla?.status || 'Active',
    startDate: sla?.startDate ? sla.startDate.split('T')[0] : '',
    endDate: sla?.endDate ? sla.endDate.split('T')[0] : ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('SLA name is required');
      return;
    }

    if (formData.targetUptime < 0 || formData.targetUptime > 100) {
      setError('Uptime target must be between 0 and 100');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const slaData = {
        projectId: parseInt(projectId),
        name: formData.name.trim(),
        serviceDescription: formData.serviceDescription.trim() || null,
        targetUptime: parseFloat(formData.targetUptime),
        responseTimeTarget: parseInt(formData.responseTimeTarget),
        resolutionTimeTarget: parseInt(formData.resolutionTimeTarget),
        penaltyClause: formData.penaltyClause.trim() || null,
        aiRiskScore: parseFloat(formData.aiRiskScore),
        status: formData.status,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      const url = sla
        ? `${config.API_BASE_URL}/api/sla/${sla.id}`
        : `${config.API_BASE_URL}/api/sla`;
      const method = sla ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save SLA');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to save SLA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {sla ? 'Edit SLA' : 'Create New SLA'}
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SLA Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 99.9% Uptime SLA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Description
          </label>
          <textarea
            value={formData.serviceDescription}
            onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the service covered by this SLA..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Uptime (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.targetUptime}
              onChange={(e) => setFormData({ ...formData, targetUptime: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Time (min) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.responseTimeTarget}
              onChange={(e) => setFormData({ ...formData, responseTimeTarget: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Time (min) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.resolutionTimeTarget}
              onChange={(e) => setFormData({ ...formData, resolutionTimeTarget: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Penalty Clause
          </label>
          <textarea
            value={formData.penaltyClause}
            onChange={(e) => setFormData({ ...formData, penaltyClause: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Penalty clause for SLA breach..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Risk Score (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.aiRiskScore}
              onChange={(e) => setFormData({ ...formData, aiRiskScore: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : sla ? 'Update SLA' : 'Create SLA'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SLAForm;

