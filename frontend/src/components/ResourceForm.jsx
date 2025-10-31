// Resource Form Component
import React, { useState } from 'react';
import config from '../config';

const ResourceForm = ({ projectId, resource = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: resource?.name || '',
    role: resource?.role || '',
    email: resource?.email || '',
    allocationPercentage: resource?.allocationPercentage || 100,
    startDate: resource?.startDate ? resource.startDate.split('T')[0] : '',
    endDate: resource?.endDate ? resource.endDate.split('T')[0] : '',
    hourlyRate: resource?.hourlyRate || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }

    if (formData.allocationPercentage < 0 || formData.allocationPercentage > 100) {
      setError('Allocation percentage must be between 0 and 100');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const resourceData = {
        projectId: parseInt(projectId),
        name: formData.name.trim(),
        role: formData.role.trim() || null,
        email: formData.email.trim() || null,
        allocationPercentage: parseInt(formData.allocationPercentage),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
      };

      const url = resource
        ? `${config.API_BASE_URL}/api/resources/${resource.id}`
        : `${config.API_BASE_URL}/api/resources`;
      const method = resource ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save resource');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {resource ? 'Edit Resource' : 'Add New Resource'}
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., John Doe"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Developer, Designer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocation Percentage (0-100) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.allocationPercentage}
            onChange={(e) => setFormData({ ...formData, allocationPercentage: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100"
          />
          <p className="mt-1 text-xs text-gray-500">Percentage of time allocated to this project</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
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
            {loading ? 'Saving...' : resource ? 'Update Resource' : 'Add Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;

