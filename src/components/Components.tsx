import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { teamMembers } from '../data/team';
import { TeamMember as TeamMemberType } from '../data/team';
import { Project } from '../data/projects';
import { 
    generateTopicColor, 
    createProjectGradient, 
    getTopicColorsFromProject, 
    LAB_COLOR 
} from '../utils/colorUtils';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';

// Import the combined styles file
import '../styles/styles.css';

// ===============================
// TopNav Component
// ===============================
const TopNav: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav 
            className="top-nav" 
            style={{ 
                background: '#ffffff', // White background
                borderBottom: '1px solid #eee' // Subtle border
            }}
        >
            <div className="nav-container">
                <div className="logo-container">
                    <NavLink to="/" className="logo">
                        <span className="logo-text">University of Osnabrück</span>
                    </NavLink>
                </div>
                
                <button 
                    className="mobile-menu-toggle" 
                    onClick={toggleMobileMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
                
                <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <li>
                        <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/feed" className={({isActive}) => isActive ? 'active' : ''}>
                            News
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/projects" className={({isActive}) => isActive ? 'active' : ''}>
                            Research
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/publications" className={({isActive}) => isActive ? 'active' : ''}>
                            Publications
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/software" className={({isActive}) => isActive ? 'active' : ''}>
                            Software
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/team" className={({isActive}) => isActive ? 'active' : ''}>
                            Team
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

// ===============================
// TeamMember Component
// ===============================
interface TeamMemberProps {
    name: string;
    bio: string; // We'll keep this as bio but use it for role
    imageUrl: string;
    color: string;
    id: string; 
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, bio, imageUrl, color, id }) => {
    // State to track if image failed to load or is invalid
    const [imageError, setImageError] = useState(false);
    
    // More robust check for valid image URL
    const hasValidImage = Boolean(
        imageUrl && 
        imageUrl.trim() !== '' && 
        !imageUrl.endsWith('undefined') && 
        !imageUrl.endsWith('null') &&
        !imageError
    );
    
    return (
        <Link to={`/team/${id}`} className="team-member">
            <div 
                className="team-member-color" 
                style={{ backgroundColor: color }}
            ></div>
            
            {hasValidImage ? (
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className="team-member-image"
                    onError={() => {
                        console.log(`Image failed to load for ${name}`);
                        setImageError(true);
                    }}
                />
            ) : (
                <div 
                    className="team-member-image team-member-color-circle"
                    style={{ backgroundColor: color }}
                    aria-label={`${name}'s profile color`}
                />
            )}
            
            <div className="team-member-info">
                <h3 className="team-member-name">{name}</h3>
                <p className="team-member-role">{bio}</p> {/* Changed class name from team-member-bio to team-member-role */}
            </div>
        </Link>
    );
}

// ===============================
// TeamGradientBanner Component
// ===============================
interface TeamGradientBannerProps {
    teamMembers: TeamMemberType[];
}

const TeamGradientBanner: React.FC<TeamGradientBannerProps> = ({ teamMembers }) => {
    // Create a consistent blue gradient instead of using team member colors
    const createTeamGradient = () => {
        const LAB_COLOR = '#00AAFF';
        return `linear-gradient(to right, ${LAB_COLOR}, #005580)`;
    };

    return (
        <div 
            className="team-gradient-banner"
            style={{ background: createTeamGradient() }}
        >
            <div className="banner-content">
                <h2 style={{ textAlign: 'left' }}>Our Research Team</h2>
                <p style={{ textAlign: 'left' }}>Meet the people behind our groundbreaking work</p>
            </div>
        </div>
    );
};

