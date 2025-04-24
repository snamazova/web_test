import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { cleanupStorage, resetNewsItems, repairTeamProjectAssociations } from '../../utils/debugStorage';
import { exportAsDefaultData } from '../../utils/exportDefaultData';
import '../../styles/admin.css';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { 
    projects, 
    teamMembers, 
    newsItems, 
    collaborators,
    fundingSources,
    publications, 
    software, 
    jobOpenings, 
    resetToDefaults,
    getFeaturedItems,
    topicColorRegistry
  } = useContent();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ key: string; size: number }[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const navigate = useNavigate();
  
  // Get current featured items
  const featuredItems = getFeaturedItems();

  // Count topic colors in the registry
  const topicColorsCount = Object.keys(topicColorRegistry || {}).length;

  useEffect(() => {
    // Calculate storage usage
    const calculateStorage = () => {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        items.push({ key, size: (value.length * 2) / 1024 }); // Size in KB (UTF-16 = 2 bytes per char)
      }
      setStorageInfo(items);
    };
    
    if (showDebugInfo) {
      calculateStorage();
    }
  }, [showDebugInfo]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }
  
  const clearStorage = () => {
    if (window.confirm('Are you sure you want to clear all localStorage data? This cannot be undone.')) {
      localStorage.clear(); // Clear all localStorage data
      window.location.reload();
    }
  };

  const handleCleanupNewsItems = () => {
    if (window.confirm('Cleanup news items? This will remove any corrupted items.')) {
      const success = cleanupStorage('newsItems');
      if (success) {
        alert('News items cleaned up. Please reload the page.');
        window.location.reload();
      } else {
        alert('Failed to clean up news items.');
      }
    }
  };

  const handleRepairAssociations = () => {
    if (window.confirm('Repair team-project associations? This will ensure consistency between teams and projects.')) {
      const changesApplied = repairTeamProjectAssociations();
      if (changesApplied) {
        alert('Team-project associations repaired. Please reload the page to see the changes.');
        window.location.reload();
      } else {
        alert('No issues found or couldn\'t repair associations.');
      }
    }
  };
  
  const handleResetNewsItems = () => {
    if (window.confirm('Reset news items? This will remove all news items and restore defaults.')) {
      resetNewsItems();
      alert('News items have been reset. Please reload the page.');
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetData = () => {
    resetToDefaults();
  };

  // New handler for exporting default data
  const handleExportDefaultData = () => {
    setShowExportModal(true);
  };

  // Function to navigate to management pages when clicking on a card
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const copyToClipboard = (type: string) => {
    const data = `export const ${type} = ${JSON.stringify(eval(type), null, 2)};`;
    navigator.clipboard.writeText(data).then(() => {
      alert(`${type}.ts copied to clipboard`);
    });
  };

  const handleImageDownload = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'image';
    link.click();
  };

  const downloadAllImages = () => {
    alert('Downloading all images as ZIP is not implemented yet.');
  };

  const DATA_TYPES = ['teamMembers', 'projects', 'newsItems', 'publications', 'software', 'collaborators', 'fundingSources', 'jobOpenings'];

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)} 
              className="debug-button"
              style={{ marginRight: '10px' }}
            >
              {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>

        {/* Export Default Data Modal */}
        {showExportModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Export Current Data as Default</h2>
              <p>This will generate TypeScript files containing your current data as the default data for the application.</p>
              <p>You can use these files to replace the corresponding files in the <code>src/data</code> directory of the project.</p>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowExportModal(false)} 
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExportDefaultData} 
                  className="primary-button"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug info section */}
        {showDebugInfo && (
          <div className="debug-info">
            <h3>Debug Information</h3>
            
            <div className="debug-actions">
              <button onClick={resetToDefaults} className="reset-button">
                Reset to Default Data
              </button>
              <button onClick={clearStorage} className="clear-button">
                Clear All Storage
              </button>
              <button onClick={handleRepairAssociations} className="repair-button">
                Fix Team-Project Links
              </button>
              <button onClick={() => window.location.reload()} className="reload-button">
                Reload Page
              </button>
            </div>

            {/* Improved Export Panel */}
            <div className="export-panel">
              <h4>Data Export Options</h4>
              
              <div className="data-export-section">
                <h5>Copy TypeScript Data Files</h5>
                <p>Copy individual files:</p>

                {DATA_TYPES.map(type => (
                  <div key={type} className="data-file">
                    <div className="file-header">
                      <h6>{type}.ts</h6>
                      <button 
                        onClick={() => copyToClipboard(type)} 
                        className="copy-button"
                      >
                        Copy Code
                      </button>
                    </div>
                    <pre>{`export const ${type} = ${JSON.stringify(
                      eval(type),
                      null,
                      2
                    )};`}</pre>
                  </div>
                ))}
              </div>

              <div className="image-assets-section">
                <h5>Download Image Assets</h5>
                <div className="asset-categories">
                  {/* Team Member Images */}
                  <div className="asset-category">
                    <h6>Team Member Images</h6>
                    <p>Place in: <code>public/assets/team/</code></p>
                    <div className="image-grid">
                      {teamMembers.map(member => member.imageUrl && (
                        <div key={member.id} className="image-preview-item">
                          <img 
                            src={member.imageUrl} 
                            alt={member.name}
                            className="image-preview"
                          />
                          <div className="image-info">
                            <span>{member.imageUrl.split('/').pop()}</span>
                            <a 
                              href={member.imageUrl} 
                              download 
                              className="download-link"
                              onClick={(e) => handleImageDownload(e, member.imageUrl)}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Images */}
                  <div className="asset-category">
                    <h6>Project Images</h6>
                    <p>Place in: <code>public/assets/projects/</code></p>
                    <div className="image-grid">
                      {projects.map(project => project.image && (
                        <div key={project.id} className="image-preview-item">
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="image-preview"
                          />
                          <div className="image-info">
                            <span>{project.image.split('/').pop()}</span>
                            <a 
                              href={project.image} 
                              download 
                              className="download-link"
                              onClick={(e) => handleImageDownload(e, project.image!)}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Software Images */}
                  <div className="asset-category">
                    <h6>Software Images</h6>
                    <p>Place in: <code>public/assets/software/</code></p>
                    <div className="image-grid">
                      {software.map(sw => sw.imageUrl && (
                        <div key={sw.id} className="image-preview-item">
                          <img 
                            src={sw.imageUrl} 
                            alt={sw.name}
                            className="image-preview"
                          />
                          <div className="image-info">
                            <span>{sw.imageUrl.split('/').pop()}</span>
                            <a 
                              href={sw.imageUrl} 
                              download 
                              className="download-link"
                              onClick={(e) => handleImageDownload(e, sw.imageUrl!)}
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={downloadAllImages}
                  className="download-all-button"
                >
                  Download All Images as ZIP
                </button>
              </div>
            </div>

            <div className="storage-info">
              <h4>Storage Usage</h4>
              <ul>
                {storageInfo.map((item) => (
                  <li key={item.key}>
                    {item.key}: {item.size.toFixed(2)} KB
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main dashboard cards */}
        <div className="admin-stats">
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/projects')}
          >
            <div className="admin-card-header">
              <h2>Projects</h2>
              <Link 
                to="/admin/projects/new" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{projects.length}</p>
              <p>Research projects</p>
            </div>
          </div>

          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/team')}
          >
            <div className="admin-card-header">
              <h2>Team</h2>
              <Link 
                to="/admin/team/new"
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{teamMembers.length}</p>
              <p>Team members</p>
            </div>
          </div>

          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/news')}
          >
            <div className="admin-card-header">
              <h2>News</h2>
              <Link 
                to="/admin/news/new"
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{newsItems.length}</p>
              <p>News items</p>
            </div>
          </div>

          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/publications')}
          >
            <div className="admin-card-header">
              <h2>Publications</h2>
              <Link 
                to="/admin/publications/new"
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{publications.length}</p>
              <p>Scientific publications</p>
            </div>
          </div>

          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/collaborators')}
          >
            <div className="admin-card-header">
              <h2>Collaborators</h2>
              <Link 
                to="/admin/collaborators/new"
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{collaborators.length}</p>
              <p>Academic & industry partners</p>
            </div>
          </div>

          {/* New Funding Sources Card */}
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/funding')}
          >
            <div className="admin-card-header">
              <h2>Funding</h2>
              <Link 
                to="/admin/funding/new"
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{fundingSources.length}</p>
              <p>Funding sources</p>
            </div>
          </div>

          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/software')}
          >
            <div className="admin-card-header">
              <h2>Software</h2>
              <Link 
                to="/admin/software/new" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{software.length}</p>
              <p>Software projects</p>
            </div>
          </div>

          {/* New Job Openings Card */}
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/jobs')}
          >
            <div className="admin-card-header">
              <h2>Job Openings</h2>
              <Link 
                to="/admin/jobs/new" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                + Add New
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{jobOpenings.length}</p>
              <p>Open positions</p>
            </div>
          </div>
          
          {/* Topic Colors Card - New card for managing topic colors centrally */}
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/topic-colors')}
          >
            <div className="admin-card-header">
              <h2>Topic Colors</h2>
              <Link 
                to="/admin/topic-colors" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                Manage
              </Link>
            </div>
            <div className="admin-card-content">
              <p className="admin-stats-number">{topicColorsCount}</p>
              <p>Topic/method colors used across projects</p>
            </div>
          </div>

          {/* Featured Content Card - Updated to be cleaner */}
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/featured')}
          >
            <div className="admin-card-header">
              <h2>Featured Content</h2>
              <Link 
                to="/admin/featured" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                Manage
              </Link>
            </div>
            <div className="admin-card-content featured-card-content">
              {/* Show only the featured items indicators */}
              <div className="featured-items-indicators">
                {featuredItems.projectId && (
                  <span className="featured-indicator">
                    <strong>Project:</strong> {projects.find(p => p.id === featuredItems.projectId)?.title.substring(0, 20)}
                    {projects.find(p => p.id === featuredItems.projectId)?.title.length! > 20 ? "..." : ""}
                  </span>
                )}
                {featuredItems.newsItemId && (
                  <span className="featured-indicator">
                    <strong>News:</strong> {newsItems.find(n => n.id === featuredItems.newsItemId)?.title.substring(0, 20)}
                    {newsItems.find(n => n.id === featuredItems.newsItemId)?.title.length! > 20 ? "..." : ""}
                  </span>
                )}
                {featuredItems.publicationId && (
                  <span className="featured-indicator">
                    <strong>Publication:</strong> {publications.find(p => p.id === featuredItems.publicationId)?.title.substring(0, 20)}
                    {publications.find(p => p.id === featuredItems.publicationId)?.title.length! > 20 ? "..." : ""}
                  </span>
                )}
                
                {/* Show message if no items are featured */}
                {!featuredItems.projectId && !featuredItems.newsItemId && !featuredItems.publicationId && (
                  <span className="no-featured-items">No items currently featured</span>
                )}
              </div>
            </div>
          </div>

          {/* Team Image Card */}
          <div 
            className="admin-card"
            onClick={() => handleNavigate('/admin/team-image')}
          >
            <div className="admin-card-header">
              <h2>Team Image</h2>
              <Link 
                to="/admin/team-image" 
                className="card-action-button"
                onClick={(e) => e.stopPropagation()}
              >
                Update
              </Link>
            </div>
            <div className="admin-card-content">
              <p>Update the team image displayed on the homepage</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
