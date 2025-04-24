import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { 
  generateTopicColor, 
  hexToHsl, 
  hslToHex,
  createTopicColorWithLabValues,
  updateColorHue,
  TOPIC_COLOR_LIGHTNESS,
  TOPIC_COLOR_SATURATION
} from '../../utils/colorUtils';

const TopicColorsForm: React.FC = () => {
  const navigate = useNavigate();
  const { 
    topicColorRegistry, 
    updateTopicColor, 
    addTopicColor, 
    removeTopicColor,
    projects
  } = useContent();

  // Form state for adding new topics
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicHue, setNewTopicHue] = useState(210); // Default blue hue
  
  // UI state
  const [message, setMessage] = useState<{text: string, isError: boolean} | null>(null);
  
  // Get all unique topics across all projects
  const allTopics = React.useMemo(() => {
    const projectTopics = projects.flatMap(project => 
      (project.topics || [])
    );
    return Array.from(new Set(projectTopics));
  }, [projects]);
  
  // Check for topics that exist in projects but not in the registry
  const missingTopics = React.useMemo(() => {
    return allTopics.filter(topic => !topicColorRegistry[topic]);
  }, [allTopics, topicColorRegistry]);
  
  // Add all missing topics to registry on component mount
  useEffect(() => {
    if (missingTopics.length > 0) {
      missingTopics.forEach(topic => {
        // Find if this topic has a color in any project
        for (const project of projects) {
          if (project.topicsWithColors) {
            const topicWithColor = project.topicsWithColors.find(t => t.name === topic);
            if (topicWithColor) {
              // Use hue from existing color but apply standardized saturation and lightness
              const [hue] = hexToHsl(topicWithColor.color);
              const standardizedColor = createTopicColorWithLabValues(hue);
              addTopicColor(topic, standardizedColor);
              return; // Added with standardized color
            }
          }
        }
        
        // If no color found in projects, generate a new one with standardized S/L values
        const hue = Math.round(Math.random() * 360);
        const color = createTopicColorWithLabValues(hue);
        addTopicColor(topic, color);
      });
      
      setMessage({
        text: `${missingTopics.length} topics were automatically added to the registry from projects.`,
        isError: false
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  }, [missingTopics, addTopicColor, projects]);

  // Handler for manually typing new topic hue
  const handleNewTopicHueInput = (hueStr: string) => {
    const hue = parseInt(hueStr, 10);
    if (!isNaN(hue)) {
      // Ensure hue is within 0-360 range
      setNewTopicHue(((hue % 360) + 360) % 360);
    }
  };
  
  // Handler for adding a new topic
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTopicName.trim()) {
      setMessage({
        text: 'Please enter a topic name',
        isError: true
      });
      return;
    }
    
    // Check if topic already exists
    if (topicColorRegistry[newTopicName.trim()]) {
      setMessage({
        text: `Topic "${newTopicName.trim()}" already exists`,
        isError: true
      });
      return;
    }
    
    // Add new topic to registry with the selected hue but standardized S/L values
    const standardizedColor = createTopicColorWithLabValues(newTopicHue);
    addTopicColor(newTopicName.trim(), standardizedColor);
    
    // Reset form
    setNewTopicName('');
    setNewTopicHue(210); // Reset to default hue
    
    // Show success message
    setMessage({
      text: `Topic "${newTopicName.trim()}" has been added to the registry`,
      isError: false
    });
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };
  
  // Handler for updating topic color - now only updates the hue
  const handleHueChange = (topicName: string, newHue: number) => {
    // Ensure hue is within 0-360 range
    const sanitizedHue = ((newHue % 360) + 360) % 360;
    const updatedColor = createTopicColorWithLabValues(sanitizedHue);
    updateTopicColor(topicName, updatedColor);
  };
  
  // Handler for manually typing hue value
  const handleHueInput = (topicName: string, hueStr: string) => {
    const hue = parseInt(hueStr, 10);
    if (!isNaN(hue)) {
      handleHueChange(topicName, hue);
    }
  };
  
  // Handler for deleting topics
  const handleDeleteTopic = (topicName: string) => {
    // Check if topic is used in any projects
    const topicInUse = projects.some(project => 
      project.topics && project.topics.includes(topicName)
    );
    
    if (topicInUse) {
      setMessage({
        text: `Cannot delete "${topicName}" as it is used in one or more projects`,
        isError: true
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the topic "${topicName}"?`)) {
      removeTopicColor(topicName);
      
      setMessage({
        text: `Topic "${topicName}" has been deleted from the registry`,
        isError: false
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };
  
  // Get topic usage count for each topic
  const getTopicUsage = (topicName: string): number => {
    return projects.filter(project => 
      project.topics && project.topics.includes(topicName)
    ).length;
  };
  
  // Sort topics by hue (spectral order)
  const sortedTopics = React.useMemo(() => {
    return Object.values(topicColorRegistry).sort((a, b) => {
      // Extract hue values from each topic's color
      const hueA = a.hue !== undefined ? a.hue : hexToHsl(a.color)[0];
      const hueB = b.hue !== undefined ? b.hue : hexToHsl(b.color)[0];
      
      // Sort by hue value (0-360 degrees)
      return hueA - hueB;
    });
  }, [topicColorRegistry]);
  
  return (
    <Layout>
      <div className="admin-form-container">
        <div className="admin-header">
          <h1>Topic Color Management</h1>
          <button 
            onClick={() => navigate('/admin')} 
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="topic-colors-explanation">
          <p>
            This page allows you to centrally manage all topic/method colors used across all projects.
            Changes made here will automatically be reflected in all projects that use these topics.
          </p>
          <p>
            You can select different <strong>hues</strong> for each topic. All topics use a fixed 
            saturation of {TOPIC_COLOR_SATURATION}% and lightness of {TOPIC_COLOR_LIGHTNESS}% for visual harmony.
          </p>
          <p>
            <strong>Note:</strong> In project gradients, topics will be arranged with lower hue values at the center,
            radiating outward to higher hue values.
          </p>
        </div>
        
        {message && (
          <div className={message.isError ? "error-message" : "success-message"}>
            {message.text}
          </div>
        )}
        
        <div className="topic-form-section">
          <h2>Add New Topic</h2>
          <form className="add-topic-form" onSubmit={handleAddTopic}>
            <div className="form-group">
              <label htmlFor="topicName">Topic Name</label>
              <input
                id="topicName"
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Enter topic name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="topicHue">Topic Hue</label>
              <div className="hue-input-container">
                <input
                  id="topicHue"
                  type="range"
                  min="0"
                  max="360"
                  value={newTopicHue}
                  onChange={(e) => setNewTopicHue(parseInt(e.target.value))}
                  className="hue-slider"
                />
                <div 
                  className="hue-preview" 
                  style={{ backgroundColor: createTopicColorWithLabValues(newTopicHue) }}
                >
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={newTopicHue}
                    onChange={(e) => handleNewTopicHueInput(e.target.value)}
                    className="hue-input"
                    aria-label="Hue value"
                  />°
                </div>
              </div>
            </div>
            
            <button type="submit" className="primary-button">
              Add Topic
            </button>
          </form>
        </div>
        
        <div className="topic-form-section">
          <h2>Existing Topics ({sortedTopics.length})</h2>
          
          <div className="topic-colors-grid">
            <div className="spectrum-indicator">
              <div className="hue-markers">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
            
            {sortedTopics.map(topic => {
              const usageCount = getTopicUsage(topic.name);
              const [hue] = hexToHsl(topic.color);
              
              return (
                <div key={topic.name} className="topic-color-item">
                  <div 
                    className="topic-color-preview"
                    style={{ backgroundColor: topic.color }}
                  >
                    <span>{topic.name}</span>
                    <span className="hue-badge">{Math.round(hue)}°</span>
                  </div>
                  
                  <div className="topic-color-actions">
                    <div className="hue-control-container">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hue}
                        onChange={(e) => handleHueChange(topic.name, parseInt(e.target.value))}
                        title="Change topic hue"
                        className="hue-slider"
                      />
                      <div className="hue-value-container">
                        <input
                          type="number"
                          min="0"
                          max="360"
                          value={Math.round(hue)}
                          onChange={(e) => handleHueInput(topic.name, e.target.value)}
                          onBlur={(e) => {
                            // Ensure valid value on blur
                            const value = parseInt(e.target.value);
                            if (isNaN(value) || value < 0 || value > 360) {
                              handleHueChange(topic.name, hue); // Reset to current value
                            }
                          }}
                          className="hue-input"
                        />
                        <span>°</span>
                      </div>
                    </div>
                    
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTopic(topic.name)}
                      title={usageCount > 0 ? "Cannot delete topics in use" : "Delete topic"}
                      disabled={usageCount > 0}
                    >
                      {usageCount > 0 ? `Used in ${usageCount} project${usageCount === 1 ? "" : "s"}` : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {sortedTopics.length === 0 && (
              <div className="no-topics-message">
                <p>No topics have been added to the registry yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TopicColorsForm;