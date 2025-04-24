import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const SoftwareList: React.FC = () => {
  const { software } = useContent();
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Software</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Software</h2>
          <Link to="/admin/software/new" className="add-button">
            Add New Software
          </Link>
        </div>
        
        <div className="admin-list">
          {software.length === 0 ? (
            <div className="empty-state">
              <p>No software yet. Add your first software to get started!</p>
            </div>
          ) : (
            software.map(item => (
              <div key={item.id} className="admin-list-item">
                <div className="admin-item-title">
                  {item.name}
                  {item.featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                <div className="admin-item-category">
                  Technologies: {item.technologies.join(', ')}
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/software/edit/${item.id}`} className="edit-button">
                    Edit
                  </Link>
                  <a 
                    href={item.repoUrl} 
                    className="view-button" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Repository
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SoftwareList;
