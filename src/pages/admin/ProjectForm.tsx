import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent, TopicColor } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { Project } from '../../data/projects';
import { generateTopicColor, hexToHsl, hslToHex, LAB_COLOR, getOpenMojiUrl } from '../../utils/colorUtils';

const MAX_EMOJIS = 3; // Maximum number of emojis allowed per project

// Define TopicWithColor interface to match the Project interface
interface TopicWithColor {
  name: string;
  color: string;
  hue: number;  // Using hue instead of lightness
}

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    teamMembers, 
    updateProject, 
    addProject, 
    deleteProject,
    topicColorRegistry, // Get the centralized topic color registry
  } = useContent();

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]); // Changed from string to string[]
  const [categoryInput, setCategoryInput] = useState('');
  const [team, setTeam] = useState<string[]>([]);
  const [image, setImage] = useState('');
  const [topics, setTopics] = useState<TopicWithColor[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [publications, setPublications] = useState<string[]>([]);
  const [publicationInput, setPublicationInput] = useState('');
  const [projectId, setProjectId] = useState('');
  const [emojiHexcodes, setEmojiHexcodes] = useState<string[]>([]);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [popularEmojis, setPopularEmojis] = useState<string[]>([
    '1F4BB', // laptop
    '1F4CA', // chart
    '1F4D0', // math
    '1F9E0', // brain
    '1F50D', // magnifying glass
    '1F680', // rocket
    '1F310', // globe
    '1F9EA', // test tube
    '1F52C', // microscope
    '1F4DA', // books
    '1F4C8', // chart increasing
    '1F916', // robot face
    '1F9B4', // bone
    '1F9EC', // dna
    '1F3EB', // school
    '1F9D1', // person
    '1F4AC', // speech bubble
    '1F4C4', // document
    '1F4F0', // newspaper
    '1F5C3', // card box
    '1F5C4', // file cabinet,
  ]);

  // Extract all unique topics from existing projects and the registry
  const existingMethods = React.useMemo(() => {
    // Start with topics from the centralized registry
    const registryTopics = Object.values(topicColorRegistry).map(topic => ({
      name: topic.name,
      color: topic.color,
      hue: topic.hue
    }));
    
    // Add topics from projects that might not be in the registry yet
    const allMethods = projects.flatMap(project => 
      (project.topics || []).map(methodName => {
        // First check if the topic exists in the registry
        const registryTopic = topicColorRegistry[methodName];
        if (registryTopic) {
          return {
            name: methodName,
            color: registryTopic.color,
            hue: registryTopic.hue
          };
        }
        
        // Otherwise, look for this method in any existing project
        const methodWithColor = projects
          .flatMap(p => p.topicsWithColors || [])
          .find(t => t && t.name === methodName);
          
        return {
          name: methodName,
          color: methodWithColor?.color || generateTopicColor(Math.round(Math.random() * 360)),
          hue: methodWithColor?.hue || 0
        };
      })
    );
    
    // Combine registry topics with project topics
    const combinedTopics = [...registryTopics, ...allMethods];
    
    // Remove duplicates by name
    const uniqueMethods = Array.from(
      combinedTopics.reduce((map, method) => {
        if (!map.has(method.name)) {
          map.set(method.name, method);
        }
        return map;
      }, new Map<string, TopicWithColor>())
    ).map(([_, method]) => method);
    
    return uniqueMethods.sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, topicColorRegistry]);
  
  // Extract all unique categories from existing projects
  const existingDisciplines = React.useMemo(() => {
    const allDisciplines = projects.flatMap(project => 
      typeof project.category === 'string' ? [project.category] :
      Array.isArray(project.category) ? project.category : []
    );
    return Array.from(new Set(allDisciplines)).sort();
  }, [projects]);
  
  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Constants for dropdown options
  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' }
  ];
  
  // Determine if we're in create mode or edit mode
  const isNewProject = !id || id === 'new';
  
  // Initialize a new project ID only once when creating a new project
  useEffect(() => {
    if (isNewProject && !projectId) {
      const newId = `project-${Date.now()}`;
      setProjectId(newId);
    }
  }, [isNewProject, projectId]);
  
  useEffect(() => {
    if (!isNewProject) {
      // Load existing data for edit mode
      const projectToEdit = projects.find(p => p.id === id);
      if (projectToEdit) {
        setProjectId(projectToEdit.id);
        setTitle(projectToEdit.title || '');
        setDescription(projectToEdit.description || '');
        
        // Handle category as either string or array
        if (typeof projectToEdit.category === 'string') {
          setCategories([projectToEdit.category]);
        } else if (Array.isArray(projectToEdit.category)) {
          setCategories(projectToEdit.category);
        } else {
          setCategories([]);
        }
        
        setTeam(projectToEdit.team || []);
        setImage(projectToEdit.image || '');
        
        // Handle topics - use registry colors where possible
        if (projectToEdit.topics) {
          const topicsWithUpdatedColors = projectToEdit.topics.map(topicName => {
            // First check if the topic exists in the registry
            const registryTopic = topicColorRegistry[topicName];
            if (registryTopic) {
              return {
                name: topicName,
                color: registryTopic.color,
                hue: registryTopic.hue
              };
            }
            
            // If not in registry, check if it has colors in the project
            const existingTopicWithColor = projectToEdit.topicsWithColors?.find(t => t.name === topicName);
            if (existingTopicWithColor) {
              return {
                name: topicName,
                color: existingTopicWithColor.color,
                hue: existingTopicWithColor.hue || 0
              };
            }
            
            // Otherwise generate a default color
            return {
              name: topicName,
              color: generateTopicColor(Math.round(Math.random() * 360)),
              hue: 0
            };
          });
          
          setTopics(topicsWithUpdatedColors);
        } else {
          setTopics([]);
        }
        
        setStatus(projectToEdit.status || 'ongoing');
        setStartDate(projectToEdit.startDate || '');
        setEndDate(projectToEdit.endDate || '');
        setPublications(projectToEdit.publications || []);
        
        // Set emoji data - convert from single to array if needed
        if (projectToEdit.emojiHexcodes) {
          setEmojiHexcodes(projectToEdit.emojiHexcodes);
        } else {
          setEmojiHexcodes([]);
        }
      } else {
        setError(`Could not find project with ID: ${id}`);
      }
    }
  }, [id, isNewProject, projects, topicColorRegistry]);
  
  // Team members selection
  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setTeam(selected);
  };

  // Topic management - modified to use registry colors
  const handleAddMethod = () => {
    if (topicInput.trim() && !topics.some(t => t.name === topicInput.trim())) {
      const topicName = topicInput.trim();
      
      // Check if topic exists in the registry
      const registryTopic = topicColorRegistry[topicName];
      
      if (registryTopic) {
        // Use color from the registry
        setTopics(prevTopics => [...prevTopics, {
          name: topicName,
          color: registryTopic.color,
          hue: registryTopic.hue
        }]);
      } else {
        // Generate a new color for the topic that will be added to registry later
        const newHue = Math.floor(Math.random() * 360);
        const newColor = generateTopicColor(newHue);
        
        setTopics(prevTopics => [...prevTopics, {
          name: topicName,
          color: newColor,
          hue: newHue
        }]);
      }
      
      setTopicInput('');
    }
  };
  
  const handleRemoveMethod = (methodName: string) => {
    setTopics(prevTopics => prevTopics.filter(topic => topic.name !== methodName));
  };

  // Handle selecting an existing topic from the dropdown
  const handleSelectExistingMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMethodName = e.target.value;
    if (selectedMethodName && !topics.some(t => t.name === selectedMethodName)) {
      // Find the selected method in existing methods
      const selectedMethod = existingMethods.find(t => t.name === selectedMethodName);
      
      if (selectedMethod) {
        setTopics(prevTopics => [...prevTopics, selectedMethod]);
      } else {
        // If not found, create a new one with default color
        const newHue = Math.floor(Math.random() * 360); // Random hue
        const newColor = generateTopicColor(newHue);
        setTopics(prevTopics => [...prevTopics, {
          name: selectedMethodName,
          color: newColor,
          hue: newHue
        }]);
      }
      
      // Reset the select dropdown after selection
      e.target.value = '';
    }
  };
  
  // Category management
  const handleAddDiscipline = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories(prevCategories => [...prevCategories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleRemoveDiscipline = (disciplineToRemove: string) => {
    setCategories(prevCategories => 
      prevCategories.filter(category => category !== disciplineToRemove)
    );
  };

  // Handle selecting an existing category
  const handleSelectExistingDiscipline = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDiscipline = e.target.value;
    if (selectedDiscipline && !categories.includes(selectedDiscipline)) {
      setCategories(prevCategories => [...prevCategories, selectedDiscipline]);
      e.target.value = ''; // Reset select after selection
    }
  };

  const handleDisciplineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDiscipline();
    }
  };

  // Publication management
  const handleAddPublication = () => {
    if (publicationInput.trim() && !publications.includes(publicationInput.trim())) {
      setPublications(prevPublications => [...prevPublications, publicationInput.trim()]);
      setPublicationInput('');
    }
  };
  
  const handleRemovePublication = (publicationToRemove: string) => {
    setPublications(prevPublications => 
      prevPublications.filter(publication => publication !== publicationToRemove)
    );
  };
  
  const handlePublicationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPublication();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !description || categories.length === 0) {
      setError('Please fill in all required fields and add at least one category');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      // Extract just the topic names for backward compatibility
      const topicNames = topics.map(topic => topic.name);
      
      // Construct the project object
      const projectData: Project = {
        id: projectId,
        title,
        description,
        category: categories.length === 1 ? categories[0] : categories, // Support both single string and array
        team,
        color: `radial-gradient(circle at center, ${LAB_COLOR} 0%, #005580 100%)`, // Use fixed gradient instead of team-based
        topics: topicNames,
        topicsWithColors: topics, // Now properly typed
        status,
        publications,
        emojiHexcodes // Add the emoji hexcodes array
      };
      
      // Only add fields if they have values
      if (image) projectData.image = image;
      if (startDate) projectData.startDate = startDate;
      if (endDate) projectData.endDate = endDate;
      
      console.log("Saving project:", projectData);
      
      if (isNewProject) {
        const addedProject = addProject(projectData);
        console.log("Added new project with ID:", addedProject.id);
      } else {
        updateProject(projectData);
        console.log("Updated existing project:", projectData.id);
      }
      
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error("Error saving project:", error);
      setError("An error occurred while saving the project.");
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setIsDeleting(true);
      deleteProject(projectId);
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    }
  };

  const handleEmojiSelect = (hexcode: string) => {
    // If emoji is already selected, remove it
    if (emojiHexcodes.includes(hexcode)) {
      setEmojiHexcodes(emojiHexcodes.filter(code => code !== hexcode));
      return;
    }
    
    // Add emoji if not at maximum
    if (emojiHexcodes.length < MAX_EMOJIS) {
      setEmojiHexcodes([...emojiHexcodes, hexcode]);
    } else {
      alert(`You can only select up to ${MAX_EMOJIS} emojis per project.`);
    }
  };

  const handleRemoveEmoji = (index: number) => {
    const newEmojis = [...emojiHexcodes];
    newEmojis.splice(index, 1);
    setEmojiHexcodes(newEmojis);
  };
  
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Project deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewProject ? 'Add Project' : 'Edit Project'}</h1>
        
        {formSubmitted && (
          <div className="success-message">
            Project successfully {isNewProject ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="title">Project Title*</label>
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
            <label>Disciplines*</label>
            <div className="topic-selection-container">
              {/* Dropdown for selecting existing disciplines */}
              <div className="existing-topics-dropdown">
                <select 
                  onChange={handleSelectExistingDiscipline}
                  defaultValue=""
                >
                  <option value="" disabled>Select existing discipline</option>
                  {existingDisciplines.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {/* Input for adding new disciplines */}
              <div className="topic-input-container">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={handleDisciplineKeyDown}
                  placeholder="Type a new discipline and press Enter"
                />
                <button 
                  type="button" 
                  onClick={handleAddDiscipline}
                  className="tag-add-button"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Display selected disciplines as tags */}
            <div className="topics-container">
              {categories.map(category => (
                <div key={category} className="topic-badge">
                  {category}
                  <button 
                    type="button" 
                    className="tag-remove" 
                    onClick={() => handleRemoveDiscipline(category)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {categories.length === 0 && (
              <p className="form-help-text">Please add at least one discipline</p>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ongoing' | 'completed')}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={status === 'ongoing'}
              />
              {status === 'ongoing' && (
                <p className="form-help-text">End date only available for completed projects</p>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="team">Team Members</label>
            <select
              id="team"
              multiple
              value={team}
              onChange={handleTeamChange}
              style={{ height: '120px' }}
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.name}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple team members</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Image URL (optional)</label>
            <input
              type="text"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {image && (
              <div className="image-preview">
                <img 
                  src={image} 
                  alt="Project preview" 
                  style={{ maxHeight: '150px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Methods/Topics</label>
            
            {/* Information notice about centralized color management */}
            <div className="topic-colors-notice" style={{ 
              backgroundColor: '#e6f7ff', 
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Note:</strong> Topic/method colors are now managed centrally for consistency across all projects.
                To change topic colors, please use the <Link to="/admin/topic-colors">Topic Colors</Link> management page.
              </p>
            </div>
            
            <div className="topic-selection-container">
              {/* Dropdown for selecting existing methods */}
              <div className="existing-topics-dropdown">
                <select 
                  onChange={handleSelectExistingMethod}
                  defaultValue=""
                >
                  <option value="" disabled>Select existing method</option>
                  {existingMethods.map(topic => (
                    <option key={topic.name} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Input for adding new methods */}
              <div className="topic-input-container">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMethod();
                    }
                  }}
                  placeholder="Type a new method and press Enter"
                />
                <button 
                  type="button" 
                  onClick={handleAddMethod}
                  className="tag-add-button"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Display selected methods with their colors (no editing) */}
            <div className="topics-container">
              {topics.map((topic) => (
                <div 
                  key={topic.name} 
                  className="topic-badge"
                  style={{ borderLeft: `4px solid ${topic.color}` }}
                >
                  <span>{topic.name}</span>
                  <button 
                    type="button" 
                    className="tag-remove" 
                    onClick={() => handleRemoveMethod(topic.name)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="publications">Publications</label>
            <div className="topic-input-container">
              <input
                type="text"
                value={publicationInput}
                onChange={(e) => setPublicationInput(e.target.value)}
                onKeyDown={handlePublicationKeyDown}
                placeholder="Add a publication reference"
              />
              <button 
                type="button" 
                onClick={handleAddPublication}
                className="topic-add-button"
              >
                Add
              </button>
            </div>
            <div className="topics-container">
              {publications.map((publication, index) => (
                <div key={index} className="topic-badge">
                  {publication}
                  <button 
                    type="button" 
                    className="topic-remove" 
                    onClick={() => handleRemovePublication(publication)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="projectEmojis">Project Emojis (up to {MAX_EMOJIS})</label>
            <div className="emoji-note">
              <p><small>Note: Emojis will appear in black and white style for a clean, professional look.</small></p>
            </div>
            <div className="emoji-selection-container">
              <div className="selected-emojis">
                {emojiHexcodes.length > 0 ? (
                  <div className="emoji-preview-grid">
                    {emojiHexcodes.map((hexcode, index) => (
                      <div key={index} className="selected-emoji-item">
                        <img 
                          src={getOpenMojiUrl(hexcode)}
                          alt="Selected emoji" 
                          className="emoji-preview-img"
                        />
                        <button
                          type="button"
                          className="remove-emoji-btn"
                          onClick={() => handleRemoveEmoji(index)}
                          title="Remove emoji"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emoji-placeholder">No emojis selected. Choose up to {MAX_EMOJIS}.</p>
                )}
              </div>
              
              <div className="emoji-picker">
                <h4>Popular Emojis:</h4>
                <div className="emoji-grid">
                  {popularEmojis.map(hexcode => (
                    <button
                      key={hexcode}
                      type="button"
                      className={`emoji-item ${emojiHexcodes.includes(hexcode) ? 'selected' : ''}`}
                      onClick={() => handleEmojiSelect(hexcode)}
                    >
                      <img 
                        src={getOpenMojiUrl(hexcode)} 
                        alt={`Emoji ${hexcode}`} 
                        title={`Hexcode: ${hexcode}`}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="emoji-custom-input">
                  <label>
                    <small>Add emoji by hexcode (e.g., 1F600):</small>
                  </label>
                  <div className="emoji-input-row">
                    <input
                      type="text"
                      placeholder="Enter emoji hexcode"
                      value={emojiSearch}
                      onChange={(e) => setEmojiSearch(e.target.value.toUpperCase())}
                      className="emoji-hexcode-input"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (emojiSearch) {
                          handleEmojiSelect(emojiSearch);
                          setEmojiSearch('');
                        }
                      }}
                      className="add-emoji-btn"
                      disabled={!emojiSearch || emojiHexcodes.length >= MAX_EMOJIS}
                    >
                      Add
                    </button>
                  </div>
                  <small className="emoji-help-text">
                    Find more emoji hexcodes at <a href="https://openmoji.org/" target="_blank" rel="noopener noreferrer">OpenMoji.org</a>
                  </small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            {!isNewProject && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete Project
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
                {isNewProject ? 'Add Project' : 'Update Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProjectForm;
