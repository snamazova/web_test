import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const PublicationsList: React.FC = () => {
  const { publications } = useContent();
  
  // Sort publications by year (newest first)
  const sortedPublications = [...publications].sort((a, b) => b.year - a.year);
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Publications</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Publications</h2>
          <Link to="/admin/publications/new" className="add-button">
            Add New Publication
          </Link>
        </div>
        
        <div className="admin-list">
          {publications.length === 0 ? (
            <div className="empty-state">
              <p>No publications yet. Add your first publication to get started!</p>
            </div>
          ) : (
            sortedPublications.map(publication => (
              <div key={publication.id} className="admin-list-item">
                <div className="admin-item-title">
                  {publication.title}
                </div>
                <div className="admin-item-category">
                  {publication.journal}, {publication.year}
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/publications/edit/${publication.id}`} className="edit-button">
                    Edit
                  </Link>
                  {publication.url && (
                    <a 
                      href={publication.url} 
                      className="view-button" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PublicationsList;
