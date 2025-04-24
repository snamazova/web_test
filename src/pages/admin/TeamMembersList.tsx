import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';

const TeamMembersList: React.FC = () => {
  const { teamMembers, reorderTeamMembers } = useContent();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState<boolean>(false);
  const teamMembersRef = useRef<HTMLDivElement>(null);
  
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

  // Handle drop - reorder team members
  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;
    
    // Create new order of team members
    const membersCopy = [...teamMembers];
    const draggedIndex = membersCopy.findIndex(m => m.id === draggedItem);
    const targetIndex = membersCopy.findIndex(m => m.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged item from array
    const [draggedMember] = membersCopy.splice(draggedIndex, 1);
    
    // Insert at target position
    membersCopy.splice(targetIndex, 0, draggedMember);
    
    // Apply new order by calling the reorderTeamMembers function with array of ids
    reorderTeamMembers(membersCopy.map(m => m.id));
    
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
          <h1>Manage Team</h1>
          <Link to="/admin" className="back-link">
            Back to Dashboard
          </Link>
        </div>
        
        <div className="admin-action-header">
          <h2>Team Members</h2>
          <div className="action-buttons">
            {reorderMode ? (
              <button onClick={saveOrder} className="save-order-button">
                Save Order
              </button>
            ) : (
              <button onClick={toggleReorderMode} className="reorder-button">
                Reorder Team
              </button>
            )}
            <Link to="/admin/team/new" className="add-button">
              Add New Member
            </Link>
          </div>
        </div>
        
        {reorderMode && (
          <div className="reorder-instructions">
            <p>Drag and drop team members to reorder them. Click "Save Order" when finished.</p>
          </div>
        )}
        
        <div 
          ref={teamMembersRef}
          className={`admin-list ${reorderMode ? 'reorder-mode' : ''}`}
        >
          {teamMembers.length === 0 ? (
            <div className="empty-state">
              <p>No team members yet. Add your first member to get started!</p>
            </div>
          ) : (
            teamMembers.map(member => (
              <div 
                key={member.id} 
                className={`admin-list-item ${draggedItem === member.id ? 'dragging' : ''}`}
                draggable={reorderMode}
                onDragStart={() => handleDragStart(member.id)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(member.id)}
              >
                {reorderMode && <div className="drag-handle">⋮⋮</div>}
                <div 
                  className="admin-item-color-gradient" 
                  style={{ backgroundColor: member.color }}
                ></div>
                <div className="admin-item-title">{member.name}</div>
                <div className="admin-item-category">{member.role}</div>
                <div className="admin-item-actions">
                  <Link to={`/admin/team/edit/${member.id}`} className="edit-button">
                    Edit
                  </Link>
                  <Link to={`/team/${member.id}`} className="view-button">
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

export default TeamMembersList;
