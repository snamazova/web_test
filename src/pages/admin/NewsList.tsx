import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const NewsList: React.FC = () => {
  const { newsItems } = useContent();
  
  // Sort news items by date (newest first)
  const sortedNewsItems = [...newsItems].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage News</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>News Items</h2>
          <Link to="/admin/news/new" className="add-button">
            Add News Item
          </Link>
        </div>
        
        <div className="admin-list">
          {newsItems.length === 0 ? (
            <div className="empty-state">
              <p>No news items yet. Add your first news item to get started!</p>
            </div>
          ) : (
            sortedNewsItems.map(item => (
              <div key={item.id} className="admin-list-item">
                <div className="admin-item-title">
                  {item.title}
                  {item.featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                <div className="admin-item-category">
                  {formatDate(item.date)} • By {item.author}
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/news/edit/${item.id}`} className="edit-button">
                    Edit
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

export default NewsList;
