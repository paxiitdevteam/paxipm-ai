// Milestone Context for state management
import React, { createContext, useContext, useState } from 'react';
import config from '../config';

const MilestoneContext = createContext();

export const useMilestones = () => {
  const context = useContext(MilestoneContext);
  if (!context) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
};

export const MilestoneProvider = ({ children }) => {
  const [milestones, setMilestones] = useState({}); // { projectId: [milestones] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchMilestones = async (projectId) => {
    if (!token || !projectId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/milestones/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch milestones');
      }

      const data = await response.json();
      setMilestones(prev => ({ ...prev, [projectId]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching milestones:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/milestones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(milestoneData)
      });

      if (!response.ok) {
        throw new Error('Failed to create milestone');
      }

      const newMilestone = await response.json();
      const projectId = milestoneData.projectId;
      setMilestones(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMilestone].sort((a, b) => 
          new Date(a.targetDate) - new Date(b.targetDate)
        )
      }));
      return newMilestone;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (milestoneId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      const updatedMilestone = await response.json();
      const projectId = updatedMilestone.projectId;

      setMilestones(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map(m => 
          m.id === milestoneId ? updatedMilestone : m
        ).sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
      }));
      return updatedMilestone;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (milestoneId, projectId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete milestone');
      }

      setMilestones(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter(m => m.id !== milestoneId)
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMilestonesByProject = (projectId) => {
    return milestones[projectId] || [];
  };

  const value = {
    milestones,
    loading,
    error,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByProject
  };

  return (
    <MilestoneContext.Provider value={value}>
      {children}
    </MilestoneContext.Provider>
  );
};

