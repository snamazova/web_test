import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { TeamMember } from '../../data/team';

const TeamMemberForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamMembers, projects, updateTeamMember, addTeamMember, deleteTeamMember } = useContent();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isResizingImage, setIsResizingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const LAB_COLOR = '#00AAFF';
  const [memberProjects, setMemberProjects] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [memberId, setMemberId] = useState('');
  
  // New image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New CV upload states
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<string | null>(null);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  
  // Available projects for selection
  const [availableProjects, setAvailableProjects] = useState<{ id: string, title: string }[]>([]);
  
  // Determine if we're in create mode or edit mode
  const isNewMember = !id || id === 'new';
  
  // Initialize a new member ID only once when creating a new member
  useEffect(() => {
    if (isNewMember && !memberId) {
      const newId = `member-${Date.now()}`;
      setMemberId(newId);
      console.log("Created new team member ID:", newId);
    }
  }, [isNewMember, memberId]);
  
  useEffect(() => {
    // Always load available projects for selection
    const projectOptions = projects.map(project => ({
      id: project.id,
      title: project.title
    }));
    setAvailableProjects(projectOptions);
    
    if (!isNewMember) {
      // Only load existing data for edit mode
      const memberToEdit = teamMembers.find(m => m.id === id);
      if (memberToEdit) {
        console.log("Editing existing team member:", memberToEdit.name);
        setMemberId(memberToEdit.id);
        setName(memberToEdit.name || '');
        setRole(memberToEdit.role || '');
        setBio(memberToEdit.bio || '');
        setImageUrl(memberToEdit.imageUrl || '');
        setMemberProjects(memberToEdit.projects || []);
        setEmail(memberToEdit.email || '');
        setGithub(memberToEdit.github || '');
        setCvUrl(memberToEdit.cvUrl || '');
        
        // If there's an existing image URL and it's a base64 image, set it as uploaded
        if (memberToEdit.imageUrl && memberToEdit.imageUrl.startsWith('data:image/')) {
          setUploadedImage(memberToEdit.imageUrl);
        }
        
        // If there's an existing CV URL and it's a base64 PDF, set it as uploaded
        if (memberToEdit.cvUrl && memberToEdit.cvUrl.startsWith('data:application/pdf')) {
          setUploadedCV(memberToEdit.cvUrl);
        }
      } else {
        setError(`Could not find team member with ID: ${id}`);
        console.error(`Could not find team member with ID: ${id}`);
      }
    }
  }, [id, isNewMember, projects, teamMembers, navigate]);
  
  const handleProjectsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setMemberProjects(selected);
  };
  
  // Maximum dimensions for team member images - increasing to allow larger images
  const MAX_IMAGE_WIDTH = 800;  // Increased from 400 to 800
  const MAX_IMAGE_HEIGHT = 800; // Increased from 400 to 800
  
  // Function to resize large images - Adding clearer console logs and improved error handling
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsResizingImage(true);
      console.log(`Processing image: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB`);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          setIsResizingImage(false);
          reject(new Error('Failed to read image file'));
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          console.log(`Original dimensions: ${img.width}x${img.height}`);
          
          // Check if resize is needed
          if (img.width <= MAX_IMAGE_WIDTH && img.height <= MAX_IMAGE_HEIGHT && file.size <= 1024 * 1024) {
            console.log('Image already within acceptable dimensions and size, no resize needed');
            setIsResizingImage(false);
            resolve(e.target?.result as string);
            return;
          }
          
          // Calculate new dimensions while maintaining aspect ratio
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > MAX_IMAGE_WIDTH) {
            newHeight = Math.round((newHeight * MAX_IMAGE_WIDTH) / newWidth);
            newWidth = MAX_IMAGE_WIDTH;
          }
          
          if (newHeight > MAX_IMAGE_HEIGHT) {
            newWidth = Math.round((newWidth * MAX_IMAGE_HEIGHT) / newHeight);
            newHeight = MAX_IMAGE_HEIGHT;
          }
          
          console.log(`Resizing to: ${newWidth}x${newHeight}`);
          
          // Resize using canvas
          const canvas = canvasRef.current;
          if (!canvas) {
            setIsResizingImage(false);
            reject(new Error('Canvas not available'));
            return;
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            setIsResizingImage(false);
            reject(new Error('Canvas context not available'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to base64
          try {
            // Try to maintain original format when possible
            const format = file.type.includes('png') ? 'image/png' : 'image/jpeg';
            const quality = format === 'image/png' ? 1 : 0.85; // Lower quality for JPEGs to reduce size
            const resizedImage = canvas.toDataURL(format, quality);
            console.log('Image successfully resized');
            setIsResizingImage(false);
            resolve(resizedImage);
          } catch (err) {
            console.error('Error converting to data URL, falling back to JPEG', err);
            // Fallback to JPEG if there's an error
            const resizedImage = canvas.toDataURL('image/jpeg', 0.85);
            setIsResizingImage(false);
            resolve(resizedImage);
          }
        };
        
        img.onerror = () => {
          console.error('Failed to load image for resizing');
          setIsResizingImage(false);
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target.result as string;
      };
      
      reader.onerror = () => {
        console.error('Failed to read file for resizing');
        setIsResizingImage(false);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Handle image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpeg, png, gif, etc)');
      return;
    }
    
    // No longer rejecting large files, just notify user if resizing will happen
    if (file.size > 1024 * 1024) {
      console.log(`Large image detected (${(file.size / (1024 * 1024)).toFixed(2)}MB), will resize automatically`);
    }
    
    setIsUploading(true);
    setImageFile(file);
    setError(null); // Clear any previous errors
    
    try {
      // Process the image (resize if needed)
      const resizedImage = await resizeImage(file);
      setUploadedImage(resizedImage);
      setImageUrl(resizedImage); // Also update the imageUrl field
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try a different image.');
      // Don't set the image URL if processing failed
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clear uploaded image
  const handleClearUpload = () => {
    setUploadedImage(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle external URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Clear uploaded image if we're using an external URL
    if (url && !url.startsWith('data:image/')) {
      setUploadedImage(null);
    }
  };

  // Handle CV file upload
  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file for the CV');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('CV file size should be less than 5MB');
      return;
    }
    
    setIsUploadingCV(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedCV(base64);
      setCvUrl(base64); // Also update the cvUrl field
      setIsUploadingCV(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read the CV file');
      setIsUploadingCV(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Clear uploaded CV
  const handleClearCVUpload = () => {
    setUploadedCV(null);
    setCvUrl('');
    if (cvFileInputRef.current) {
      cvFileInputRef.current.value = '';
    }
  };
  
  // Handle CV URL input
  const handleCVUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCvUrl(url);
    
    // Clear uploaded CV if we're using an external URL
    if (url && !url.startsWith('data:application/pdf')) {
      setUploadedCV(null);
    }
  };

  // Show associated project titles for better UX
  const getProjectTitleById = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : `Unknown Project (${projectId})`;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !role || !bio) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Construct the team member object
      const memberData: TeamMember = {
        id: memberId,
        name,
        role,
        bio,
        imageUrl,
        color: LAB_COLOR, // Use fixed lab color
        projects: memberProjects
      };
      
      // Add optional fields if provided
      if (email) {
        memberData.email = email;
      }
      
      if (github) {
        memberData.github = github;
      }
      
      if (cvUrl) {
        memberData.cvUrl = cvUrl;
      }
      
      console.log("Submitting team member data with color:", memberData.color);
      
      if (isNewMember) {
        const addedMember = addTeamMember(memberData);
        console.log("Added new team member with ID:", addedMember.id);
      } else {
        updateTeamMember(memberData);
        console.log("Updated existing team member:", memberData.name);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error("Error saving team member:", error);
      setError("An error occurred while saving the team member.");
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setIsDeleting(true);
      deleteTeamMember(memberId);
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    }
  };
  
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Team member deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewMember ? 'Add Team Member' : 'Edit Team Member'}</h1>
        
        {/* Hidden canvas for image resizing */}
        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {formSubmitted && (
          <div className="success-message">
            Team member successfully {isNewMember ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Debug info */}
        <div style={{background: '#f8f9fa', padding: '10px', marginBottom: '15px', fontSize: '12px'}}>
          <strong>ID:</strong> {memberId}<br/>
          <strong>Mode:</strong> {isNewMember ? 'New' : 'Edit'}<br/>
          <strong>Name:</strong> {name}<br/>
          <strong>Selected Projects:</strong> {memberProjects.length > 0 ? 
            memberProjects.map(id => getProjectTitleById(id)).join(', ') : 
            'None'}
        </div>
        
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
            <label htmlFor="role">Role*</label>
            <input
              type="text"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio*</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: '1' }}>
              <label>Profile Image</label>
              
              <div className="image-upload-container">
                <div className="image-upload-options">
                  <div className="upload-option">
                    <label htmlFor="imageUpload" className="upload-label">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="file-input"
                    />
                    {isUploading && <span className="uploading-indicator">Uploading...</span>}
                    {isResizingImage && <span className="uploading-indicator">Resizing image, please wait...</span>}
                  </div>
                  
                  <div className="upload-option">
                    <label htmlFor="imageUrl">or Enter Image URL</label>
                    <input
                      type="text"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={handleUrlChange}
                      placeholder="http://example.com/image.jpg"
                      disabled={!!uploadedImage}
                    />
                  </div>
                </div>
                
                {uploadedImage && (
                  <div className="uploaded-image-preview">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      style={{ maxHeight: '150px', maxWidth: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={handleClearUpload}
                      className="clear-upload-button"
                    >
                      Clear Uploaded Image
                    </button>
                  </div>
                )}
                
                {imageUrl && !uploadedImage && (
                  <div className="image-preview">
                    <img 
                      src={imageUrl} 
                      alt="Member preview" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="form-help-text">
                Images larger than {MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT} pixels or 1MB will be automatically resized.
              </p>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="projects">Projects</label>
            <select
              id="projects"
              multiple
              value={memberProjects}
              onChange={handleProjectsChange}
              style={{ height: '120px' }}
            >
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple projects</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@university.edu"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="github">GitHub Username (Optional)</label>
            <input
              type="text"
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="username (without @)"
            />
            <p className="form-help-text">Just enter the username, not the full URL</p>
          </div>
          
          <div className="form-group">
            <label>CV (Optional)</label>
            
            <div className="cv-upload-container">
              <div className="cv-upload-options">
                <div className="upload-option">
                  <label htmlFor="cvUpload" className="upload-label">
                    Upload CV (PDF)
                  </label>
                  <input
                    type="file"
                    id="cvUpload"
                    ref={cvFileInputRef}
                    onChange={handleCVUpload}
                    accept="application/pdf"
                    className="file-input"
                  />
                  {isUploadingCV && <span className="uploading-indicator">Uploading...</span>}
                </div>
                
                <div className="upload-option">
                  <label htmlFor="cvUrl">or Enter CV URL</label>
                  <input
                    type="text"
                    id="cvUrl"
                    value={cvUrl}
                    onChange={handleCVUrlChange}
                    placeholder="/assets/cv/name_cv.pdf or https://example.com/cv.pdf"
                    disabled={!!uploadedCV}
                  />
                </div>
              </div>
              
              {uploadedCV && (
                <div className="uploaded-cv-preview">
                  <div className="cv-preview-info">
                    <span className="cv-file-icon">📄</span>
                    <span className="cv-file-name">CV uploaded successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCVUpload}
                    className="clear-upload-button"
                  >
                    Clear Uploaded CV
                  </button>
                </div>
              )}
              
              {cvUrl && !uploadedCV && cvUrl.endsWith('.pdf') && (
                <div className="cv-link-preview">
                  <span className="cv-file-icon">🔗</span>
                  <a 
                    href={cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cv-link"
                  >
                    View linked CV
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            {!isNewMember && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Team Member
              </button>
            )}
            <div className="right-buttons">
              <button 
                type="button" 
                onClick={() => navigate('/admin')} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewMember ? 'Add Team Member' : 'Update Team Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeamMemberForm;
