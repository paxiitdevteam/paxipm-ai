// Change Management Form Component
import React, { useState } from 'react';
import config from '../config';

const ChangeForm = ({ projectId, change = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: change?.title || '',
    description: change?.description || '',
    changeType: change?.changeType || 'Normal',
    status: change?.status || 'Requested',
    requestedBy: change?.requestedBy || '',
    approvedBy: change?.approvedBy || '',
    implementedBy: change?.implementedBy || '',
    implementationDate: change?.implementationDate ? change.implementationDate.split('T')[0] : '',
    rollbackPlan: change?.rollbackPlan || '',
    riskAssessment: change?.riskAssessment || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Change title is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const changeData = {
        projectId: parseInt(projectId),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        changeType: formData.changeType,
        status: formData.status,
        requestedBy: formData.requestedBy.trim() || null,
        approvedBy: formData.approvedBy.trim() || null,
        implementedBy: formData.implementedBy.trim() || null,
        implementationDate: formData.implementationDate || null,
        rollbackPlan: formData.rollbackPlan.trim() || null,
        riskAssessment: formData.riskAssessment.trim() || null
      };

      const url = change
        ? `${config.API_BASE_URL}/api/changes/${change.id}`
        : `${config.API_BASE_URL}/api/changes`;
      const method = change ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save change');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to save change');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {change ? 'Edit Change Request' : 'Create New Change Request'}
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Change Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Deploy v2.0 to production"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the change..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.changeType}
              onChange={(e) => setFormData({ ...formData, changeType: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">Standard</option>
              <option value="Normal">Normal</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Requested">Requested</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Implemented">Implemented</option>
              <option value="Rolled Back">Rolled Back</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested By
            </label>
            <input
              type="text"
              value={formData.requestedBy}
              onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Requester name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approved By
            </label>
            <input
              type="text"
              value={formData.approvedBy}
              onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Approver name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implemented By
            </label>
            <input
              type="text"
              value={formData.implementedBy}
              onChange={(e) => setFormData({ ...formData, implementedBy: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Implementer name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Date
          </label>
          <input
            type="date"
            value={formData.implementationDate}
            onChange={(e) => setFormData({ ...formData, implementationDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rollback Plan
          </label>
          <textarea
            value={formData.rollbackPlan}
            onChange={(e) => setFormData({ ...formData, rollbackPlan: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the rollback procedure..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Assessment
          </label>
          <textarea
            value={formData.riskAssessment}
            onChange={(e) => setFormData({ ...formData, riskAssessment: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Assess the risks of this change..."
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
            {loading ? 'Saving...' : change ? 'Update Change' : 'Create Change'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeForm;

