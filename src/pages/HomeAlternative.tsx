import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectCard } from '../components/Components';
import { projects } from '../data/projects';
import '../styles/styles.css';

const Home: React.FC = () => {
    // Get 3 featured projects
    const featuredProjects = projects.slice(0, 3);

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-title-wrapper">
                        {/* Inline SVG as a fallback solution */}
                        <svg 
                            className="hero-logo" 
                            width="80" 
                            height="80" 
                            viewBox="0 0 80 80" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Brain outline shape */}
                            <path d="M40 10C29.4 10 20 18.4 20 30C20 33.6 21 37 22.8 39.8C23.8 41.4 24.2 43.2 24 45C23.8 47 22.8 48.8 21.2 50C19.2 51.6 18 54 18 56.6C18 61.4 21.8 65.4 26.6 65.8C27.6 68.6 30.2 70.6 33.4 70.6C35.8 70.6 38 69.4 39.4 67.4C40.8 69.4 43 70.6 45.4 70.6C48.6 70.6 51.2 68.6 52.2 65.8C57 65.4 60.8 61.4 60.8 56.6C60.8 54 59.6 51.6 57.6 50C56 48.8 55 47 54.8 45C54.6 43.2 55 41.4 56 39.8C57.8 37 58.8 33.6 58.8 30C58.8 18.4 49.4 10 40 10Z" stroke="black" strokeWidth="2.5" fill="none"/>
                            
                            {/* Neural connections */}
                            <path d="M30 30C35 35 45 35 50 30" stroke="black" strokeWidth="1.5" fill="none"/>
                            <path d="M30 40C35 45 45 45 50 40" stroke="black" strokeWidth="1.5" fill="none"/>
                            <path d="M30 50C35 55 45 55 50 50" stroke="black" strokeWidth="1.5" fill="none"/>
                            
                            {/* Neural nodes */}
                            <circle cx="30" cy="30" r="3" fill="#333333"/>
                            <circle cx="50" cy="30" r="3" fill="#333333"/>
                            <circle cx="30" cy="40" r="3" fill="#333333"/>
                            <circle cx="50" cy="40" r="3" fill="#333333"/>
                            <circle cx="30" cy="50" r="3" fill="#333333"/>
                            <circle cx="50" cy="50" r="3" fill="#333333"/>
                            <circle cx="40" cy="25" r="3" fill="#333333"/>
                            <circle cx="40" cy="55" r="3" fill="#333333"/>
                        </svg>
                        
                        <h1>Automated<br/>Scientific Discovery<br/>of Mind and Brain</h1>
                    </div>
                    <p className="hero-text">
                        We're exploring the frontiers of neuroscience and artificial intelligence 
                        to understand the fundamental principles of the mind and brain.
                    </p>
                </div>
            </div>

            <div className="featured-projects">
                <h2>Featured Projects</h2>
                <div className="projects-grid">
                    {featuredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>

            <div className="collaborators">
                <h2>Our Collaborators</h2>
                <div className="collaborator-logos">
                    <div className="collaborator-logo">University of Science</div>
                    <div className="collaborator-logo">Neural Tech Institute</div>
                    <div className="collaborator-logo">Brain Research Center</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
