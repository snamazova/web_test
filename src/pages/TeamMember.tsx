import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import Layout from '../components/Layout';
import { TeamMember } from '../data/team';
import { Publication } from '../data/publications';
import { Project } from '../data/projects';

const TeamMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getTeamMemberById, 
    projects, 
    publications
  } = useContent();
  
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [memberPublications, setMemberPublications] = useState<Publication[]>([]);
  const [memberProjects, setMemberProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (id) {
      const member = getTeamMemberById(id);
      if (member) {
        setTeamMember(member);
        
        // Get projects the team member is part of
        const relatedProjects = projects.filter(project => 
          project.team.includes(member.name)
        );
        setMemberProjects(relatedProjects);
        
        // SIMPLIFIED APPROACH: Only use direct publication references
        if (member.publications && member.publications.length > 0) {
          // Get all publication objects by their IDs
          const directPublications = member.publications
            .map(pubId => publications.find(p => p.id === pubId))
            .filter(Boolean) as Publication[];
          
          // Sort by year (newest first)
          const sortedPubs = [...directPublications].sort((a, b) => b.year - a.year);
          setMemberPublications(sortedPubs);
          
          console.log(`Found ${sortedPubs.length} publications for ${member.name}`);
        } else {
          // Reset publications if there are none referenced
          setMemberPublications([]);
        }
      }
    }
  }, [id, getTeamMemberById, projects, publications]);
  
  if (!teamMember) {
    return (
      <Layout>
        <div className="container">
          <h1>Team Member Not Found</h1>
          <p>Sorry, we couldn't find the team member you're looking for.</p>
          <Link to="/team" className="button">Back to Team</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="team-member-profile">
        <div className="profile-header" style={{ borderColor: teamMember.color }}>
          <div className="profile-image-container">
            {teamMember.imageUrl && (
              <img 
                src={teamMember.imageUrl} 
                alt={teamMember.name} 
                className="profile-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {(!teamMember.imageUrl || teamMember.imageUrl === '') && (
              <div 
                className="profile-image-placeholder"
                style={{ backgroundColor: teamMember.color }}
              >
                {teamMember.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{teamMember.name}</h1>
            <h2>{teamMember.role}</h2>
            {teamMember.email && (
              <p className="profile-email">
                <strong>Email:</strong> <a href={`mailto:${teamMember.email}`}>{teamMember.email}</a>
              </p>
            )}
          </div>
        </div>
        
        <div className="profile-content">
          <section className="profile-bio">
            <h2>Biography</h2>
            <p>{teamMember.bio}</p>
          </section>
          
          {memberProjects.length > 0 && (
            <section className="profile-projects">
              <h2>Projects</h2>
              <div className="projects-grid">
                {memberProjects.map(project => (
                  <Link 
                    to={`/projects/${project.id}`} 
                    key={project.id}
                    className="project-card-mini"
                    style={{ borderLeft: `4px solid ${project.color}` }}
                  >
                    <h3>{project.title}</h3>
                    <p>{project.description.substring(0, 100)}...</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
          
          <section className="profile-publications">
            <h2>Publications ({memberPublications.length})</h2>
            {memberPublications.length > 0 ? (
              <ul className="publications-list">
                {memberPublications.map(publication => (
                  <li key={publication.id} className="publication-item">
                    <div className="publication-year">{publication.year}</div>
                    <div className="publication-details">
                      <h3 className="publication-title">
                        {publication.url ? (
                          <a href={publication.url} target="_blank" rel="noopener noreferrer">
                            {publication.title}
                          </a>
                        ) : (
                          publication.title
                        )}
                      </h3>
                      <p className="publication-authors">{publication.authors.join(', ')}</p>
                      <p className="publication-journal">{publication.journal}</p>
                      {publication.doi && (
                        <p className="publication-doi">
                          DOI: <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                            {publication.doi}
                          </a>
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No publications found for this team member.</p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TeamMemberPage;
