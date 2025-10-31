// Gantt View Component
import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

const GanttView = ({ projectId, projectStartDate, projectEndDate }) => {
  const { tasks, fetchTasks } = useTasks();
  const [viewMode, setViewMode] = useState('month'); // day, week, month, quarter
  const [loading, setLoading] = useState(true);
  const projectTasks = tasks[projectId] || [];

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId).finally(() => setLoading(false));
    }
  }, [projectId]);

  const getDateRange = () => {
    if (!projectStartDate && projectTasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const dates = projectTasks
      .map(task => task.dueDate ? new Date(task.dueDate) : null)
      .filter(Boolean);

    if (projectStartDate) {
      dates.push(new Date(projectStartDate));
    }
    if (projectEndDate) {
      dates.push(new Date(projectEndDate));
    }

    if (dates.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const sortedDates = dates.sort((a, b) => a - b);
    const start = sortedDates[0];
    const end = sortedDates[sortedDates.length - 1];

    // Add padding
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);

    return { start, end };
  };

  const getDaysBetween = (start, end) => {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskPosition = (task) => {
    const { start, end } = getDateRange();
    const totalDays = getDaysBetween(start, end);
    
    if (!task.dueDate) {
      return { left: 0, width: 0 };
    }

    const taskDate = new Date(task.dueDate);
    const daysFromStart = getDaysBetween(start, taskDate);
    const leftPercent = (daysFromStart / totalDays) * 100;
    
    // Estimate task duration (default 3 days if not specified)
    const duration = 3;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: Math.max(0, Math.min(leftPercent, 100)),
      width: Math.max(2, Math.min(widthPercent, 100 - leftPercent))
    };
  };

  const getTimelineColumns = () => {
    const { start, end } = getDateRange();
    const columns = [];
    const currentDate = new Date(start);

    if (viewMode === 'month') {
      while (currentDate <= end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        columns.push({
          label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          start: new Date(monthStart),
          end: new Date(monthEnd)
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else if (viewMode === 'week') {
      while (currentDate <= end) {
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        columns.push({
          label: `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          start: new Date(currentDate),
          end: new Date(weekEnd)
        });
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    return columns;
  };

  const getStatusColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const isOverdue = (task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.progress < 100;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading Gantt chart...</p>
      </div>
    );
  }

  const timelineColumns = getTimelineColumns();
  const { start: rangeStart, end: rangeEnd } = getDateRange();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gantt Chart</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {projectTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No tasks available. Create tasks to see them on the Gantt chart.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 pb-2 mb-2">
            <div className="w-48 flex-shrink-0 font-semibold text-gray-700">Task</div>
            <div className="flex-1 flex">
              {timelineColumns.map((column, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center text-sm text-gray-600 border-l border-gray-200 px-2"
                >
                  {column.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-1">
            {projectTasks.map((task, taskIdx) => {
              const position = getTaskPosition(task);
              const statusColor = getStatusColor(task.progress);
              const overdue = isOverdue(task);

              return (
                <div key={task.id} className="flex items-center py-2 border-b border-gray-100">
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${statusColor} ${
                          overdue ? 'ring-2 ring-red-500' : ''
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate" title={task.title}>
                        {task.title}
                      </span>
                      {overdue && (
                        <span className="text-xs text-red-600 font-medium">Overdue</span>
                      )}
                    </div>
                    {task.owner && (
                      <p className="text-xs text-gray-500 mt-1">{task.owner}</p>
                    )}
                  </div>

                  <div className="flex-1 relative h-8 bg-gray-50 rounded">
                    {/* Task Bar */}
                    {task.dueDate && position.width > 0 && (
                      <div
                        className={`absolute ${statusColor} rounded shadow-sm flex items-center justify-center text-white text-xs font-medium h-6 top-1`}
                        style={{
                          left: `${position.left}%`,
                          width: `${position.width}%`,
                          minWidth: '40px'
                        }}
                        title={`${task.title} - ${task.progress}% complete - Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                      >
                        {position.width > 10 && (
                          <span className="truncate px-2">{task.progress}%</span>
                        )}
                      </div>
                    )}

                    {/* Due Date Marker */}
                    {task.dueDate && !overdue && (
                      <div
                        className="absolute w-1 h-full bg-blue-600 top-0"
                        style={{
                          left: `${position.left + position.width}%`
                        }}
                        title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                      />
                    )}

                    {/* Overdue Marker */}
                    {overdue && (
                      <div
                        className="absolute w-1 h-full bg-red-600 top-0 animate-pulse"
                        style={{
                          left: `${position.left + position.width}%`
                        }}
                        title={`Overdue: ${new Date(task.dueDate).toLocaleDateString()}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-600">Not Started</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded ring-2 ring-red-500"></div>
              <span className="text-gray-600">Overdue</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttView;

