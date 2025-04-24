import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const ProjectsList: React.FC = () => {
  const { projects, reorderProjects } = useContent();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Helper to display disciplines as string
  const formatDisciplines = (category: string | string[]): string => {
    if (Array.isArray(category)) {
      return category.join(', ');
    }
    return category;
  };
  
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

  // Handle drop - reorder projects
  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    
    // Create new order of projects
    const projectsCopy = [...projects];
    const draggedIndex = projectsCopy.findIndex(p => p.id === draggedItem);
    const targetIndex = projectsCopy.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged item from array
    const [draggedProject] = projectsCopy.splice(draggedIndex, 1);
    
    // Insert at target position
    projectsCopy.splice(targetIndex, 0, draggedProject);
    
    // Apply new order by calling the reorderProjects function with array of ids
    reorderProjects(projectsCopy.map(p => p.id));
    
    setDraggedItem(null);
  };

  // Save order and exit reorder mode
  const saveOrder = () => {
    setReorderMode(false);
  };
  
  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Manage Projects</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Projects</h2>
          <div className="action-buttons">
            {reorderMode ? (
              <button onClick={saveOrder} className="save-order-button">
                Save Order
              </button>
            ) : (
              <button onClick={toggleReorderMode} className="reorder-button">
                Reorder Projects
              </button>
            )}
            <Link to="/admin/projects/new" className="add-button">
              Add New Project
            </Link>
          </div>
        </div>
        
        {reorderMode && (
          <div className="reorder-instructions">
            <p>Drag and drop projects to reorder them. Click "Save Order" when finished.</p>
          </div>
        )}
        
        <div 
          ref={projectsRef}
          className={`admin-list ${reorderMode ? 'reorder-mode' : ''}`}
        >
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Add your first project to get started!</p>
            </div>
          ) : (
            projects.map(project => (
              <div 
                key={project.id} 
                className={`admin-list-item ${draggedItem === project.id ? 'dragging' : ''}`}
                draggable={reorderMode}
                onDragStart={() => handleDragStart(project.id)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(project.id)}
              >
                {reorderMode && <div className="drag-handle">⋮⋮</div>}
                <div 
                  className="admin-item-color-gradient" 
                  style={{ background: project.color }}
                ></div>
                <div className="admin-item-title">{project.title}</div>
                <div className="admin-item-category">{formatDisciplines(project.category)}</div>
                <div className="admin-item-actions">
                  <Link to={`/admin/projects/edit/${project.id}`} className="edit-button">
                    Edit
                  </Link>
                  <Link to={`/projects/${project.id}`} className="view-button">
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsList;
