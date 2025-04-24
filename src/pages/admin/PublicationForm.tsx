import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import Layout from '../../components/Layout';
import { Publication } from '../../data/publications';

const PublicationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { publications, projects, teamMembers, software, updatePublication, addPublication, deletePublication, updateTeamMember, updateProject, updateSoftware } = useContent();

  // Form state
  const [title, setTitle] = useState('');
  const [journal, setJournal] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [type, setType] = useState<'journal article' | 'conference proceeding' | 'workshop contribution' | 'book' | 'book chapter' | 'preprint' | 'thesis' | 'commentary'>('journal article');
  const [authors, setAuthors] = useState<string[]>(['']);
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [abstract, setAbstract] = useState('');
  const [citation, setCitation] = useState('');
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [softwareIds, setSoftwareIds] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [pubId, setPubId] = useState('');

  // State for team member selection
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('');

  // UI state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're in create mode or edit mode
  const isNewPublication = !id || id === 'new';

  // Initialize a new publication ID only once when creating a new publication
  useEffect(() => {
    if (isNewPublication && !pubId) {
      const newId = `pub-${Date.now()}`;
      setPubId(newId);
      console.log("Created new publication ID:", newId);
    }
  }, [isNewPublication, pubId]);

  useEffect(() => {
    if (!isNewPublication) {
      // Only load existing data for edit mode
      const publicationToEdit = publications.find(pub => pub.id === id);
      if (publicationToEdit) {
        console.log("Editing existing publication:", publicationToEdit.title);
        setPubId(publicationToEdit.id);
        setTitle(publicationToEdit.title || '');
        setJournal(publicationToEdit.journal || '');
        setYear(publicationToEdit.year || new Date().getFullYear());
        setType(publicationToEdit.type || 'journal article');
        setAuthors(publicationToEdit.authors || ['']);
        setDoi(publicationToEdit.doi || '');
        setUrl(publicationToEdit.url || '');
        setAbstract(publicationToEdit.abstract || '');
        setCitation(publicationToEdit.citation || '');
        
        // Handle both projectId (string) and projectIds (array)
        if (publicationToEdit.projectIds && publicationToEdit.projectIds.length > 0) {
          setProjectIds(publicationToEdit.projectIds);
        } else if (publicationToEdit.projectId) {
          setProjectIds([publicationToEdit.projectId]);
        } else {
          setProjectIds([]);
        }
        
        // Handle software IDs
        setSoftwareIds(publicationToEdit.softwareIds || []);
        
        setKeywords(publicationToEdit.keywords || []);
      } else {
        setError(`Could not find publication with ID: ${id}`);
        console.error(`Could not find publication with ID: ${id}`);
      }
    }
  }, [id, isNewPublication, publications]);

  // Author management
  const handleAuthorChange = (index: number, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = value;
    setAuthors(newAuthors);
  };

  const handleAddAuthor = () => {
    setAuthors([...authors, '']);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = [...authors];
      newAuthors.splice(index, 1);
      setAuthors(newAuthors);
    }
  };

  // Add team member as author
  const handleAddTeamMemberAsAuthor = () => {
    if (selectedTeamMember) {
      const member = teamMembers.find(m => m.id === selectedTeamMember);

      if (member) {
        // Format team member name as "LastName, F." format typically used in publications
        const nameParts = member.name.split(' ');
        const lastName = nameParts[nameParts.length - 1];
        const firstInitial = nameParts[0][0];
        const formattedName = `${lastName}, ${firstInitial}.`;

        // Check if this author is already in the list
        if (!authors.some(author => author.includes(lastName))) {
          setAuthors([...authors, formattedName]);

          // IMMEDIATE UPDATE: Update the member's publications list to include this publication
          if (pubId) {
            const updatedMember = {
              ...member,
              publications: [...(member.publications || []), pubId]
            };

            // Remove duplicates if any
            updatedMember.publications = [...new Set(updatedMember.publications)];

            // Update the team member with the new publication reference
            updateTeamMember(updatedMember);

            // FORCE AN UPDATE EVENT: Let other components know about this change immediately
            window.dispatchEvent(new CustomEvent('publication-updated', {
              detail: {
                publicationId: pubId,
                teamMemberId: member.id,
                timestamp: Date.now(),
                action: 'add-author'
              }
            }));

            console.log(`Updated team member ${member.name} with publication: ${pubId}`);
          }
        }

        // Reset selection
        setSelectedTeamMember('');
      }
    }
  };
  
  // Projects selection
  const handleProjectsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setProjectIds(selected);
  };
  
  // Software selection
  const handleSoftwareChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSoftwareIds(selected);
  };

  // Keyword management
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords(prevKeywords => [...prevKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(prevKeywords => prevKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !journal || !authors.length || !year || !type || !citation) {
      setError('Please fill in all required fields');
      return;
    }

    // Remove empty author entries
    const filteredAuthors = authors.filter(author => author.trim() !== '');

    if (filteredAuthors.length === 0) {
      setError('Please add at least one author');
      return;
    }

    // Clear any previous errors
    setError(null);

    try {
      // Construct the publication object
      const publicationData: Publication = {
        id: pubId,
        title,
        journal,
        year,
        type,
        authors: filteredAuthors,
        citation
      };

      // Add optional fields if they exist
      if (doi) publicationData.doi = doi;
      if (url) publicationData.url = url;
      if (abstract) publicationData.abstract = abstract;
      if (projectIds.length > 0) {
        publicationData.projectIds = projectIds;
        publicationData.projectId = projectIds[0]; // Set first project as primary for backward compatibility
      }
      if (softwareIds.length > 0) {
        publicationData.softwareIds = softwareIds;
      }
      if (keywords.length > 0) publicationData.keywords = [...keywords];

      console.log("Saving publication:", publicationData);

      // Track the old project IDs for reference
      const oldPublication = isNewPublication ? null : publications.find(pub => pub.id === pubId);
      const oldProjectIds = oldPublication?.projectIds || (oldPublication?.projectId ? [oldPublication.projectId] : []);
      const oldSoftwareIds = oldPublication?.softwareIds || [];

      // Get the team member IDs that match the authors
      const teamMembersInPublication = teamMembers.filter(member => {
        // Check if any author contains the team member's last name
        const lastName = member.name.split(' ').pop()?.toLowerCase() || '';
        return filteredAuthors.some(author =>
          author.toLowerCase().includes(lastName)
        );
      });

      if (isNewPublication) {
        const addedPublication = addPublication(publicationData);
        console.log("Added new publication with ID:", addedPublication.id);

        // Update team members with publication reference
        teamMembersInPublication.forEach(member => {
          // Check if the publication is already in the member's publications array
          const memberPublications = member.publications || [];
          if (!memberPublications.includes(addedPublication.id)) {
            const updatedMember = {
              ...member,
              publications: [...memberPublications, addedPublication.id]
            };
            updateTeamMember(updatedMember);
            console.log(`Added publication ${addedPublication.id} to team member ${member.name}`);
          }
        });

        // Update projects with this publication reference
        projectIds.forEach(projectId => {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            // Add this publication to the project
            const updatedProject = {
              ...project,
              publications: [...(project.publications || []), addedPublication.id]
            };
            updateProject(updatedProject);
            console.log(`Added publication ${addedPublication.id} to project ${projectId}`);
          }
        });
        
        // Update software with this publication reference
        softwareIds.forEach(softwareId => {
          const sw = software.find(s => s.id === softwareId);
          if (sw) {
            // Add this publication to the software
            const updatedSoftware = {
              ...sw,
              publicationIds: [...(sw.publicationIds || []), addedPublication.id]
            };
            updateSoftware(updatedSoftware);
            console.log(`Added publication ${addedPublication.id} to software ${softwareId}`);
          }
        });

        // IMMEDIATE UPDATE: Ensure the UI is updated right away
        window.dispatchEvent(new CustomEvent('publication-updated', {
          detail: {
            publicationId: addedPublication.id,
            teamMemberIds: teamMembersInPublication.map(m => m.id),
            timestamp: Date.now(),
            action: 'new-publication'
          }
        }));
      } else {
        updatePublication(publicationData);
        console.log("Updated existing publication:", publicationData.id);

        // Handle project association changes - removed projects
        oldProjectIds.forEach(oldProjectId => {
          if (!projectIds.includes(oldProjectId)) {
            const oldProject = projects.find(p => p.id === oldProjectId);
            if (oldProject && oldProject.publications) {
              const updatedProject = {
                ...oldProject,
                publications: oldProject.publications.filter(id => id !== pubId)
              };
              updateProject(updatedProject);
              console.log(`Removed publication ${pubId} from project ${oldProjectId}`);
            }
          }
        });

        // Handle project association changes - added projects
        projectIds.forEach(projectId => {
          if (!oldProjectIds.includes(projectId)) {
            const newProject = projects.find(p => p.id === projectId);
            if (newProject) {
              const projectPubs = newProject.publications || [];
              if (!projectPubs.includes(pubId)) {
                const updatedProject = {
                  ...newProject,
                  publications: [...projectPubs, pubId]
                };
                updateProject(updatedProject);
                console.log(`Added publication ${pubId} to project ${projectId}`);
              }
            }
          }
        });
        
        // Handle software association changes - removed software
        oldSoftwareIds.forEach(oldSoftwareId => {
          if (!softwareIds.includes(oldSoftwareId)) {
            const oldSoftware = software.find(s => s.id === oldSoftwareId);
            if (oldSoftware && oldSoftware.publicationIds) {
              const updatedSoftware = {
                ...oldSoftware,
                publicationIds: oldSoftware.publicationIds.filter(id => id !== pubId)
              };
              updateSoftware(updatedSoftware);
              console.log(`Removed publication ${pubId} from software ${oldSoftwareId}`);
            }
          }
        });
        
        // Handle software association changes - added software
        softwareIds.forEach(softwareId => {
          if (!oldSoftwareIds.includes(softwareId)) {
            const newSoftware = software.find(s => s.id === softwareId);
            if (newSoftware) {
              const softwarePubs = newSoftware.publicationIds || [];
              if (!softwarePubs.includes(pubId)) {
                const updatedSoftware = {
                  ...newSoftware,
                  publicationIds: [...softwarePubs, pubId]
                };
                updateSoftware(updatedSoftware);
                console.log(`Added publication ${pubId} to software ${softwareId}`);
              }
            }
          }
        });

        // Make sure team members have this publication in their list
        teamMembersInPublication.forEach(member => {
          const memberPublications = member.publications || [];
          if (!memberPublications.includes(pubId)) {
            const updatedMember = {
              ...member,
              publications: [...memberPublications, pubId]
            };
            updateTeamMember(updatedMember);
            console.log(`Added publication ${pubId} to team member ${member.name}`);
          }
        });

        // IMMEDIATE UPDATE: Ensure the UI is updated right away
        window.dispatchEvent(new CustomEvent('publication-updated', {
          detail: {
            publicationId: pubId,
            teamMemberIds: teamMembersInPublication.map(m => m.id),
            timestamp: Date.now(),
            action: 'update-publication'
          }
        }));
      }

      // Trigger an update event so other components can refresh
      const updateEvent = new CustomEvent('publication-updated', {
        detail: {
          publicationId: pubId,
          timestamp: Date.now(),
          teamMembers: teamMembersInPublication.map(m => m.id)
        }
      });
      window.dispatchEvent(updateEvent);
      console.log("Dispatched publication-updated event");

      setFormSubmitted(true);
      setTimeout(() => {
        navigate('/admin/publications');
      }, 1500);
    } catch (error) {
      console.error("Error saving publication:", error);
      setError("An error occurred while saving the publication.");
    }
  };

  // Handle publication deletion
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      setIsDeleting(true);

      // Before deletion, clean up references
      const publicationToDelete = publications.find(p => p.id === pubId);

      // Get all project IDs associated with this publication
      const associatedProjectIds = publicationToDelete?.projectIds || 
        (publicationToDelete?.projectId ? [publicationToDelete.projectId] : []);
      
      // Get all software IDs associated with this publication
      const associatedSoftwareIds = publicationToDelete?.softwareIds || [];

      // Remove from each project's publications list
      associatedProjectIds.forEach(projectId => {
        const project = projects.find(p => p.id === projectId);
        if (project && project.publications) {
          const updatedProject = {
            ...project,
            publications: project.publications.filter(id => id !== pubId)
          };
          updateProject(updatedProject);
        }
      });
      
      // Remove from each software's publications list
      associatedSoftwareIds.forEach(softwareId => {
        const sw = software.find(s => s.id === softwareId);
        if (sw && sw.publicationIds) {
          const updatedSoftware = {
            ...sw,
            publicationIds: sw.publicationIds.filter(id => id !== pubId)
          };
          updateSoftware(updatedSoftware);
        }
      });

      // Remove from team members' publications lists
      teamMembers.forEach(member => {
        if (member.publications && member.publications.includes(pubId)) {
          const updatedMember = {
            ...member,
            publications: member.publications.filter(id => id !== pubId)
          };
          updateTeamMember(updatedMember);
        }
      });

      deletePublication(pubId);

      // Notify other components about the deletion
      window.dispatchEvent(new CustomEvent('publication-updated', {
        detail: {
          publicationId: pubId,
          action: 'delete',
          timestamp: Date.now()
        }
      }));

      setTimeout(() => {
        navigate('/admin/publications');
      }, 1000);
    }
  };

  // Show deletion message
  if (isDeleting) {
    return (
      <Layout>
        <div className="admin-form-container">
          <div className="success-message">
            Publication deleted successfully. Redirecting...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-form-container">
        <h1>{isNewPublication ? 'Add Publication' : 'Edit Publication'}</h1>

        {/* Success message */}
        {formSubmitted && (
          <div className="success-message">
            Publication successfully {isNewPublication ? 'added' : 'updated'}! Redirecting...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="journal">Journal/Conference/Book*</label>
            <input
              type="text"
              id="journal"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year*</label>
              <input
                type="number"
                id="year"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 5}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Publication Type*</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                required
              >
                <option value="journal article">Journal Article</option>
                <option value="conference proceeding">Conference Proceeding</option>
                <option value="workshop contribution">Workshop Contribution</option>
                <option value="book chapter">Book Chapter</option>
                <option value="book">Book</option>
                <option value="commentary">Commentary</option>
                <option value="preprint">Preprint</option>
                <option value="thesis">Thesis/Dissertation</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Authors*</label>

            {/* Team member selection */}
            <div className="team-member-author-selection">
              <select
                value={selectedTeamMember}
                onChange={(e) => setSelectedTeamMember(e.target.value)}
                className="team-member-select"
              >
                <option value="">-- Add team member as author --</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTeamMemberAsAuthor}
                className="add-author-button"
                disabled={!selectedTeamMember}
              >
                Add to Authors
              </button>
            </div>

            {/* Existing author inputs */}
            {authors.map((author, index) => (
              <div key={index} className="author-input-row">
                <input
                  type="text"
                  value={author}
                  onChange={(e) => handleAuthorChange(index, e.target.value)}
                  placeholder="Author Name (e.g., Smith, J.)"
                  style={{ marginBottom: '5px' }}
                  required={index === 0}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAuthor(index)}
                  className="remove-button"
                  disabled={authors.length <= 1 && index === 0}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAuthor}
              className="add-field-button"
            >
              Add Author
            </button>
            <p className="form-help-text">
              You can add team members from the dropdown or manually enter authors using "LastName, F." format
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doi">DOI (optional)</label>
              <input
                type="text"
                id="doi"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="10.xxxx/xxxxx"
              />
            </div>

            <div className="form-group">
              <label htmlFor="url">URL (optional)</label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://doi.org/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="abstract">Abstract (optional)</label>
            <textarea
              id="abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="citation">Citation*</label>
            <textarea
              id="citation"
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              rows={3}
              placeholder="Full citation text (e.g., Author, A. (Year). Title. Journal, Vol(Issue), pages.)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectIds">Related Projects (optional)</label>
            <select
              id="projectIds"
              multiple
              value={projectIds}
              onChange={handleProjectsChange}
              style={{ height: '120px' }}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple projects</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="softwareIds">Related Software (optional)</label>
            <select
              id="softwareIds"
              multiple
              value={softwareIds}
              onChange={handleSoftwareChange}
              style={{ height: '120px' }}
            >
              {software.map(sw => (
                <option key={sw.id} value={sw.id}>
                  {sw.name}
                </option>
              ))}
            </select>
            <p className="form-help-text">Hold Ctrl/Cmd to select multiple software packages</p>
          </div>

          <div className="form-group">
            <label>Keywords (optional)</label>
            <div className="tag-input-container">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Type a keyword and press Enter"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="tag-add-button"
              >
                Add
              </button>
            </div>
            <div className="tags-container">
              {keywords.map(keyword => (
                <div key={keyword} className="tag-badge">
                  {keyword}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            {!isNewPublication && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
              >
                Delete Publication
              </button>
            )}
            <div className="right-buttons">
              <button
                type="button"
                onClick={() => navigate('/admin/publications')}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="save-button">
                {isNewPublication ? 'Add Publication' : 'Update Publication'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PublicationForm;
