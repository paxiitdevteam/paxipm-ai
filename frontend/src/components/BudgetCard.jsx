// Budget Card Component
import React from 'react';
import { formatCurrency } from './CurrencySelector';

const BudgetCard = ({ budgetedAmount, spentAmount, currencyCode = 'USD', className = '' }) => {
  const remainingBudget = budgetedAmount - spentAmount;
  const budgetUtilization = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0;
  const isOverBudget = spentAmount > budgetedAmount;
  const isNearBudget = budgetUtilization >= 80 && budgetUtilization < 100;

  const getBudgetHealthColor = () => {
    if (isOverBudget) return 'bg-red-100 text-red-700 border-red-300';
    if (isNearBudget) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getBudgetHealthText = () => {
    if (isOverBudget) return 'Over Budget';
    if (isNearBudget) return 'Near Budget';
    return 'On Budget';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBudgetHealthColor()}`}>
          {getBudgetHealthText()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Budgeted</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(budgetedAmount, currencyCode)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Spent</span>
            <span className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(spentAmount, currencyCode)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className={`text-lg font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remainingBudget, currencyCode)}
            </span>
          </div>
        </div>

        {budgetedAmount > 0 && (
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Utilization</span>
              <span className="text-sm font-semibold text-gray-900">
                {budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;

