import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Publication } from '../data/publications';
import { useContent } from '../contexts/ContentContext';
import '../styles/styles.css';

const Publications: React.FC = () => {
  const { projects, publications, software } = useContent();
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedSoftware, setSelectedSoftware] = useState<string>('All');
  const [keywordSearch, setKeywordSearch] = useState<string>('');

  // Get unique years
  const years = Array.from(new Set(publications.map(pub => pub.year.toString())));
  years.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order

  // Get unique publication types
  const pubTypes = Array.from(new Set(publications.map(pub => pub.type)));

  // Get projects that have publications
  const projectsWithPublications = projects.filter(project =>
    publications.some(pub =>
      (pub.projectId === project.id) ||
      (pub.projectIds && pub.projectIds.includes(project.id))
    )
  );

  // Get software with publications
  const softwareWithPublications = software.filter(sw =>
    publications.some(pub => pub.softwareIds && pub.softwareIds.includes(sw.id))
  );

  // Filter publications
  const filteredPublications = publications.filter(publication => {
    // Match year filter
    const matchesYear = selectedYear === 'All' || publication.year.toString() === selectedYear;

    // Match type filter
    const matchesType = selectedType === 'All' || publication.type === selectedType;

    // Match project filter
    const matchesProject = selectedProject === 'All' ||
      publication.projectId === selectedProject ||
      (publication.projectIds && publication.projectIds.includes(selectedProject));

    // Match software filter
    const matchesSoftware = selectedSoftware === 'All' ||
      (publication.softwareIds && publication.softwareIds.includes(selectedSoftware));

    // Enhanced search: search across title, abstract, authors, journal, and keywords
    const matchesSearch = !keywordSearch.trim() || (() => {
      const searchTerms = keywordSearch.toLowerCase().trim().split(/\s+/);

      // Create a combined text of all relevant fields for search
      const titleText = publication.title.toLowerCase();
      const abstractText = publication.abstract?.toLowerCase() || '';
      const authorText = publication.authors.join(' ').toLowerCase();
      const journalText = publication.journal.toLowerCase();
      const keywordsText = publication.keywords?.join(' ').toLowerCase() || '';
      const doiText = publication.doi?.toLowerCase() || '';

      // Combine all text fields for comprehensive search
      const fullText = `${titleText} ${abstractText} ${authorText} ${journalText} ${keywordsText} ${doiText}`;

      // Match if any search term is found in any field
      return searchTerms.some(term => fullText.includes(term));
    })();

    return matchesYear && matchesType && matchesProject && matchesSoftware && matchesSearch;
  });

  // Sort publications by year (newest first)
  const sortedPublications = [...filteredPublications].sort((a, b) => b.year - a.year);

  // Function to get project titles by IDs
  const getProjectTitles = (publication: Publication): JSX.Element[] => {
    // Collect all project IDs, including both legacy projectId and new projectIds array
    const projectIds: string[] = [];
    if (publication.projectId) projectIds.push(publication.projectId);
    if (publication.projectIds) projectIds.push(...publication.projectIds.filter(id => id !== publication.projectId));

    // Remove duplicates
    const uniqueProjectIds = [...new Set(projectIds)];

    return uniqueProjectIds.map(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return null;

      return (
        <Link key={projectId} to={`/projects/${projectId}`} className="related-project-link">
          {project.title}
        </Link>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  // Function to get software names by IDs
  const getSoftwareLinks = (publication: Publication): JSX.Element[] => {
    if (!publication.softwareIds || publication.softwareIds.length === 0) {
      return [];
    }

    return publication.softwareIds.map(softwareId => {
      const sw = software.find(s => s.id === softwareId);
      if (!sw) return null;

      return (
        <Link key={softwareId} to={`/software/${softwareId}`} className="related-software-link">
          {sw.name}
        </Link>
      );
    }).filter(Boolean) as JSX.Element[];
  };

  // Handle keyword search input change
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordSearch(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setKeywordSearch('');
  };

  return (
    <div className="publications-page">
      <div className="projects-header">
        <h1>Publications</h1>
        <p>Research papers, conference proceedings, and other published work from our lab. If you are having trouble accessing an article, feel free to reach out.</p>
      </div>

      <div className="filter-container">
        <div className="tag-filter">
          <h3>Filter by Year</h3>
          <div className="tag-list">
            <button
              className={`tag-button ${selectedYear === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedYear('All')}
            >
              All
            </button>
            {years.map(year => (
              <button
                key={year}
                className={`tag-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="tag-filter">
          <h3>Filter by Type</h3>
          <div className="tag-list">
            <button
              className={`tag-button ${selectedType === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedType('All')}
            >
              All
            </button>
            {pubTypes.map(type => (
              <button
                key={type}
                className={`tag-button ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {projectsWithPublications.length > 0 && (
          <div className="tag-filter">
            <h3>Filter by Research Area</h3>
            <div className="tag-list">
              <button
                className={`tag-button ${selectedProject === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedProject('All')}
              >
                All Research Areas
              </button>
              {projectsWithPublications.map(project => (
                <button
                  key={project.id}
                  className={`tag-button ${selectedProject === project.id ? 'active' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  {project.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {softwareWithPublications.length > 0 && (
          <div className="tag-filter">
            <h3>Filter by Software</h3>
            <div className="tag-list">
              <button
                className={`tag-button ${selectedSoftware === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedSoftware('All')}
              >
                All Software
              </button>
              {softwareWithPublications.map(sw => (
                <button
                  key={sw.id}
                  className={`tag-button ${selectedSoftware === sw.id ? 'active' : ''}`}
                  onClick={() => setSelectedSoftware(sw.id)}
                >
                  {sw.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="tag-filter">
          <h3>Search Publications</h3>
          <div className="search-container">
            <input
              type="text"
              value={keywordSearch}
              onChange={handleKeywordChange}
              placeholder="Search titles, authors, keywords, etc..."
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

      <div className="publications-list">
        {sortedPublications.length > 0 ? (
          sortedPublications.map(publication => (
            <div key={publication.id} className="publication-item">
              <h3 className="publication-title">
                {publication.url ? (
                  <a href={publication.url} target="_blank" rel="noopener noreferrer">
                    {publication.title}
                  </a>
                ) : (
                  publication.title
                )}
              </h3>

              <p className="publication-authors">{publication.authors.join(", ")}</p>

              <div className="publication-meta">
                <span className="publication-journal">{publication.journal}</span>
                <span className="publication-year">{publication.year}</span>
                <span className="publication-type">{publication.type}</span>
              </div>

              {publication.abstract && (
                <div className="publication-abstract">
                  <p>{publication.abstract}</p>
                </div>
              )}

              {publication.keywords && (
                <div className="publication-keywords">
                  {publication.keywords.map(keyword => (
                    <span key={keyword} className="publication-keyword">{keyword}</span>
                  ))}
                </div>
              )}

              {/* Display related projects */}
              {(publication.projectId || (publication.projectIds && publication.projectIds.length > 0)) && (
                <div className="publication-project">
                  <span>Related Research {getProjectTitles(publication).length > 1 ? 'Areas' : 'Area'}: </span>
                  <div className="related-links">
                    {getProjectTitles(publication)}
                  </div>
                </div>
              )}

              {/* Display related software */}
              {publication.softwareIds && publication.softwareIds.length > 0 && (
                <div className="publication-software">
                  <span>Related Software: </span>
                  <div className="related-links">
                    {getSoftwareLinks(publication)}
                  </div>
                </div>
              )}

              {publication.doi && (
                <div className="publication-doi">
                  <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                    DOI: {publication.doi}
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-publications">
            <p>No publications found with the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;
