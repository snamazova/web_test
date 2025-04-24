import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const CollaboratorsList: React.FC = () => {
  const { collaborators, reorderCollaborators, deleteCollaborator } = useContent();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const collaboratorsRef = useRef<HTMLDivElement>(null);
  
  // Enable reorder mode
  const toggleReorderMode = () => {
    setReorderMode(!reorderMode);
  };

  // Handle drag start
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Handle drop - reorder collaborators
  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    
    // Create new order of collaborators
    const collaboratorsCopy = [...collaborators];
    const draggedIndex = collaboratorsCopy.findIndex(c => c.id === draggedItem);
    const targetIndex = collaboratorsCopy.findIndex(c => c.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged item from array
    const [draggedCollaborator] = collaboratorsCopy.splice(draggedIndex, 1);
    
    // Insert at target position
    collaboratorsCopy.splice(targetIndex, 0, draggedCollaborator);
    
    // Apply new order by calling the reorderCollaborators function with array of ids
    reorderCollaborators(collaboratorsCopy.map(c => c.id));
    
    setDraggedItem(null);
  };

  // Save order and exit reorder mode
  const saveOrder = () => {
    setReorderMode(false);
  };

  // Handle delete collaborator
  const handleDeleteCollaborator = (id: string) => {
    if (window.confirm('Are you sure you want to delete this collaborator? This cannot be undone.')) {
      deleteCollaborator(id);
    }
  };
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Collaborators</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Collaborators</h2>
          <div className="action-buttons">
            {reorderMode ? (
              <button onClick={saveOrder} className="save-order-button">
                Save Order
              </button>
            ) : (
              <button onClick={toggleReorderMode} className="reorder-button">
                Reorder Collaborators
              </button>
            )}
            <Link to="/admin/collaborators/new" className="add-button">
              Add New Collaborator
            </Link>
          </div>
        </div>
        
        {reorderMode && (
          <div className="reorder-instructions">
            <p>Drag to reorder collaborators. Click "Save Order" when finished.</p>
          </div>
        )}
        
        <div 
          ref={collaboratorsRef}
          className={`admin-list ${reorderMode ? 'reorder-mode' : ''}`}
        >
          {collaborators.length === 0 ? (
            <div className="empty-state">
              <p>No collaborators yet. Add your first collaborator to get started!</p>
            </div>
          ) : (
            collaborators.map(collaborator => (
              <div 
                key={collaborator.id} 
                className={`admin-list-item ${draggedItem === collaborator.id ? 'dragging' : ''}`}
                draggable={reorderMode}
                onDragStart={() => handleDragStart(collaborator.id)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(collaborator.id)}
              >
                {reorderMode && <div className="drag-handle">⋮⋮</div>}
                <div className="admin-item-logo">
                  {collaborator.logo ? (
                    <img 
                      src={collaborator.logo} 
                      alt={`${collaborator.name} logo`}
                      className="collaborator-logo-preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="no-logo-placeholder">No Logo</div>
                  )}
                </div>
                <div className="admin-item-title">{collaborator.name}</div>
                <div className="admin-item-category">
                  <a 
                    href={collaborator.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="collaborator-link"
                  >
                    {collaborator.url}
                  </a>
                </div>
                <div className="admin-item-actions">
                  <Link to={`/admin/collaborators/edit/${collaborator.id}`} className="edit-button">
                    Edit
                  </Link>
                  <a 
                    href={collaborator.url} 
                    className="view-button" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit
                  </a>
                  {!reorderMode && (
                    <button 
                      onClick={() => handleDeleteCollaborator(collaborator.id)} 
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CollaboratorsList;
