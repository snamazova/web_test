import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const FundingSourcesList: React.FC = () => {
  const { fundingSources } = useContent();
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Funding Sources</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Funding Sources</h2>
          <Link to="/admin/funding/new" className="add-button">
            Add New Funding Source
          </Link>
        </div>
        
        <div className="admin-list">
          {fundingSources.length === 0 ? (
            <div className="empty-state">
              <p>No funding sources yet. Add your first funding source to get started!</p>
            </div>
          ) : (
            fundingSources.map(funding => (
              <div key={funding.id} className="admin-list-item">
                <div className="admin-item-logo">
                  {funding.logo ? (
                    <img 
                      src={funding.logo} 
                      alt={`${funding.name} logo`}
                      className="collaborator-logo-preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="no-logo-placeholder">No Logo</div>
                  )}
                </div>
                <div className="admin-item-title">{funding.name}</div>
                <div className="admin-item-category">
                  {funding.grantNumber && (
                    <span className="funding-grant-number">Grant: {funding.grantNumber}</span>
                  )}
                  <a 
                    href={funding.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="collaborator-link"
                  >
                    {funding.url}
                  </a>
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/funding/edit/${funding.id}`} className="edit-button">
                    Edit
                  </Link>
                  <a 
                    href={funding.url} 
                    className="view-button" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit
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

export default FundingSourcesList;
