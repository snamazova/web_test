import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';

const Team: React.FC = () => {
  const { teamMembers } = useContent();

  return (
    <div className="team-page">
      <div className="projects-header">
        <h1>Team Members</h1>
        <p><i>The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.</i> – Marcel Proust</p>
        <p>We believe that advancing the automated discovery of mind and brain — and AI for science more broadly — requires close collaboration across disciplines.
        That's why our group draws on the expertise of researchers from different fields, including neuroscience, psychology, computer science, engineering, and physics.</p>
      </div>

      <div className="team-intro">
        <p></p>
      </div>

      <div className="team-container">
        {/* Join Us Card */}

        {/* Existing Team Members */}
        {teamMembers.map(member => (
          <Link key={member.id} to={`/team/${member.id}`} className="team-member-card">
            {member.imageUrl ? (
              <div className="team-member-image" style={{ backgroundImage: `url(${member.imageUrl})` }}></div>
            ) : (
              <div className="team-member-image-placeholder" style={{ backgroundColor: member.color }}></div>
            )}
            <div className="team-member-info">
              <h3 className="team-member-name">{member.name}</h3>
              <p className="team-member-role">{member.role}</p>
            </div>
          </Link>
        ))}

        {/* Join Us Card */}
        <Link to="/join-us" className="team-member-card join-us-card">
          <div className="join-us-icon">+</div>
          <h3 className="join-us-title">Join Us!</h3>
          <p className="join-us-text">View our open positions and application process</p>
        </Link>
      </div>
    </div>
  );
};

export default Team;
