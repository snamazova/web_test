import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const FeaturedItemsForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    newsItems, 
    publications, 
    setFeaturedProject, 
    setFeaturedNewsItem, 
    setFeaturedPublication,
    getFeaturedItems
  } = useContent();
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedNewsItem, setSelectedNewsItem] = useState<string>('');
  const [selectedPublication, setSelectedPublication] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Load current featured items
  useEffect(() => {
    const featuredItems = getFeaturedItems();
    setSelectedProject(featuredItems.projectId || '');
    setSelectedNewsItem(featuredItems.newsItemId || '');
    setSelectedPublication(featuredItems.publicationId || '');
  }, [getFeaturedItems]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save the selected featured items
    if (selectedProject) {
      setFeaturedProject(selectedProject);
    }
    
    if (selectedNewsItem) {
      setFeaturedNewsItem(selectedNewsItem);
    }
    
    if (selectedPublication) {
      setFeaturedPublication(selectedPublication);
    }
    
    setFormSubmitted(true);
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/admin');
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>Manage Featured Items</h1>
        <p>Select which items should be featured on the homepage</p>
        
        {formSubmitted && (
          <div className="success-message">
            Featured items updated successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="featuredProject">Featured Project</label>
            <select
              id="featuredProject"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select a Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {selectedProject && (
              <div className="preview-selection">
                Selected: {projects.find(p => p.id === selectedProject)?.title}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="featuredNewsItem">Featured News Item</label>
            <select
              id="featuredNewsItem"
              value={selectedNewsItem}
              onChange={(e) => setSelectedNewsItem(e.target.value)}
            >
              <option value="">Select a News Item</option>
              {newsItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            {selectedNewsItem && (
              <div className="preview-selection">
                Selected: {newsItems.find(n => n.id === selectedNewsItem)?.title}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="featuredPublication">Featured Publication</label>
            <select
              id="featuredPublication"
              value={selectedPublication}
              onChange={(e) => setSelectedPublication(e.target.value)}
            >
              <option value="">Select a Publication</option>
              {publications.map(pub => (
                <option key={pub.id} value={pub.id}>
                  {pub.title}
                </option>
              ))}
            </select>
            {selectedPublication && (
              <div className="preview-selection">
                Selected: {publications.find(p => p.id === selectedPublication)?.title}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save Featured Items
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FeaturedItemsForm;
