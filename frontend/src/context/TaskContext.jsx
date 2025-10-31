// Task Context for state management
import React, { createContext, useContext, useState } from 'react';
import config from '../config';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({}); // { projectId: [tasks] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchTasks = async (projectId) => {
    if (!token || !projectId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/tasks/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(prev => ({ ...prev, [projectId]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      const projectId = taskData.projectId;
      setTasks(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newTask]
      }));
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      const projectId = updatedTask.projectId;

      setTasks(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(t => 
          t.id === taskId ? updatedTask : t
        )
      }));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId, projectId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(t => t.id !== taskId)
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTasksByProject = (projectId) => {
    return tasks[projectId] || [];
  };

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByProject
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

