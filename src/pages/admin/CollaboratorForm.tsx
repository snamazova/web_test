import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { Collaborator } from '../../data/collaborators';

const CollaboratorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { collaborators, updateCollaborator, addCollaborator, deleteCollaborator } = useContent();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [collabId, setCollabId] = useState('');
  
  // Determine if we're in create mode or edit mode
  const isNewCollaborator = !id || id === 'new';
  
  // Initialize a new collaborator ID only once when creating a new collaborator
  useEffect(() => {
    if (isNewCollaborator && !collabId) {
      const newId = `collab-${Date.now()}`;
      setCollabId(newId);
    }
  }, [isNewCollaborator, collabId]);
  
  useEffect(() => {
    if (!isNewCollaborator) {
      // Load existing data for edit mode
      const collabToEdit = collaborators.find(c => c.id === id);
      if (collabToEdit) {
        setCollabId(collabToEdit.id);
        setName(collabToEdit.name || '');
        setUrl(collabToEdit.url || '');
        setLogo(collabToEdit.logo || '');
      } else {
        setError(`Could not find collaborator with ID: ${id}`);
      }
    }
  }, [id, isNewCollaborator, collaborators]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !url) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Construct the collaborator object
      const collaboratorData: Collaborator = {
        id: collabId,
        name,
        url
      };
      
      // Add logo if provided
      if (logo) {
        collaboratorData.logo = logo;
      }
      
      if (isNewCollaborator) {
        addCollaborator(collaboratorData);
      } else {
        updateCollaborator(collaboratorData);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin/collaborators');
      }, 1500);
    } catch (error) {
      console.error("Error saving collaborator:", error);
      setError("An error occurred while saving the collaborator.");
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this collaborator?')) {
      setIsDeleting(true);
      deleteCollaborator(collabId);
      setTimeout(() => {
        navigate('/admin/collaborators');
      }, 1000);
    }
  };
  
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Collaborator deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewCollaborator ? 'Add Collaborator' : 'Edit Collaborator'}</h1>
        
        {formSubmitted && (
          <div className="success-message">
            Collaborator successfully {isNewCollaborator ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Collaborator Name*</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">Website URL*</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              required
            />
            <p className="form-help-text">Include http:// or https:// in the URL</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="logo">Logo URL (Optional)</label>
            <input
              type="url"
              id="logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://www.example.com/logo.png"
            />
            <p className="form-help-text">For best results, use a square image (max size: 100x100px)</p>
            
            {logo && (
              <div className="image-preview logo-preview">
                <img 
                  src={logo} 
                  alt={`${name} logo`} 
                  style={{ maxHeight: '100px', maxWidth: '100%' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = 'Unable to load image. Please check URL.';
                    errorMsg.className = 'error-text';
                    (e.target as HTMLImageElement).parentNode?.appendChild(errorMsg);
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            {!isNewCollaborator && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Collaborator
              </button>
            )}
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin/collaborators')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewCollaborator ? 'Add Collaborator' : 'Update Collaborator'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CollaboratorForm;
