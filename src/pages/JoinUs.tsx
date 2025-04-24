import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import Layout from '../components/Layout';
import '../styles/styles.css';

const JoinUs: React.FC = () => {
  const { jobOpenings, projects } = useContent();
  const [selectedType, setSelectedType] = useState<string>('All');

  // Get unique job types
  const allTypes = jobOpenings.map(job => job.type);
  const uniqueTypes = ['All', ...Array.from(new Set(allTypes))];

  // Filter job openings by selected type and only show open positions
  const filteredJobs = selectedType === 'All'
    ? jobOpenings.filter(job => job.isOpen)
    : jobOpenings.filter(job => job.isOpen && job.type === selectedType);

  // Format job type for display
  const formatJobType = (type: string): string => {
    switch(type) {
      case 'full-time': return 'Full-time';
      case 'part-time': return 'Part-time';
      case 'internship': return 'Internship';
      case 'phd': return 'PhD Position';
      case 'postdoc': return 'Postdoctoral Position';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get project title by ID
  const getProjectTitle = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'General';
  };

  return (
    <Layout>
      <div className="projects-page">
        <div className="projects-header">
          <h1>Join Our Team</h1>
          <p>Explore current opportunities to work with our lab.</p>
        </div>

        {/*
        <div className="join-us-intro">
          <p>
            We are looking for talented and passionate individuals to join our interdisciplinary team.
            Our lab offers a collaborative environment where researchers can contribute to cutting-edge
            projects in neuroscience, artificial intelligence, and brain-computer interfaces.
          </p>

          <h2>Why Join Us?</h2>
          <ul className="benefits-list">
            <li>Work on groundbreaking research with real-world impact</li>
            <li>Access to state-of-the-art equipment and resources</li>
            <li>Collaborative environment with experts across disciplines</li>
            <li>Opportunities for professional development and publication</li>
            <li>Flexible working arrangements and competitive compensation</li>
          </ul>
        </div>
        */}

        <h2>Open Positions</h2>

        <div className="tag-filter">
          <h3>Filter by Position Type</h3>
          <div className="tag-list">
            {uniqueTypes.map(type => (
              <button
                key={type}
                className={`tag-button ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type === 'All' ? 'All Positions' : formatJobType(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="job-openings-list">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="job-opening-card">
                <h3 className="job-title">{job.title}</h3>

                <div className="job-meta">
                  <span className="job-type">{formatJobType(job.type)}</span>
                  <span className="job-location">{job.location}</span>
                  {job.projectId && (
                    <Link to={`/projects/${job.projectId}`} className="job-project">
                      Project: {getProjectTitle(job.projectId)}
                    </Link>
                  )}
                </div>

                <p className="job-description">{job.description}</p>

                <div className="job-requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="job-dates">
                  <div>Posted: {new Date(job.postedDate).toLocaleDateString()}</div>
                  {job.closingDate && (
                    <div>Apply by: {new Date(job.closingDate).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="job-apply">
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      className="apply-button"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now
                    </a>
                  ) : job.contactEmail ? (
                    <a
                      href={`mailto:${job.contactEmail}?subject=Application for ${job.title}`}
                      className="apply-button"
                    >
                      Apply via Email
                    </a>
                  ) : (
                    <Link to="/contact" className="apply-button">
                      Contact Us to Apply
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">
              <p>No open positions currently match your criteria. Please check back later or <Link to="/contact">contact us</Link> with your CV to be considered for future opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JoinUs;
