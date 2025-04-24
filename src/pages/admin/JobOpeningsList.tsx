import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const JobOpeningsList: React.FC = () => {
  const { jobOpenings } = useContent();
  
  // Format job type for display
  const formatJobType = (type: string): string => {
    switch(type) {
      case 'full-time': return 'Full-time';
      case 'part-time': return 'Part-time';
      case 'internship': return 'Internship';
      case 'phd': return 'PhD Position';
      case 'postdoc': return 'Postdoctoral Position';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Job Openings</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Job Openings</h2>
          <Link to="/admin/jobs/new" className="add-button">
            Add New Position
          </Link>
        </div>
        
        <div className="admin-list">
          {jobOpenings.length === 0 ? (
            <div className="empty-state">
              <p>No job openings yet. Add your first position to get started!</p>
            </div>
          ) : (
            jobOpenings.map(job => (
              <div key={job.id} className="admin-list-item">
                <div className="admin-item-title">
                  {job.title}
                  {!job.isOpen && (
                    <span className="closed-badge">Closed</span>
                  )}
                </div>
                <div className="admin-item-category">
                  {formatJobType(job.type)} • {job.location}
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/jobs/edit/${job.id}`} className="edit-button">
                    Edit
                  </Link>
                  <Link to="/join-us" className="view-button">
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobOpeningsList;
