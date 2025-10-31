// Asset List Component (ITAM)
import React, { useState, useEffect } from 'react';
import config from '../config';

const AssetList = ({ projectId, onAssetSelect }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      fetchAssets();
    }
  }, [projectId]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/itam/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/itam/${assetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete asset');
        }

        setAssets(assets.filter(a => a.id !== assetId));
      } catch (err) {
        alert(err.message || 'Failed to delete asset');
      }
    }
  };

  const getFilteredAssets = () => {
    if (filter === 'all') return assets;
    return assets.filter(a => a.status === filter || a.type === filter);
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Hardware': '💻',
      'Software': '📦',
      'Network': '🌐',
      'Cloud': '☁️',
      'Other': '📋'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    if (status === 'Active') return 'bg-green-100 text-green-700';
    if (status === 'In Repair') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  const filteredAssets = getFilteredAssets();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({assets.length})
          </button>
          <button
            onClick={() => setFilter('Active')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({assets.filter(a => a.status === 'Active').length})
          </button>
          <button
            onClick={() => setFilter('Hardware')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              filter === 'Hardware' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hardware ({assets.filter(a => a.type === 'Hardware').length})
          </button>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No assets found. Add your first asset!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(asset.type)}</span>
                    <h4
                      className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onAssetSelect && onAssetSelect(asset)}
                    >
                      {asset.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                    {asset.isWarrantyExpired && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        Warranty Expired
                      </span>
                    )}
                    {asset.isWarrantyExpiringSoon && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        Warranty Expiring Soon
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    {asset.owner && (
                      <div>
                        <span className="font-medium">Owner:</span> {asset.owner}
                      </div>
                    )}
                    {asset.location && (
                      <div>
                        <span className="font-medium">Location:</span> {asset.location}
                      </div>
                    )}
                    {asset.serialNumber && (
                      <div>
                        <span className="font-medium">Serial:</span> {asset.serialNumber}
                      </div>
                    )}
                    {asset.cost && (
                      <div>
                        <span className="font-medium">Cost:</span> ${asset.cost.toLocaleString()}
                      </div>
                    )}
                    {asset.purchaseDate && (
                      <div>
                        <span className="font-medium">Purchase:</span> {new Date(asset.purchaseDate).toLocaleDateString()}
                      </div>
                    )}
                    {asset.warrantyExpiry && (
                      <div>
                        <span className="font-medium">Warranty:</span> {new Date(asset.warrantyExpiry).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(asset.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetList;

