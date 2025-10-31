// File Upload Component
import React, { useState, useEffect } from 'react';
import config from '../config';

const FileUpload = ({ projectId, onFileUploaded }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    }
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/files/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`${config.API_BASE_URL}/api/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadedFile = await response.json();
      setFiles([uploadedFile, ...files]);
      setSelectedFile(null);
      setDescription('');
      document.getElementById('file-input').value = '';
      
      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      setError(err.message || 'Failed to delete file');
    }
  };

  const handleDownload = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/files/${file.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File <span className="text-red-500">*</span>
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the file..."
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Files ({files.length})</h3>

        {files.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No files uploaded yet. Upload your first file!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h4 className="font-medium text-gray-900">{file.original_name}</h4>
                  </div>
                  {file.description && (
                    <p className="text-sm text-gray-600 mb-1 ml-8">{file.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 ml-8">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{file.mime_type}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

