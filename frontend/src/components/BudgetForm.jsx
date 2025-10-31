// Budget Form Component
import React, { useState } from 'react';
import CurrencySelector, { formatCurrency } from './CurrencySelector';

const BudgetForm = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    budgetedAmount: project?.budgetedAmount || 0,
    spentAmount: project?.spentAmount || 0,
    currencyCode: project?.currencyCode || 'USD'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.budgetedAmount < 0 || formData.spentAmount < 0) {
      setError('Budget amounts cannot be negative');
      return;
    }

    if (onSave) {
      try {
        await onSave(formData);
        if (onClose) onClose();
      } catch (err) {
        setError(err.message || 'Failed to save budget');
      }
    }
  };

  const remainingBudget = formData.budgetedAmount - formData.spentAmount;
  const utilization = formData.budgetedAmount > 0 
    ? (formData.spentAmount / formData.budgetedAmount) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Budget</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <CurrencySelector
            value={formData.currencyCode}
            onChange={(value) => setFormData({ ...formData, currencyCode: value })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budgeted Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.budgetedAmount}
            onChange={(e) => setFormData({ ...formData, budgetedAmount: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(formData.budgetedAmount, formData.currencyCode)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spent Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.spentAmount}
            onChange={(e) => setFormData({ ...formData, spentAmount: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formatCurrency(formData.spentAmount, formData.currencyCode)}
          </p>
        </div>

        {/* Budget Summary */}
        {formData.budgetedAmount > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining:</span>
              <span className={`text-sm font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(remainingBudget, formData.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Utilization:</span>
              <span className="text-sm font-semibold text-gray-900">
                {utilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  remainingBudget < 0 ? 'bg-red-500' : utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        )}

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Budget
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;

