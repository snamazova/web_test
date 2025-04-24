import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { JobOpening } from '../../data/jobOpenings';

const JobOpeningForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobOpenings, projects, updateJobOpening, addJobOpening, deleteJobOpening } = useContent();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [type, setType] = useState<JobOpening['type']>('Other');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [postedDate, setPostedDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [jobId, setJobId] = useState('');
  
  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in create mode or edit mode
  const isNewJobOpening = !id || id === 'new';
  
  // Initialize a new job ID only once when creating a new job opening
  useEffect(() => {
    if (isNewJobOpening && !jobId) {
      const newId = `job-${Date.now()}`;
      setJobId(newId);
      
      // Set default posted date to today
      setPostedDate(new Date().toISOString().split('T')[0]);
    }
  }, [isNewJobOpening, jobId]);
  
  // Define the predefined position types
  const positionTypes = [
    "Postdoctoral Researcher",
    "Doctoral Researcher", 
    "Student Research Assistant", 
    "Intern", 
    "Other"
  ] as const;
  
  useEffect(() => {
    if (!isNewJobOpening) {
      // Only load existing data for edit mode
      const jobToEdit = jobOpenings.find(job => job.id === id);
      if (jobToEdit) {
        setJobId(jobToEdit.id);
        setTitle(jobToEdit.title || '');
        setDescription(jobToEdit.description || '');
        setRequirements(jobToEdit.requirements || ['']);
        
        // Map legacy types to new position types if needed
        let positionType = jobToEdit.type as JobOpening['type'];
        if (positionType === 'full-time' || positionType === 'part-time') {
          positionType = "Other";
        } else if (positionType === 'postdoc') {
          positionType = "Postdoctoral Researcher";
        } else if (positionType === 'phd') {
          positionType = "Doctoral Researcher";
        } else if (positionType === 'internship') {
          positionType = "Intern";
        }
        
        setType(positionType);
        setLocation(jobToEdit.location || '');
        setContactEmail(jobToEdit.contactEmail || '');
        setApplicationUrl(jobToEdit.applicationUrl || '');
        setPostedDate(jobToEdit.postedDate || '');
        setClosingDate(jobToEdit.closingDate || '');
        setProjectId(jobToEdit.projectId || '');
        setIsOpen(jobToEdit.isOpen);
      } else {
        setError(`Could not find job opening with ID: ${id}`);
      }
    }
  }, [id, isNewJobOpening, jobOpenings]);

  // Handle requirements management
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };
  
  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };
  
  const handleRemoveRequirement = (index: number) => {
    if (requirements.length > 1) {
      const newRequirements = [...requirements];
      newRequirements.splice(index, 1);
      setRequirements(newRequirements);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !description || !location || !type || !postedDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Filter out empty requirements
    const filteredRequirements = requirements.filter(req => req.trim() !== '');
    if (filteredRequirements.length === 0) {
      setError('Please add at least one requirement');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Construct the job opening object
      const jobData: JobOpening = {
        id: jobId,
        title,
        description,
        requirements: filteredRequirements,
        type,
        location,
        postedDate,
        isOpen
      };
      
      // Add optional fields if they exist
      if (contactEmail) jobData.contactEmail = contactEmail;
      if (applicationUrl) jobData.applicationUrl = applicationUrl;
      if (closingDate) jobData.closingDate = closingDate;
      if (projectId) jobData.projectId = projectId;
      
      if (isNewJobOpening) {
        addJobOpening(jobData);
      } else {
        updateJobOpening(jobData);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin/jobs');
      }, 1500);
    } catch (error) {
      console.error("Error saving job opening:", error);
      setError("An error occurred while saving the job opening.");
    }
  };
  
  // Handle job opening deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job opening?')) {
      setIsDeleting(true);
      deleteJobOpening(jobId);
      setTimeout(() => {
        navigate('/admin/jobs');
      }, 1000);
    }
  };
  
  // Show deletion message
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Job opening deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewJobOpening ? 'Add Job Opening' : 'Edit Job Opening'}</h1>
        
        {/* Success message */}
        {formSubmitted && (
          <div className="success-message">
            Job opening successfully {isNewJobOpening ? 'added' : 'updated'}! Redirecting...
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
            <label htmlFor="title">Position Title*</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Requirements*</label>
            {requirements.map((req, index) => (
              <div key={index} className="requirement-input-row">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Requirement"
                  style={{ marginBottom: '5px' }}
                  required={index === 0}
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveRequirement(index)}
                  className="remove-button"
                  disabled={requirements.length <= 1 && index === 0}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddRequirement}
              className="add-field-button"
            >
              Add Requirement
            </button>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Position Type*</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as JobOpening['type'])}
                required
              >
                {positionTypes.map((positionType) => (
                  <option key={positionType} value={positionType}>
                    {positionType}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="On-site, Remote, or specific location"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="postedDate">Posted Date*</label>
              <input
                type="date"
                id="postedDate"
                value={postedDate}
                onChange={(e) => setPostedDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="closingDate">Closing Date (Optional)</label>
              <input
                type="date"
                id="closingDate"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="projectId">Related Project (Optional)</label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">None</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email (Optional)</label>
              <input
                type="email"
                id="contactEmail"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="applications@example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="applicationUrl">Application URL (Optional)</label>
              <input
                type="url"
                id="applicationUrl"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://forms.example.com/apply"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="isOpen">Status</label>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isOpen"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <span className="checkbox-label">Position is currently open</span>
            </div>
          </div>
          
          <div className="form-actions">
            {!isNewJobOpening && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Job Opening
              </button>
            )}
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin/jobs')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewJobOpening ? 'Add Job Opening' : 'Update Job Opening'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default JobOpeningForm;
