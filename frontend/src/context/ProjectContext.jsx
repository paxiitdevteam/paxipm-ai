// Project Context for state management
import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProjects = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = (projectId) => {
    return projects.find(p => p.id === parseInt(projectId));
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const value = {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

