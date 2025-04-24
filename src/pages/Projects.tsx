import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { ProjectCard } from '../components/Components';
import { Project } from '../data/projects';
import '../styles/styles.css';

const Projects: React.FC = () => {
  const { projects } = useContent();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [keywordSearch, setKeywordSearch] = useState<string>('');

  // Get unique disciplines
  const allDisciplines = projects.flatMap(project =>
    Array.isArray(project.category)
      ? project.category
      : [project.category]
  );
  const uniqueDisciplines = ['All', ...Array.from(new Set(allDisciplines))];

  // Get unique methods across all projects
  const allMethods = projects.flatMap(project => project.topics || []);
  const uniqueMethods = ['All', ...Array.from(new Set(allMethods))];

  // Filter projects by selected discipline, method, and keyword search
  const filteredProjects = projects
    .filter(project =>
      selectedDiscipline === 'All' ||
      (typeof project.category === 'string' && project.category === selectedDiscipline) ||
      (Array.isArray(project.category) && project.category.includes(selectedDiscipline))
    )
    .filter(project => selectedMethod === 'All' || project.topics?.includes(selectedMethod))
    .filter(project => {
      if (!keywordSearch.trim()) return true;
      const searchTerms = keywordSearch.toLowerCase().trim().split(/\s+/);
      const projectText = `${project.title} ${project.description}`.toLowerCase();

      // Project must match at least one search term
      return searchTerms.some(term => projectText.includes(term));
    });

  // Handle keyword search input change
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordSearch(e.target.value);
  };

  // Handle pressing Enter in the search field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Search is automatically applied as the user types
    }
  };

  // Clear search
  const clearSearch = () => {
    setKeywordSearch('');
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Research Areas</h1>
        <p>Our lab develops and applies AI systems to automate scientific discovery—exploring spaces of experiments, models, and theories that extend beyond the cognitive limits of human researchers. We use these tools to investigate fundamental faculties of human cognition, including cognitive control, learning, and decision-making.</p>
      </div>

      <div className="filter-container">
        <div className="tag-filter">
          <h3>Filter by Topic</h3>
          <div className="tag-list">
            {uniqueDisciplines.map(discipline => (
              <button
                key={discipline}
                className={`tag-button ${selectedDiscipline === discipline ? 'active' : ''}`}
                onClick={() => setSelectedDiscipline(discipline)}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>

        <div className="tag-filter">
          <h3>Filter by Method</h3>
          <div className="tag-list">
            {uniqueMethods.map(method => (
              <button
                key={method}
                className={`tag-button ${selectedMethod === method ? 'active' : ''}`}
                onClick={() => setSelectedMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="tag-filter">
          <h3>Search Research Areas</h3>
          <div className="search-container">
            <input
              type="text"
              value={keywordSearch}
              onChange={handleKeywordChange}
              onKeyDown={handleKeyDown}
              placeholder="Search titles, descriptions, keywords..."
              className="keyword-search"
            />
            {keywordSearch && (
              <button
                onClick={clearSearch}
                className="clear-search-button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project: Project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="no-projects">
            <p>No projects found with the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
