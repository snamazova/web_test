import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const TeamImageForm: React.FC = () => {
  const navigate = useNavigate();
  const { getTeamImage, updateTeamImage } = useContent();
  
  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  
  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  
  // Reference for the preview container
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Load current team image on component mount
  useEffect(() => {
    const teamImage = getTeamImage();
    setCurrentImage(teamImage);
    setImageUrl(teamImage);
  }, [getTeamImage]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error states
    setError(null);
    
    // Validate image URL
    if (!imageUrl || imageUrl.trim() === '') {
      setError('Please enter an image URL');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Update the team image with the URL
      updateTeamImage(imageUrl);
      
      // Set success state
      setFormSubmitted(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error('Error updating team image:', error);
      setError('Failed to update team image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImagePreviewError(false);
  };
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>Update Team Image</h1>
        <p className="form-description">
          This image will be displayed on the home page. Please enter a URL for the image.
        </p>
        
        {formSubmitted && (
          <div className="success-message">
            Team image updated successfully! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/team-image.jpg"
            />
            <p className="form-help-text">Enter a direct URL to an image (JPG, PNG, WebP formats recommended)</p>
          </div>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="form-group">
              <label>Preview</label>
              <div className="image-preview" ref={previewRef}>
                <img
                  src={imageUrl}
                  alt="Team Preview"
                  onError={() => setImagePreviewError(true)}
                  style={{ display: imagePreviewError ? 'none' : 'block' }}
                />
                {imagePreviewError && (
                  <div className="preview-error">
                    Cannot load image from this URL. Please check the link and try again.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Current Image */}
          <div className="form-group">
            <label>Current Team Image</label>
            <div className="current-image">
              <img
                src={currentImage}
                alt="Current Team"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const errorText = document.createElement('div');
                  errorText.textContent = 'Current image cannot be displayed';
                  errorText.className = 'preview-error';
                  (e.target as HTMLImageElement).parentNode?.appendChild(errorText);
                }}
              />
            </div>
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
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Team Image'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeamImageForm;
