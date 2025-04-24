import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { FundingSource } from '../../data/funding';

const FundingSourceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fundingSources, updateFundingSource, addFundingSource, deleteFundingSource } = useContent();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [grantNumber, setGrantNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [fundingId, setFundingId] = useState('');
  
  // Determine if we're in create mode or edit mode
  const isNewFundingSource = !id || id === 'new';
  
  // Initialize a new funding source ID only once when creating a new funding source
  useEffect(() => {
    if (isNewFundingSource && !fundingId) {
      const newId = `funding-${Date.now()}`;
      setFundingId(newId);
    }
  }, [isNewFundingSource, fundingId]);
  
  useEffect(() => {
    if (!isNewFundingSource) {
      // Load existing data for edit mode
      const fundingToEdit = fundingSources.find(f => f.id === id);
      if (fundingToEdit) {
        setFundingId(fundingToEdit.id);
        setName(fundingToEdit.name || '');
        setUrl(fundingToEdit.url || '');
        setLogo(fundingToEdit.logo || '');
        setGrantNumber(fundingToEdit.grantNumber || '');
        setAmount(fundingToEdit.amount || '');
        setDuration(fundingToEdit.duration || '');
      } else {
        setError(`Could not find funding source with ID: ${id}`);
      }
    }
  }, [id, isNewFundingSource, fundingSources]);
  
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
      // Construct the funding source object
      const fundingData: FundingSource = {
        id: fundingId,
        name,
        url
      };
      
      // Add optional fields if provided
      if (logo) fundingData.logo = logo;
      if (grantNumber) fundingData.grantNumber = grantNumber;
      if (amount) fundingData.amount = amount;
      if (duration) fundingData.duration = duration;
      
      if (isNewFundingSource) {
        addFundingSource(fundingData);
      } else {
        updateFundingSource(fundingData);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin/funding');
      }, 1500);
    } catch (error) {
      console.error("Error saving funding source:", error);
      setError("An error occurred while saving the funding source.");
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this funding source?')) {
      setIsDeleting(true);
      deleteFundingSource(fundingId);
      setTimeout(() => {
        navigate('/admin/funding');
      }, 1000);
    }
  };
  
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Funding source deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewFundingSource ? 'Add Funding Source' : 'Edit Funding Source'}</h1>
        
        {formSubmitted && (
          <div className="success-message">
            Funding source successfully {isNewFundingSource ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Organization Name*</label>
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
            <label htmlFor="grantNumber">Grant Number (Optional)</label>
            <input
              type="text"
              id="grantNumber"
              value={grantNumber}
              onChange={(e) => setGrantNumber(e.target.value)}
              placeholder="e.g., NSF-1234567"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Grant Amount (Optional)</label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., $500,000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Duration (Optional)</label>
              <input
                type="text"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2022-2025"
              />
            </div>
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
            {!isNewFundingSource && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Funding Source
              </button>
            )}
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin/funding')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewFundingSource ? 'Add Funding Source' : 'Update Funding Source'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FundingSourceForm;
