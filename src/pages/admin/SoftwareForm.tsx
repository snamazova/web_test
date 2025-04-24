import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { Software } from '../../data/software';

const SoftwareForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { software, projects, teamMembers, publications, updateSoftware, addSoftware, deleteSoftware } = useContent();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [technologyInput, setTechnologyInput] = useState('');
  const [developers, setDevelopers] = useState<string[]>([]);
  const [license, setLicense] = useState('');
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [publicationIds, setPublicationIds] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [releaseDate, setReleaseDate] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [softwareId, setSoftwareId] = useState('');
  
  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in create mode or edit mode
  const isNewSoftware = !id || id === 'new';
  
  // Initialize a new software ID only once when creating new software
  useEffect(() => {
    if (isNewSoftware && !softwareId) {
      const newId = `software-${Date.now()}`;
      setSoftwareId(newId);
    }
  }, [isNewSoftware, softwareId]);
  
  useEffect(() => {
    if (!isNewSoftware) {
      // Only load existing data for edit mode
      const softwareToEdit = software.find(item => item.id === id);
      if (softwareToEdit) {
        setSoftwareId(softwareToEdit.id);
        setName(softwareToEdit.name || '');
        setDescription(softwareToEdit.description || '');
        setImageUrl(softwareToEdit.imageUrl || '');
        setRepoUrl(softwareToEdit.repoUrl || '');
        setDemoUrl(softwareToEdit.demoUrl || '');
        setDocumentationUrl(softwareToEdit.documentationUrl || '');
        setTechnologies(softwareToEdit.technologies || []);
        setDevelopers(softwareToEdit.developers || []);
        setLicense(softwareToEdit.license || '');
        
        if (softwareToEdit.projectIds && softwareToEdit.projectIds.length > 0) {
          setProjectIds(softwareToEdit.projectIds);
        } else if (softwareToEdit.projectId) {
          setProjectIds([softwareToEdit.projectId]); 
        } else {
          setProjectIds([]);
        }
        
        setPublicationIds(softwareToEdit.publicationIds || []);
        
        setFeatured(softwareToEdit.featured || false);
        setReleaseDate(softwareToEdit.releaseDate || '');
        setLastUpdate(softwareToEdit.lastUpdate || '');
      } else {
        setError(`Could not find software with ID: ${id}`);
      }
    }
  }, [id, isNewSoftware, software]);

  // Technology management
  const handleAddTechnology = () => {
    if (technologyInput.trim() && !technologies.includes(technologyInput.trim())) {
      setTechnologies(prevTech => [...prevTech, technologyInput.trim()]);
      setTechnologyInput('');
    }
  };
  
  const handleRemoveTechnology = (techToRemove: string) => {
    setTechnologies(prevTech => prevTech.filter(tech => tech !== techToRemove));
  };
  
  const handleTechnologyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  // Developers selection
  const handleDevelopersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setDevelopers(selected);
  };
  
  // Projects selection
  const handleProjectsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setProjectIds(selected);
  };
  
  // Publications selection
  const handlePublicationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setPublicationIds(selected);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !description || !repoUrl || !license || technologies.length === 0) {
      setError('Please fill in all required fields and add at least one technology');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Construct the software object
      const softwareData: Software = {
        id: softwareId,
        name,
        description,
        repoUrl,
        technologies,
        developers,
        license
      };
      
      // Add optional fields if they exist
      if (imageUrl) softwareData.imageUrl = imageUrl;
      if (demoUrl) softwareData.demoUrl = demoUrl;
      if (documentationUrl) softwareData.documentationUrl = documentationUrl;
      if (projectIds.length > 0) {
        softwareData.projectIds = projectIds;
        softwareData.projectId = projectIds[0];
      }
      if (publicationIds.length > 0) {
        softwareData.publicationIds = publicationIds;
      }
      if (featured) softwareData.featured = featured;
      if (releaseDate) softwareData.releaseDate = releaseDate;
      if (lastUpdate) softwareData.lastUpdate = lastUpdate;
      
      if (isNewSoftware) {
        addSoftware(softwareData);
      } else {
        updateSoftware(softwareData);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin/software');
      }, 1500);
    } catch (error) {
      console.error("Error saving software:", error);
      setError("An error occurred while saving the software.");
    }
  };
  
  // Handle software deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this software?')) {
      setIsDeleting(true);
      deleteSoftware(softwareId);
      setTimeout(() => {
        navigate('/admin/software');
      }, 1000);
    }
  };
  
  // Show deletion message
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Software deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewSoftware ? 'Add Software' : 'Edit Software'}</h1>
        
        {/* Success message */}
        {formSubmitted && (
          <div className="success-message">
            Software successfully {isNewSoftware ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="repoUrl">Repository URL*</label>
            <input
              type="url"
              id="repoUrl"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/your-repo"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="demoUrl">Demo URL (optional)</label>
              <input
                type="url"
                id="demoUrl"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://demo.example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="documentationUrl">Documentation URL (optional)</label>
              <input
                type="url"
                id="documentationUrl"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                placeholder="https://docs.example.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.png"
            />
            {imageUrl && (
              <div className="image-preview">
                <img 
                  src={imageUrl} 
                  alt="Software preview" 
                  style={{ maxHeight: '150px', maxWidth: '100%' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Technologies*</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={technologyInput}
                onChange={(e) => setTechnologyInput(e.target.value)}
                onKeyDown={handleTechnologyKeyDown}
                placeholder="Type a technology and press Enter"
              />
              <button 
                type="button" 
                onClick={handleAddTechnology}
                className="tag-add-button"
              >
                Add
              </button>
            </div>
            <div className="tags-container">
              {technologies.map(tech => (
                <div key={tech} className="tag-badge">
                  {tech}
                  <button 
                    type="button" 
                    className="tag-remove" 
                    onClick={() => handleRemoveTechnology(tech)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {technologies.length === 0 && (
              <p className="form-help-text">Please add at least one technology</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="developers">Developers</label>
            <select
              id="developers"
              multiple
              value={developers}
              onChange={handleDevelopersChange}
              style={{ height: '120px' }}
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple developers</p>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="license">License*</label>
              <select
                id="license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                required
              >
                <option value="">Select a License</option>
                <option value="MIT">MIT</option>
                <option value="Apache 2.0">Apache 2.0</option>
                <option value="GPL v3">GPL v3</option>
                <option value="BSD">BSD</option>
                <option value="CC BY">Creative Commons (CC BY)</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="projectIds">Related Projects (optional)</label>
            <select
              id="projectIds"
              multiple
              value={projectIds}
              onChange={handleProjectsChange}
              style={{ height: '120px' }}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple projects</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="publicationIds">Related Publications (optional)</label>
            <select
              id="publicationIds"
              multiple
              value={publicationIds}
              onChange={handlePublicationsChange}
              style={{ height: '120px' }}
            >
              {publications.map(publication => (
                <option key={publication.id} value={publication.id}>
                  {publication.title} ({publication.year})
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple publications</p>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="releaseDate">Release Date (optional)</label>
              <input
                type="date"
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastUpdate">Last Update (optional)</label>
              <input
                type="date"
                id="lastUpdate"
                value={lastUpdate}
                onChange={(e) => setLastUpdate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="featured">Featured</label>
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span className="checkbox-label">Mark as featured software</span>
          </div>
          
          <div className="form-actions">
            {!isNewSoftware && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Software
              </button>
            )}
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin/software')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewSoftware ? 'Add Software' : 'Update Software'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SoftwareForm;
