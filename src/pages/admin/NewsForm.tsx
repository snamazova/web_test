import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { NewsItem } from '../../data/news';
import { getOpenMojiUrl } from '../../utils/colorUtils';

const NewsForm: React.FC = () => {
  // Get necessary parameters and context
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { newsItems, teamMembers, updateNewsItem, addNewsItem, deleteNewsItem } = useContent();
  
  // Create refs to track form state
  const formRef = useRef<HTMLFormElement>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newsId, setNewsId] = useState('');
  
  // Emoji state
  const [emojiHexcodes, setEmojiHexcodes] = useState<string[]>([]);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [emojiInput, setEmojiInput] = useState('');

  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Extract all existing unique tags from all news items
  const existingTags = React.useMemo(() => {
    const allTags = newsItems.flatMap(item => item.tags || []);
    return Array.from(new Set(allTags)).sort();
  }, [newsItems]);
  
  // Determine if we're in create mode or edit mode
  const isNewNewsItem = !id || id === 'new';
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize a new news ID only once when creating a new news item
  useEffect(() => {
    if (isNewNewsItem && !newsId) {
      const newId = `news-${Date.now()}`;
      setNewsId(newId);
      setDate(today);
      console.log("Created new news item ID:", newId);
    }
  }, [isNewNewsItem, newsId, today]);
  
  useEffect(() => {
    if (!isNewNewsItem) {
      // Only load existing data for edit mode
      const itemToEdit = newsItems.find(item => item.id === id);
      if (itemToEdit) {
        console.log("Editing existing news item:", itemToEdit.title);
        setNewsId(itemToEdit.id);
        setTitle(itemToEdit.title || '');
        setContent(itemToEdit.content || '');
        setDate(itemToEdit.date || today);
        setAuthor(itemToEdit.author || '');
        setImageUrl(itemToEdit.imageUrl || '');
        setFeatured(itemToEdit.featured || false);
        setTags(itemToEdit.tags || []);
        // Load emojis if they exist
        setEmojiHexcodes(itemToEdit.emojiHexcodes || []);
      } else {
        setErrorMessage(`Could not find news item with ID: ${id}`);
        console.error(`Could not find news item with ID: ${id}`);
      }
    }
  }, [id, isNewNewsItem, newsItems, today]);
  
  // Tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prevTags => [...prevTags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Handle selecting an existing tag from dropdown
  const handleSelectExistingTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags(prevTags => [...prevTags, selectedTag]);
      e.target.value = ''; // Reset select after selection
    }
  };

  // Emoji management
  const handleAddEmoji = () => {
    if (emojiInput.trim() && !emojiHexcodes.includes(emojiInput.trim())) {
      // Add the emoji without length restriction validation
      setEmojiHexcodes(prev => [...prev, emojiInput.trim()]);
      setEmojiInput('');
    }
  };

  const handleRemoveEmoji = (index: number) => {
    setEmojiHexcodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmoji();
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title || !content || !date || !author) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    // Clear any previous errors
    setErrorMessage(null);
    
    try {
      // Construct the news item object
      const newsItem: NewsItem = {
        id: newsId,
        title,
        content,
        date,
        author,
        featured,
        tags: [...tags]
      };
      
      // Only include imageUrl if it's not empty and no emojis are used
      if (imageUrl.trim() && emojiHexcodes.length === 0) {
        newsItem.imageUrl = imageUrl;
      }
      
      // Only include emojiHexcodes if they exist
      if (emojiHexcodes.length > 0) {
        newsItem.emojiHexcodes = [...emojiHexcodes];
      }
      
      console.log("Saving news item:", newsItem);
      
      if (isNewNewsItem) {
        const addedNewsItem = addNewsItem(newsItem);
        console.log("Added new news item with ID:", addedNewsItem.id);
      } else {
        updateNewsItem(newsItem);
        console.log("Updated existing news item:", newsItem.id);
      }
      
      // Show success message and redirect
      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      console.error("Error saving news item:", error);
      setErrorMessage("An error occurred while saving the news item.");
    }
  };
  
  // Handle deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      if (!newsId) {
        setErrorMessage("Cannot delete: no item ID found");
        return;
      }
      
      setIsDeleting(true);
      try {
        deleteNewsItem(newsId);
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } catch (error) {
        console.error("Error deleting news item:", error);
        setErrorMessage("An error occurred while deleting the news item.");
        setIsDeleting(false);
      }
    }
  };
  
  // Show deletion message
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            News item deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewNewsItem ? 'Add News Item' : 'Edit News Item'}</h1>
        
        {/* Success message */}
        {formSubmitted && (
          <div className="success-message">
            News item successfully {isNewNewsItem ? 'added' : 'updated'}! Redirecting...
          </div>
        )}
        
        {/* Error message */}
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        {/* Debug info */}
        <div style={{background: '#f8f9fa', padding: '10px', marginBottom: '15px', fontSize: '12px'}}>
          <strong>ID:</strong> {newsId}<br/>
          <strong>Mode:</strong> {isNewNewsItem ? 'New' : 'Edit'}<br/>
          <strong>Title:</strong> {title}
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content*</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date*</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="author">Author*</label>
              <select
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              >
                <option value="">Select Author</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Emoji selector */}
          <div className="form-group">
            <label>OpenMoji Emojis</label>
            <div className="emoji-note">
              <p>Adding OpenMoji emojis will replace the image for this news item with a solid color banner containing your selected emojis.</p>
            </div>
            
            <button 
              type="button" 
              className="toggle-emoji-selector"
              onClick={() => setShowEmojiSelector(!showEmojiSelector)}
            >
              {showEmojiSelector ? 'Hide Emoji Selector' : 'Show Emoji Selector'}
            </button>
            
            {showEmojiSelector && (
              <div className="emoji-selection-container">
                <div className="selected-emojis">
                  {emojiHexcodes.length > 0 ? (
                    <div className="emoji-preview-grid">
                      {emojiHexcodes.map((hexcode, index) => (
                        <div key={index} className="selected-emoji-item">
                          <div 
                            className="emoji-preview-bg" 
                            style={{ backgroundColor: '#00AAFF' }}
                          >
                            <img 
                              src={getOpenMojiUrl(hexcode)} 
                              alt={`OpenMoji ${hexcode}`}
                              className="emoji-preview-img"
                              onError={(e) => {
                                console.error(`Failed to load emoji with hexcode: ${hexcode}`);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <button 
                            type="button" 
                            className="remove-emoji-btn" 
                            onClick={() => handleRemoveEmoji(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="emoji-placeholder">No emojis selected yet</p>
                  )}
                </div>
                
                <div className="emoji-input-row">
                  <input
                    type="text"
                    value={emojiInput}
                    onChange={(e) => setEmojiInput(e.target.value)}
                    onKeyDown={handleEmojiKeyDown}
                    placeholder="Enter OpenMoji hexcode (e.g., 1F600)"
                    className="emoji-hexcode-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddEmoji}
                    className="add-emoji-btn"
                    disabled={!emojiInput.trim()}
                  >
                    Add
                  </button>
                </div>
                
                <div className="emoji-help-text">
                  <p>Find OpenMoji hexcodes at <a href="https://openmoji.org/library/" target="_blank" rel="noopener noreferrer">OpenMoji.org</a></p>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={emojiHexcodes.length > 0}
            />
            {emojiHexcodes.length > 0 && (
              <p className="emoji-note">Image URL is disabled because emojis are selected. Remove all emojis to use an image instead.</p>
            )}
            {imageUrl && emojiHexcodes.length === 0 && (
              <div className="image-preview">
                <img 
                  src={imageUrl} 
                  alt="News preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Tags</label>
            
            {/* Add dropdown for existing tags */}
            <div className="tag-selection-container">
              <select
                onChange={handleSelectExistingTag}
                defaultValue=""
                className="existing-tags-dropdown"
              >
                <option value="" disabled>Select existing tag</option>
                {existingTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            
              <div className="tag-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a tag and press Enter"
                />
                <button 
                  type="button" 
                  onClick={handleAddTag}
                  className="tag-add-button"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="tags-container">
              {tags.map(tag => (
                <div key={tag} className="tag-badge">
                  {tag}
                  <button 
                    type="button" 
                    className="tag-remove" 
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
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
            <span className="checkbox-label">Mark as featured news item</span>
          </div>
          
          <div className="form-actions">
            {!isNewNewsItem && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="delete-button"
              >
                Delete News Item
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
                {isNewNewsItem ? 'Add News Item' : 'Update News Item'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewsForm;