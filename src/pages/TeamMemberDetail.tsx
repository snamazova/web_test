import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { getTopicColorsFromProject, createProjectGradient, OPENMOJI_BASE_URL, LAB_COLOR } from '../utils/colorUtils';

const TeamMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTeamMemberById, getProjectById, publications, software } = useContent();
  const [member, setMember] = useState(id ? getTeamMemberById(id) : undefined);
  const [memberProjects, setMemberProjects] = useState<any[]>([]);
  const [memberPublications, setMemberPublications] = useState<any[]>([]);
  const [memberSoftware, setMemberSoftware] = useState<any[]>([]);
  const [publicationsByYear, setPublicationsByYear] = useState<Record<string, any[]>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  useEffect(() => {
    const updateMemberData = () => {
      if (id) {
        const updatedMember = getTeamMemberById(id);
        setMember(updatedMember);

        // Update projects list
        if (updatedMember?.projects) {
          // Use a Set to ensure unique project IDs
          const uniqueProjectIds = new Set(updatedMember.projects);
          
          // Convert to array and get project details, filtering out undefined projects
          const projects = Array.from(uniqueProjectIds)
            .map(projectId => getProjectById(projectId))
            .filter(project => project !== undefined);
            
          setMemberProjects(projects);
        } else {
          setMemberProjects([]); // Reset if no projects
        }

        // Find publications where this team member is an author
        if (updatedMember) {
          // Get the last name of the team member for matching in publications
          const lastName = updatedMember.name.split(' ').pop()?.toLowerCase() || '';

          // Filter publications where the member appears as an author
          const relatedPublications = publications.filter(publication =>
            publication.authors.some(author =>
              author.toLowerCase().includes(lastName)
            )
          );

          // Sort by year (newest first)
          const sortedPublications = [...relatedPublications].sort((a, b) => b.year - a.year);
          setMemberPublications(sortedPublications);

          // Group publications by year
          const publicationsByYear = sortedPublications.reduce((acc, publication) => {
            const year = publication.year.toString();
            if (!acc[year]) {
              acc[year] = [];
            }
            acc[year].push(publication);
            return acc;
          }, {} as Record<string, typeof sortedPublications>);

          setPublicationsByYear(publicationsByYear);

          // Find software developed by this team member
          const relatedSoftware = software.filter(sw =>
            sw.developers.includes(updatedMember.name)
          );
          setMemberSoftware(relatedSoftware);
        }
      }
    };

    // Initial data load
    updateMemberData();

    // Listen for project updates
    const handleProjectUpdate = () => {
      updateMemberData();
    };

    // Listen for publication updates too
    const handlePublicationUpdate = () => {
      updateMemberData();
    };

    window.addEventListener('project-updated', handleProjectUpdate);
    window.addEventListener('publication-updated', handlePublicationUpdate);

    return () => {
      window.removeEventListener('project-updated', handleProjectUpdate);
      window.removeEventListener('publication-updated', handlePublicationUpdate);
    };
  }, [id, getTeamMemberById, getProjectById, publications, software]);

  if (!member) {
    return (
      <div className="error-message">Team member not found</div>
    );
  }

  // Function to generate gradient for project cards
  const generateProjectGradient = (project: any) => {
    // Get topic colors from the project
    const topicColors = getTopicColorsFromProject(project);

    // Create a linear gradient with the unified function (using 'to right' direction)
    return createProjectGradient(topicColors, '135deg');
  };

  // Function to get emoji URLs for a project
  const getProjectEmojiUrls = (project: any): string[] => {
    if (project.emojiHexcodes && project.emojiHexcodes.length > 0) {
      return project.emojiHexcodes.map((hex: string) => `${OPENMOJI_BASE_URL}${hex}.svg`);
    }
    return [];
  };

  // Function to check if a project has emojis
  const hasProjectEmojis = (project: any) => {
    return Boolean(
      project.emojiHexcodes && 
      project.emojiHexcodes.length > 0
    );
  };
  
  // Function to check if a project has a valid image
  const hasValidProjectImage = (project: any) => {
    if (imageErrors[project.id]) {
      return false;
    }
    
    return Boolean(
      project.image && 
      project.image.trim() !== '' && 
      !project.image.endsWith('undefined') && 
      !project.image.endsWith('null')
    );
  };
  
  // Handle project image error
  const handleProjectImageError = (projectId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [projectId]: true
    }));
  };

  // Determine background style - Gradient for emojis, image for images, gradient as fallback
  const getProjectBackgroundStyle = (project: any) => {
    // When hovering a project with emojis, show gradient if it has topics
    if (hasProjectEmojis(project)) {
      if (hoveredProjectId === project.id && project.topics && project.topics.length > 0) {
        return { background: generateProjectGradient(project) };
      }
      // Otherwise use solid lab blue
      return { background: LAB_COLOR };
    } else if (hasValidProjectImage(project)) {
      return { background: `url(${project.image}) center/cover no-repeat` };
    } else {
      return { background: LAB_COLOR };
    }
  };

  // Define OpenMoji SVG hexcodes for contact icons (black version)
  const OPENMOJI_ICONS = {
    email: "2709", // Envelope
    github: "	E045", // GitHub icon
    cv: "1F4C4", // Document icon
  };

  return (
    <div className="team-member-detail-page">
      <div className="team-member-profile">
        <div className="team-member-profile-image">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              className="team-member-large-image"
              onError={() => {
                console.log(`Image failed to load for ${member.name} detail page`);
              }}
            />
          ) : (
            <div
              className="team-member-image team-member-large-color-circle"
              style={{ backgroundColor: member.color }}
              aria-label={`${member.name}'s profile color`}
            />
          )}
        </div>

        <div className="team-member-profile-info">
          <h1>{member.name}</h1>
          <h2 className="team-member-role">{member.role}</h2>

          {/* Contact information section */}
          <div className="team-member-contact">
            {member.email && (
              <div className="contact-item">
                <img 
                  src={`${OPENMOJI_BASE_URL}${OPENMOJI_ICONS.email}.svg`} 
                  alt="Email" 
                  className="contact-icon" 
                  style={{ verticalAlign: 'middle' }}
                />
                <a href={`mailto:${member.email}`} className="team-member-email">
                  Mail
                </a>
              </div>
            )}

            {/* Use only member.github property */}
            {member.github && (
              <div className="contact-item">
                <img 
                  src={`${OPENMOJI_BASE_URL}${OPENMOJI_ICONS.github}.svg`} 
                  alt="GitHub" 
                  className="contact-icon"
                  style={{ verticalAlign: 'middle' }}
                />
                <a
                  href={`https://github.com/${member.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member-github"
                >
                  GitHub
                </a>
              </div>
            )}

            {member.cvUrl && (
              <div className="contact-item">
                <img 
                  src={`${OPENMOJI_BASE_URL}${OPENMOJI_ICONS.cv}.svg`} 
                  alt="CV" 
                  className="contact-icon"
                  style={{ verticalAlign: 'middle' }}
                />
                <a
                  href={member.cvUrl.startsWith('data:')
                    ? URL.createObjectURL(dataURLtoBlob(member.cvUrl))
                    : member.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="team-member-cv"
                  download={member.cvUrl.startsWith('data:') ? `${member.name.replace(/\s+/g, '_')}_CV.pdf` : false}
                >
                  CV
                </a>
              </div>
            )}
          </div>

          <div className="team-member-bio-extended">
            {member.bio.split('\n').map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      {memberProjects.length > 0 && (
        <div className="team-member-projects-section">
          <h2>Research Areas</h2>
          <div className="team-member-projects-grid">
            {memberProjects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="team-member-project-card"
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                <div
                  className="project-color-indicator"
                  style={getProjectBackgroundStyle(project)}
                >
                  {hasProjectEmojis(project) ? (
                    <div className="project-emoji-container">
                      {getProjectEmojiUrls(project).map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Project Emoji ${index+1}`} 
                          className="project-emoji"
                          onError={() => console.error(`Failed to load emoji at ${url}`)}
                        />
                      ))}
                    </div>
                  ) : hasValidProjectImage(project) ? (
                    <div className="project-image-frame">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="project-image"
                        onError={() => handleProjectImageError(project.id)}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <p>{project.description.length > 150
                      ? `${project.description.substring(0, 150)}...`
                      : project.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Software section */}
      {memberSoftware.length > 0 && (
        <div className="team-member-section">
          <h2>Software</h2>
          <div className="software-grid">
            {memberSoftware.map(sw => (
              <div key={sw.id} className="software-card">
                <div className="software-header">
                  <h3 className="software-name">{sw.name}</h3>
                  {sw.featured && <span className="software-featured">Featured</span>}
                </div>

                <p className="software-description">{sw.description}</p>

                {sw.technologies && sw.technologies.length > 0 && (
                  <div className="software-tech-tags">
                    {sw.technologies.map((tech: string) => (
                      <span key={tech} className="software-tech-tag">{tech}</span>
                    ))}
                  </div>
                )}

                {sw.developers && sw.developers.length > 0 && sw.developers.length > 1 && (
                  <p className="software-developed-by">
                    Co-developed with: {sw.developers.filter((dev: string) => dev !== member.name).join(', ')}
                  </p>
                )}

                <div className="software-meta">
                  {sw.license && (
                    <span className="software-license">{sw.license}</span>
                  )}
                  {sw.releaseDate && (
                    <p className="software-date">
                      Released: {new Date(sw.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                  {sw.lastUpdate && (
                    <p className="software-date">
                      Updated: {new Date(sw.lastUpdate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="software-links">
                  <a href={sw.repoUrl} target="_blank" rel="noopener noreferrer" className="software-link repo-link">
                    Repository
                  </a>
                  {sw.demoUrl && (
                    <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer" className="software-link demo-link">
                      Demo
                    </a>
                  )}
                  {sw.documentationUrl && (
                    <a href={sw.documentationUrl} target="_blank" rel="noopener noreferrer" className="software-link docs-link">
                      Docs
                    </a>
                  )}
                </div>

                {/* Support both projectId and projectIds */}
                {(sw.projectIds && sw.projectIds.length > 0) ? (
                  <div className="software-related-projects">
                    <p>Related Projects:</p>
                    <ul>
                      {sw.projectIds.map((projectId: string) => {
                        const project = getProjectById(projectId);
                        return project ? (
                          <li key={projectId}>
                            <Link to={`/projects/${projectId}`}>
                              {project.title}
                            </Link>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                ) : sw.projectId ? (
                  <div className="software-related-project">
                    <Link to={`/projects/${sw.projectId}`} className="project-link">
                      {getProjectById(sw.projectId)?.title || 'Related Project'}
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications section */}
      {memberPublications.length > 0 && (
        <div className="team-member-section">
          <h2>Publications</h2>
          <div className="publications-list">
            {Object.keys(publicationsByYear)
              .sort((a, b) => Number(b) - Number(a)) // Sort years in descending order
              .map(year => (
                <div key={year} className="publications-year-section">
                  <h3 className="publications-year-header">{year}</h3>
                  {publicationsByYear[year].map(publication => (
                    <div key={publication.id} className="publication-item">
                      <h4 className="publication-title">
                        {publication.url ? (
                          <a
                            href={publication.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {publication.title}
                          </a>
                        ) : (
                          publication.title
                        )}
                      </h4>
                      <p className="publication-authors">{publication.authors.join(', ')}</p>
                      <div className="publication-meta">
                        <span className="publication-journal">
                          <em>{publication.journal}</em>
                        </span>
                        <span className="publication-year">{publication.year}</span>
                        {publication.type && (
                          <span className="publication-type">{publication.type}</span>
                        )}
                      </div>
                      {publication.abstract && (
                        <div className="publication-abstract">
                          <p>{publication.abstract}</p>
                        </div>
                      )}
                      {publication.projectId && (
                        <p className="publication-project">
                          Related project: <Link to={`/projects/${publication.projectId}`}>
                            {getProjectById(publication.projectId)?.title || 'View project'}
                          </Link>
                        </p>
                      )}
                      {publication.doi && (
                        <p className="publication-doi">
                          DOI: <a
                            href={`https://doi.org/${publication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {publication.doi}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert data URL to a Blob
function dataURLtoBlob(dataURL: string): Blob {
  // Split the data URL at the comma to separate the MIME type from the base64 data
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const base64 = parts[1];

  // Convert base64 to raw binary data
  const binaryString = atob(base64);

  // Create an array buffer of the right size
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  // Fill the array buffer with the binary data
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob from the array buffer with the correct MIME type
  return new Blob([bytes], { type: mime });
}

export default TeamMemberDetail;
