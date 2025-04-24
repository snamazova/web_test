import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import { TopNav, Footer } from '../components/Components';
import { createProjectGradient, getTopicColorsFromProject, generateTopicColor, OPENMOJI_BASE_URL } from '../utils/colorUtils';
import '../styles/styles.css';

// Function to render categories, handling both string and array formats
const renderCategories = (categories: string | string[]) => {
  if (Array.isArray(categories)) {
    return categories.join(', ');
  }
  return categories;
};

// Function to render disciplines, handling both string and array formats
const renderDisciplines = (disciplines: string | string[]) => {
  if (Array.isArray(disciplines)) {
    return disciplines.join(', ');
  }
  return disciplines;
};

const LAB_COLOR = '#00AAFF'; // Solid lab blue color

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, teamMembers, publications, software, topicColorRegistry } = useContent();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectTeam, setProjectTeam] = useState<any[]>([]);
  const [projectSoftware, setProjectSoftware] = useState<any[]>([]);
  const [projectPublications, setProjectPublications] = useState<any[]>([]);
  const [imageError, setImageError] = useState(false);

  // Store the colors for creating dynamic gradients
  const [topicColors, setTopicColors] = useState<string[]>([]);
  const [baseColor] = useState<string>(LAB_COLOR);

  // Mouse interaction states
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isFrozen, setIsFrozen] = useState(false);
  const colorHeaderRef = useRef<HTMLDivElement>(null);

  // Check if project has a valid image
  const hasValidImage = (): boolean => {
    return Boolean(
      project?.image &&
      project.image.trim() !== '' &&
      !project.image.endsWith('undefined') &&
      !project.image.endsWith('null') &&
      !imageError
    );
  };

  // Check if project has emojis
  const hasEmojis = (): boolean => {
    return Boolean(
      project?.emojiHexcodes &&
      project.emojiHexcodes.length > 0
    );
  };

  // Get emoji URLs
  const getEmojiUrls = (): string[] => {
    if (hasEmojis() && project.emojiHexcodes) {
      return project.emojiHexcodes.map((hex: string) => `${OPENMOJI_BASE_URL}${hex}.svg`);
    }
    return [];
  };

  useEffect(() => {
    const currentProject = projects.find(p => p.id === id);

    if (currentProject) {
      setProject(currentProject);

      let colors: string[] = [];

      if (currentProject.topics && currentProject.topics.length > 0) {
        colors = currentProject.topics.map((topicName: string) => {
          if (topicColorRegistry && topicColorRegistry[topicName]) {
            return topicColorRegistry[topicName].color;
          }

          const topicWithColor = currentProject.topicsWithColors?.find((t: any) => t.name === topicName);
          if (topicWithColor?.color) {
            return topicWithColor.color;
          }

          const index = currentProject.topics ? currentProject.topics.indexOf(topicName) : 0;
          const total = currentProject.topics ? currentProject.topics.length : 1;
          return generateTopicColor(Math.round((index / total) * 360));
        });
      } else if (currentProject.color && typeof currentProject.color === 'string') {
        const gradientMatch = currentProject.color.match(/rgba?\([\d\s,.]+\)|#[a-f\d]+/gi) || [];
        if (gradientMatch.length > 0) {
          colors = gradientMatch;
        }
      }

      if (colors.length === 0) {
        colors = [baseColor];
      }

      if (!colors.includes(baseColor)) {
        colors.push(baseColor);
      }

      setTopicColors(colors);

      const team = currentProject.team
        .map((memberName: string) =>
          teamMembers.find(tm => tm.name === memberName))
        .filter(Boolean);

      setProjectTeam(team);

      const relatedSoftware = software.filter(sw => sw.projectId === id);
      setProjectSoftware(relatedSoftware);

      const relatedPublications = publications.filter(pub => pub.projectId === id);
      setProjectPublications(relatedPublications);
    }

    setLoading(false);
  }, [id, projects, teamMembers, software, baseColor, topicColorRegistry, publications]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (colorHeaderRef.current && !isFrozen) {
      const rect = colorHeaderRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleMouseEnter = () => {
    setIsFrozen(false);
  };

  const handleMouseLeave = () => {
    setIsFrozen(true);
  };

  // Generate a gradient based on project topics
  const generateGradient = () => {
    // Always use gradient if project has topics
    if (project.topics && project.topics.length > 0) {
      return createProjectGradient(topicColors, '135deg');
    }
    // Fallback to solid LAB_COLOR if no topics
    return LAB_COLOR;
  };

  if (loading) {
    return <div className="loading">Loading project details...</div>;
  }

  if (!project) {
    return <div className="not-found">Project not found</div>;
  }

  return (
    <>
      <TopNav />
      <div className="project-details">
        <div
          ref={colorHeaderRef}
          className="project-color-header"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            background: hasEmojis() ? generateGradient() : 'transparent',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {hasEmojis() ? (
            <div className="project-emoji-container">
              {getEmojiUrls().map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Project Emoji ${index + 1}`}
                  className="project-emoji"
                  onError={() => {
                    console.error(`Failed to load emoji at ${url}`);
                  }}
                />
              ))}
            </div>
          ) : hasValidImage() && (
            <img
              src={project.image}
              alt={project.title}
              className="project-header-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <h1 className="project-title-standalone">{project.title}</h1>

        <div className="project-section">
          {project.description.split('\n').map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}

          {project.topics && project.topics.length > 0 && (
            <div className="project-detail-topics">
              {project.topics.map((method: string, index: number) => {
                let methodColor;

                if (topicColorRegistry && topicColorRegistry[method]) {
                  methodColor = topicColorRegistry[method].color;
                } else {
                  const methodWithColor = project.topicsWithColors?.find(
                    (t: any) => t.name === method
                  );
                  methodColor = methodWithColor?.color;
                }

                if (!methodColor) {
                  methodColor = generateTopicColor(Math.round((index / (project.topics.length || 1)) * 360));
                }

                return (
                  <div key={method} className="project-detail-topic">
                    <div
                      className="project-detail-topic-color"
                      style={{ backgroundColor: methodColor }}
                    ></div>
                    <span className="project-detail-topic-name">{method}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="project-metadata-container">
            <div className="project-metadata-item">
              <h4>Topics:</h4>
              <p>{project.category && renderDisciplines(project.category)}</p>
            </div>
          </div>
        </div>

        {projectTeam.length > 0 && (
          <div className="project-section">
            <h2>Team Members Working in This Research Area</h2>
            <div className="project-team-list">
              {projectTeam.map((member: any) => (
                <Link
                  key={member.id}
                  to={`/team/${member.id}`}
                  className="project-team-member"
                >
                  <div
                    className="team-color-indicator"
                    style={{ backgroundColor: member.color }}
                  ></div>
                  {member.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Image is already displayed in the header when there are no emojis,
            so we don't need to show it again in the content area */}

        {projectSoftware.length > 0 && (
          <div className="project-section">
            <h2>Software</h2>
            <div className="software-grid">
              {projectSoftware.map(sw => (
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

                  {sw.developers && sw.developers.length > 0 && (
                    <p className="software-developed-by">
                      Developed by: {sw.developers.join(', ')}
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
                </div>
              ))}
            </div>
          </div>
        )}

        {projectPublications.length > 0 && (
          <div className="project-section">
            <h2>Publications</h2>
            <div className="publications-list">
              {projectPublications.map((publication) => (
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
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProjectDetails;