// ===============================
// SideNav Component
// ===============================
const SideNav: React.FC = () => {
    return (
        <nav className="side-nav">
            <ul>
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/feed" className={({ isActive }) => isActive ? 'active' : ''}>
                        News
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                        Research
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/publications" className={({ isActive }) => isActive ? 'active' : ''}>
                        Publications
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/software" className={({ isActive }) => isActive ? 'active' : ''}>
                        Software
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/team" className={({ isActive }) => isActive ? 'active' : ''}>
                        Team
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
                        Contact
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

// ===============================
// ProjectCard Component
// ===============================
interface ProjectCardProps {
    project: Project;
}

// Change OpenMoji URL to black and white version instead of color
const OPENMOJI_BASE_URL = 'https://openmoji.org/data/black/svg/';

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    // Get the topic color registry from context
    const { topicColorRegistry } = useContent();
    
    const colorBlockRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLAnchorElement>(null);
    
    // Check if project has a valid image
    const hasValidImage = Boolean(
        project.image && 
        project.image.trim() !== '' &&
        !project.image.endsWith('undefined') && 
        !project.image.endsWith('null') &&
        !imageError
    );

    // Check if project has valid emojis
    const hasEmojis = Boolean(
        project.emojiHexcodes && 
        project.emojiHexcodes.length > 0
    );

    // Get OpenMoji URLs if available
    const getEmojiUrls = (): string[] => {
        if (hasEmojis && project.emojiHexcodes) {
            return project.emojiHexcodes.map(hex => `${OPENMOJI_BASE_URL}${hex}.svg`);
        }
        return [];
    };

    // Generate static gradient based on project topics
    const generateStaticGradient = () => {
        // Get topic colors from the registry for this project's topics
        const topicColors = project.topics?.map(topicName => {
            // First try to get the color from the centralized registry
            if (topicColorRegistry && topicColorRegistry[topicName]) {
                return topicColorRegistry[topicName].color;
            }
            
            // If not found in registry, fallback to project's topicsWithColors
            const topicWithColor = project.topicsWithColors?.find(t => t.name === topicName);
            if (topicWithColor?.color) {
                return topicWithColor.color;
            }
            
            // Last resort - generate a color
            const index = project.topics?.indexOf(topicName) || 0;
            const total = project.topics?.length || 1;
            return generateTopicColor(Math.round((index / total) * 360));
        }) || [];
        
        // Create a gradient with a fixed direction
        return createProjectGradient(topicColors, '135deg'); // Fixed diagonal direction
    };

    // Generate method tag with color dot - now using the registry
    const generateMethodTag = (method: string, index: number) => {
        let methodColor;
        
        if (topicColorRegistry && topicColorRegistry[method]) {
            methodColor = topicColorRegistry[method].color;
        } else {
            const methodWithColor = project.topicsWithColors?.find(t => t.name === method);
            methodColor = methodWithColor?.color;
        }
        
        if (!methodColor) {
            methodColor = generateTopicColor(Math.round((index / (project.topics?.length || 1)) * 360));
        }
        
        return (
            <div key={method} className="topic-tag">
                <div 
                    className="topic-color-dot" 
                    style={{ backgroundColor: methodColor }}
                    title={method}
                />
                <span className="topic-name">{method}</span>
            </div>
        );
    };

    // Function to render project disciplines
    const renderDisciplines = () => {
        if (Array.isArray(project.category)) {
            return project.category.join(', ');
        }
        return project.category;
    };
    
    // Determine the background style based on conditions
    const getBackgroundStyle = () => {
        if (hasEmojis) {
            // Show gradient when hovered and there are topics
            if (isHovered && project.topics && project.topics.length > 0) {
                return { background: generateStaticGradient() };
            } 
            // Otherwise use solid LAB_COLOR
            return { background: LAB_COLOR };
        } else if (hasValidImage) {
            return { background: `url(${project.image}) center/cover no-repeat` };
        } else {
            return { background: LAB_COLOR };
        }
    };
    
    return (
        <Link 
            to={`/projects/${project.id}`} 
            className="project-card"
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                ref={colorBlockRef}
                className="project-color-block"
                style={getBackgroundStyle()}
            >
                {hasEmojis && (
                    <div className="project-emoji-container">
                        {getEmojiUrls().map((url, index) => (
                            <img 
                                key={index}
                                src={url} 
                                alt={`Project Emoji ${index+1}`} 
                                className="project-emoji"
                                onError={() => console.error(`Failed to load emoji at ${url}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-excerpt">
                    {project.description.length > 120 
                        ? `${project.description.slice(0, 120)}...` 
                        : project.description}
                </p>
                
                <div className="project-metadata">
                    <span className="project-category">{renderDisciplines()}</span>
                    
                    <div className="project-topics">
                        {project.topics?.map((method, index) => 
                            generateMethodTag(method, index)
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

// ===============================
// PageHeader Component
// ===============================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <h1 style={{ textAlign: 'left' }}>{title}</h1>
      {subtitle && <p style={{ textAlign: 'left' }}>{subtitle}</p>}
    </div>
  );
};

// ===============================
// Header Component
// ===============================
const Header: React.FC = () => {
    return (
        <header>
            <div className="header-content">
                <h1>Automated Scientific Discovery of Mind and Brain</h1>
                <Link to="/" className="logo-link">
                    <img src="/assets/logo.png" alt="Lab Logo" className="lab-logo" />
                </Link>
            </div>
        </header>
    );
};

// ===============================
// Filter Component
// ===============================
interface FilterProps {
  categories: string[];
  onFilterChange: (category: string) => void;
}

const Filter: React.FC<FilterProps> = ({ categories, onFilterChange }) => {
  return (
    <div className="filter">
      <h3>Filter by Category</h3>
      <select onChange={(e) => onFilterChange(e.target.value)}>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

// ===============================
// Footer Component
// ===============================
const Footer: React.FC = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} Automated Scientific Discovery of Mind and Brain. All rights reserved.</p>
                </div>
                <nav className="footer-nav">
                    <NavLink to="/contact" className="footer-link">Contact</NavLink>
                </nav>
            </div>
        </footer>
    );
};

// Export all components
export {
    TopNav,
    TeamMember,
    SideNav,
    ProjectCard,
    PageHeader,
    Header,
    Filter,
    Footer
};
