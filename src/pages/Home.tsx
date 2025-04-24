import React from 'react';
import { ProjectCard } from '../components/Components';
import '../styles/styles.css';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
// Import the SVG directly when using Create React App or similar bundler
import { ReactComponent as BrainLogo } from '../assets/logo.svg';
import { getOpenMojiUrl } from '../utils/colorUtils';

const Home: React.FC = () => {
    const { projects, collaborators, fundingSources, newsItems, publications, getFeaturedItems, getTeamImage, getTeamImagePosition } = useContent();
    const { isAuthenticated } = useAuth();

    // Get featured items from context
    const featuredItems = getFeaturedItems();

    // Get team image and its position from context
    const teamImage = getTeamImage();
    const teamImagePosition = getTeamImagePosition();

    // Find the featured items by ID
    const featuredProject = projects.find(p => p.id === featuredItems.projectId) || (projects.length > 0 ? projects[0] : null);
    const featuredNewsItem = newsItems.find(n => n.id === featuredItems.newsItemId) || (newsItems.length > 0 ? newsItems[0] : null);
    const featuredPublication = publications.find(p => p.id === featuredItems.publicationId) || (publications.length > 0 ? publications[0] : null);

    // Format date for display in news card
    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Handshake emoji for featured news
    const handshakeEmojiUrl = getOpenMojiUrl('1F91D'); // Handshake emoji hexcode

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-title-wrapper">
                        <BrainLogo className="hero-logo" />
                        <h1 className="hero-title">
                            Automated<br />
                            Scientific Discovery<br />
                            of <span className="highlight-text">Mind</span> and <span className="highlight-text">Brain</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Team Picture Section - Updated to include mission statement */}
            <section className="team-picture-section" style={{ marginTop: '4rem' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '2rem' }}>AI for Science <span style={{ color: 'grey' }}>Meets</span> Cognitive Science</h2>
                <div className="team-mission-container" style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'stretch',
                    marginBottom: '2rem',
                    flexDirection: 'row',
                    flexWrap: 'wrap' // Allow items to wrap to next line on smaller screens
                }}>
                    {/* Team Image - styled with responsive width */}
                    <Link to="/team" className="team-picture-link" style={{
                        flex: '1 1 400px', // Grow, shrink, and basis of 400px
                        minWidth: '280px', // Minimum width before wrapping
                        display: 'block',
                        minHeight: '400px'
                    }}>
                        <div className="team-picture-container" style={{
                            height: '100%',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div className="team-picture-overlay" style={{
                                backgroundColor: 'rgba(0, 170, 255, 0.3)',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1
                            }}></div>
                            <img
                                src={teamImage}
                                alt="Our Research Team"
                                className="team-picture"
                                style={{
                                    objectFit: 'cover',
                                    width: '100%',
                                    height: '100%',
                                    objectPosition: teamImagePosition,
                                    display: 'block',
                                    filter: 'none'
                                }}
                            />
                        </div>
                    </Link>

                    {/* Mission Statement - without card styling, responsive width */}
                    <div className="mission-statement" style={{
                        flex: '1 1 400px', // Grow, shrink, and basis of 400px
                        minWidth: '280px', // Minimum width before wrapping
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: '400px'
                    }}>
                        <h3 style={{ marginTop: '0', color: '#00AAFF' }}>Our Mission</h3>
                        <p style={{ lineHeight: '1.7', fontSize: '1rem' }}>
                            Our lab studies the computational principles that underlie the <b><span style={{ color: '#00AAFF' }}>capabilities and limitations of human cognition.</span></b> Ironically, as human scientists, we are constrained by the very cognitive limitations we seek to understand: the space of possible scientific models and experiments is too vast for the human brain to navigate alone, making it difficult to achieve an integrative understanding of the mind.
                        </p>
                        <p style={{ lineHeight: '1.7', fontSize: '1rem', marginBottom: '0' }}>
                            To overcome these limits, we integrate AI into the scientific process. We <b><span style={{ color: '#00AAFF' }}>build artificial scientists</span></b> that work alongside us as research partners — systems that can explore larger spaces of theories and experiments, and uncover patterns that human researchers might overlook. Together, we aim to better understand the computational principles behind human thought and behavior— and to push the boundaries of how science itself is done.
                        </p>
                    </div>
                </div>
            </section>

            <section className="featured-projects">
                <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '2rem' }}>Featured Content</h2>
                <div className="projects-grid">
                    {/* News Card */}
                    {featuredNewsItem && (
                        <Link to="/feed" className="project-card">
                            <div className="project-color-block" style={{ background: '#00AAFF' }}>
                                {/* Display emojis if they exist for the featured news item */}
                                {featuredNewsItem.emojiHexcodes && featuredNewsItem.emojiHexcodes.length > 0 ? (
                                    <div className="project-emoji-container">
                                        {featuredNewsItem.emojiHexcodes.map((hexcode, index) => (
                                            <img
                                                key={index}
                                                src={getOpenMojiUrl(hexcode, true)}
                                                alt={`News Emoji ${index+1}`}
                                                className="project-emoji"
                                                style={{ filter: 'invert(1)' }}
                                                onError={(e) => {
                                                    console.error(`Failed to load emoji with hexcode: ${hexcode}`);
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="project-emoji-container">
                                        <img 
                                            src={handshakeEmojiUrl} 
                                            alt="Handshake Emoji" 
                                            className="project-emoji"
                                            style={{ filter: 'invert(1)' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="project-content">
                                <h3 className="project-title">{featuredNewsItem.title}</h3>
                                <div className="news-meta">
                                    <span className="news-date">{formatDate(featuredNewsItem.date)}</span>
                                    <span className="news-author">By {featuredNewsItem.author}</span>
                                </div>
                                <p className="project-excerpt">
                                    {featuredNewsItem.content.length > 115
                                        ? `${featuredNewsItem.content.slice(0, 115)}...`
                                        : featuredNewsItem.content}
                                </p>
                                {featuredNewsItem.tags && featuredNewsItem.tags.length > 0 && (
                                    <div className="news-tags">
                                        {featuredNewsItem.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="news-tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )}

                    {/* Project Card */}
                    {featuredProject && <ProjectCard key={featuredProject.id} project={featuredProject} />}

                    {/* Publication Card */}
                    {featuredPublication && (
                        <Link to="/publications" className="project-card">
                            <div
                                className="project-color-block"
                                style={{ background: '#00AAFF' }}
                            >
                                {/* Always display bookmark emoji for publications - now using black and white version */}
                                <div className="project-emoji-container">
                                    <img
                                        src={getOpenMojiUrl('1F4D1', true)}
                                        alt="Publication Bookmark"
                                        className="project-emoji"
                                        style={{ filter: 'invert(1)' }}
                                        onError={(e) => {
                                            console.error('Failed to load bookmark emoji');
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="project-content">
                                <h3 className="project-title">{featuredPublication.title}</h3>
                                <p className="project-excerpt">
                                    {featuredPublication.authors.join(", ")}
                                </p>
                                {featuredPublication.abstract && (
                                    <p className="project-excerpt">
                                        {featuredPublication.abstract.length > 115
                                            ? `${featuredPublication.abstract.slice(0, 115)}...`
                                            : featuredPublication.abstract}
                                    </p>
                                )}
                                <div className="project-metadata">
                                    <span className="project-category">
                                        {featuredPublication.journal} ({featuredPublication.year})
                                    </span>
                                </div>
                                {featuredPublication.keywords && featuredPublication.keywords.length > 0 && (
                                    <div className="news-tags">
                                        {featuredPublication.keywords.slice(0, 3).map(keyword => (
                                            <span key={keyword} className="news-tag">{keyword}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    )}
                </div>

                {/* Update see all links container */}
                <div className="see-all-links-container" style={{ marginTop: '2rem' }}>
                    <Link to="/feed" className="see-more-link">
                        See all news <span className="arrow-icon">→</span>
                    </Link>
                    <Link to="/projects" className="see-more-link">
                        See all research areas <span className="arrow-icon">→</span>
                    </Link>
                    <Link to="/publications" className="see-more-link">
                        See all publications <span className="arrow-icon">→</span>
                    </Link>
                </div>
            </section>

            <section className="collaborators" style={{ marginTop: '4rem', marginBottom: '1rem' }}>
                <div className="collaborators-header">
                    <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '1rem' }}>Our Collaborators</h2>
                    {isAuthenticated && (
                        <Link to="/admin/collaborators" className="add-button">
                            Manage Collaborators
                        </Link>
                    )}
                </div>

                <div className="collaborator-list">
                    {collaborators.map(collaborator => (
                        <a
                            href={collaborator.url}
                            key={collaborator.id}
                            className="collaborator-tag"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {collaborator.logo && (
                                <img
                                    src={collaborator.logo}
                                    alt={`${collaborator.name} logo`}
                                    className="collaborator-logo"
                                />
                            )}
                            <span>{collaborator.name}</span>
                        </a>
                    ))}

                    {/* "Work with us!" card with plus sign in the text */}
                    <Link to="/contact" className="collaborator-tag collaborate-cta">
                        <div className="collaborate-icon">+</div>
                        <span>Work with us!</span>
                    </Link>
                </div>
            </section>

            {/* New "Our Funding" section */}
            <section className="collaborators funding-section" style={{ marginTop: '4rem', marginBottom: '1rem' }}>
                <div className="collaborators-header">
                    <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '1rem' }}>Our Funding</h2>
                    {isAuthenticated && (
                        <Link to="/admin/funding" className="add-button">
                            Manage Funding
                        </Link>
                    )}
                </div>

                <div className="collaborator-list">
                    {fundingSources.map(funding => (
                        <a
                            href={funding.url}
                            key={funding.id}
                            className="collaborator-tag funding-tag"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {funding.logo && (
                                <img
                                    src={funding.logo}
                                    alt={`${funding.name} logo`}
                                    className="collaborator-logo"
                                />
                            )}
                            <span>{funding.name}</span>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
