import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Project, projects as initialProjects } from '../data/projects';
import { TeamMember, teamMembers as initialTeamMembers } from '../data/team';
import { NewsItem, newsItems as initialNewsItems } from '../data/news';
import { Collaborator, collaborators as initialCollaborators } from '../data/collaborators';
import { FundingSource, fundingSources as initialFundingSources } from '../data/funding';
import { Publication, publications as initialPublications } from '../data/publications';
import { Software, software as initialSoftware } from '../data/software';
import { JobOpening, jobOpenings as initialJobOpenings } from '../data/jobOpenings';
import { createGradient, generateTopicColor, createProjectGradient, hexToHsl, LAB_COLOR } from '../utils/colorUtils';

// Define the context type from ContentContext.tsx
import { ContentContext, TopicColor } from './ContentContext';

// Create the provider component
export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for each data type
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [topicColorRegistry, setTopicColorRegistry] = useState<Record<string, TopicColor>>({});
  
  // State for featured items
  const [featuredProject, setFeaturedProject] = useState<string | null>(null);
  const [featuredNewsItem, setFeaturedNewsItem] = useState<string | null>(null);
  const [featuredPublication, setFeaturedPublication] = useState<string | null>(null);
  
  // State for team image
  const [teamImage, setTeamImage] = useState<string>('/assets/lab_team.jpeg');
  // State for team image position
  const [teamImagePosition, setTeamImagePosition] = useState<string>('center');

  // Load data from localStorage or use initial data
  useEffect(() => {
    // Load projects
    const savedProjects = localStorage.getItem('projects');
    setProjects(savedProjects ? JSON.parse(savedProjects) : initialProjects);
    
    // Load team members
    const savedTeamMembers = localStorage.getItem('teamMembers');
    setTeamMembers(savedTeamMembers ? JSON.parse(savedTeamMembers) : initialTeamMembers);
    
    // Load news items
    const savedNewsItems = localStorage.getItem('newsItems');
    setNewsItems(savedNewsItems ? JSON.parse(savedNewsItems) : initialNewsItems);
    
    // Load collaborators
    const savedCollaborators = localStorage.getItem('collaborators');
    setCollaborators(savedCollaborators ? JSON.parse(savedCollaborators) : initialCollaborators);
    
    // Load funding sources
    const savedFundingSources = localStorage.getItem('fundingSources');
    setFundingSources(savedFundingSources ? JSON.parse(savedFundingSources) : initialFundingSources);
    
    // Load publications
    const savedPublications = localStorage.getItem('publications');
    setPublications(savedPublications ? JSON.parse(savedPublications) : initialPublications);
    
    // Load software
    const savedSoftware = localStorage.getItem('software');
    setSoftware(savedSoftware ? JSON.parse(savedSoftware) : initialSoftware);
    
    // Load job openings
    const savedJobOpenings = localStorage.getItem('jobOpenings');
    setJobOpenings(savedJobOpenings ? JSON.parse(savedJobOpenings) : initialJobOpenings);
    
    // Load featured items
    const savedFeaturedItems = localStorage.getItem('featuredItems');
    if (savedFeaturedItems) {
      const featuredItems = JSON.parse(savedFeaturedItems);
      setFeaturedProject(featuredItems.projectId || null);
      setFeaturedNewsItem(featuredItems.newsItemId || null);
      setFeaturedPublication(featuredItems.publicationId || null);
    }
    
    // Load team image
    const savedTeamImage = localStorage.getItem('teamImage');
    if (savedTeamImage) {
      setTeamImage(savedTeamImage);
    }
    
    // Load team image position
    const savedTeamImagePosition = localStorage.getItem('teamImagePosition');
    if (savedTeamImagePosition) {
      setTeamImagePosition(savedTeamImagePosition);
    }
    
    // Load topic color registry
    const savedTopicColors = localStorage.getItem('topicColorRegistry');
    if (savedTopicColors) {
      setTopicColorRegistry(JSON.parse(savedTopicColors));
    } else {
      // Initialize with topic colors from projects
      const registry: Record<string, TopicColor> = {};
      
      initialProjects.forEach(project => {
        if (project.topicsWithColors) {
          project.topicsWithColors.forEach(topic => {
            if (!registry[topic.name]) {
              registry[topic.name] = {
                name: topic.name,
                color: topic.color,
                hue: topic.hue
              };
            }
          });
        }
      });
      
      setTopicColorRegistry(registry);
      localStorage.setItem('topicColorRegistry', JSON.stringify(registry));
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);
  
  useEffect(() => {
    localStorage.setItem('newsItems', JSON.stringify(newsItems));
  }, [newsItems]);
  
  useEffect(() => {
    localStorage.setItem('collaborators', JSON.stringify(collaborators));
  }, [collaborators]);
  
  useEffect(() => {
    localStorage.setItem('fundingSources', JSON.stringify(fundingSources));
  }, [fundingSources]);
  
  useEffect(() => {
    localStorage.setItem('publications', JSON.stringify(publications));
  }, [publications]);
  
  useEffect(() => {
    localStorage.setItem('software', JSON.stringify(software));
  }, [software]);
  
  useEffect(() => {
    localStorage.setItem('jobOpenings', JSON.stringify(jobOpenings));
  }, [jobOpenings]);
  
  useEffect(() => {
    localStorage.setItem('topicColorRegistry', JSON.stringify(topicColorRegistry));
  }, [topicColorRegistry]);

  // Topic color management functions
  const updateTopicColor = (name: string, color: string) => {
    const [hue] = hexToHsl(color);
    
    setTopicColorRegistry(prev => ({
      ...prev,
      [name]: {
        name,
        color,
        hue
      }
    }));
    
    // Update all projects that use this topic
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.topics?.includes(name) && project.topicsWithColors) {
          const updatedTopicsWithColors = project.topicsWithColors.map(topic => 
            topic.name === name ? { 
              ...topic, 
              color, 
              hue 
            } : topic
          );
          
          return {
            ...project,
            topicsWithColors: updatedTopicsWithColors
          };
        }
        return project;
      })
    );
  };
  
  const addTopicColor = (name: string, color: string) => {
    const [hue] = hexToHsl(color);
    
    setTopicColorRegistry(prev => ({
      ...prev,
      [name]: {
        name,
        color,
        hue
      }
    }));
  };
  
  const removeTopicColor = (name: string) => {
    setTopicColorRegistry(prev => {
      const newRegistry = { ...prev };
      delete newRegistry[name];
      return newRegistry;
    });
  };
  
  const getTopicColorByName = (name: string): TopicColor | undefined => {
    return topicColorRegistry[name];
  };

  // Project operations
  const updateProject = (updatedProject: Project) => {
    // Apply topic colors from registry to ensure consistency
    const projectWithUpdatedTopicColors = {
      ...updatedProject
    };
    
    // Update topicsWithColors based on the registry
    if (updatedProject.topics) {
      const updatedTopicsWithColors = updatedProject.topics.map(topic => {
        const registryColor = topicColorRegistry[topic];
        
        // Use registered color or generate a new one
        if (registryColor) {
          return {
            name: topic,
            color: registryColor.color,
            hue: registryColor.hue
          };
        } else {
          // Generate color and add to registry
          const hue = Math.round(Math.random() * 360);
          const color = generateTopicColor(hue);
          
          // Add to registry for future use
          addTopicColor(topic, color);
          
          return {
            name: topic,
            color,
            hue
          };
        }
      });
      
      projectWithUpdatedTopicColors.topicsWithColors = updatedTopicsWithColors;
    }
    
    // Use lab blue color instead of gradient
    const projectWithUpdatedColor = {
      ...projectWithUpdatedTopicColors,
      color: LAB_COLOR,
      _lastUpdated: Date.now()
    };

    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? projectWithUpdatedColor : project
      )
    );
  };
  
  const addProject = (newProject: Project): Project => {
    try {
      // Process topics and apply registered colors
      const projectWithTopicColors = { ...newProject };
      
      if (newProject.topics) {
        const topicsWithColors = newProject.topics.map(topic => {
          const registryColor = topicColorRegistry[topic];
          
          // Use registered color or generate a new one
          if (registryColor) {
            return {
              name: topic,
              color: registryColor.color,
              hue: registryColor.hue
            };
          } else {
            // Generate color and add to registry
            const hue = Math.round(Math.random() * 360);
            const color = generateTopicColor(hue);
            
            // Add to registry for future use
            addTopicColor(topic, color);
            
            return {
              name: topic,
              color,
              hue
            };
          }
        });
        
        projectWithTopicColors.topicsWithColors = topicsWithColors;
      }
      
      // Use lab blue color instead of gradient
      const projectWithColor = {
        ...projectWithTopicColors,
        color: LAB_COLOR
      };

      setProjects(prevProjects => [...prevProjects, projectWithColor]);
      return projectWithColor;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };
  
  const deleteProject = (id: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
  };
  
  // New method: reorderProjects
  const reorderProjects = (projectIds: string[]) => {
    // Create a new array of projects in the specified order
    const orderedProjects = projectIds.map(id => 
      projects.find(project => project.id === id)
    ).filter((project): project is Project => !!project);
    
    // Update the projects state
    setProjects(orderedProjects);
  };

  // Helper function to update project gradients
  const updateProjectGradients = (currentProjects: Project[]): Project[] => {
    return currentProjects.map(project => {
      // Use a simple lab blue color instead of gradient
      return {
        ...project,
        color: LAB_COLOR
      };
    });
  };

  // Update project colors based on topics, not team members
  const updatedProjects = updateProjectGradients(projects);

  // TeamMember operations
  const updateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };
  
  const addTeamMember = (newMember: TeamMember): TeamMember => {
    setTeamMembers(prevMembers => [...prevMembers, newMember]);
    return newMember;
  };
  
  const saveTeamMembers = (updatedMembers: TeamMember[]) => {
    try {
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
      setTeamMembers(updatedMembers);
    } catch (error) {
      console.error("Error saving team members to localStorage:", error);
      alert("Failed to save team members. LocalStorage might be full or unavailable.");
    }
  };

  const deleteTeamMember = (id: string) => {
    const memberToDelete = teamMembers.find(member => member.id === id);
    const newTeamMembers = teamMembers.filter(member => member.id !== id);
  
    if (memberToDelete) {
      const updatedProjects = projects.map(project => {
        if (project.team.includes(memberToDelete.name)) {
          const updatedTeam = project.team.filter(name => name !== memberToDelete.name);
          
          return {
            ...project,
            team: updatedTeam,
            color: LAB_COLOR // Use simple lab color
          };
        }
        return project;
      });
  
      setProjects(updatedProjects);
    }
  
    saveTeamMembers(newTeamMembers);
  };

  // New method: reorderTeamMembers
  const reorderTeamMembers = (teamMemberIds: string[]) => {
    // Create a new array of team members in the specified order
    const orderedMembers = teamMemberIds.map(id => 
      teamMembers.find(member => member.id === id)
    ).filter((member): member is TeamMember => !!member);
    
    // Update the team members state
    setTeamMembers(orderedMembers);
  };

  // NewsItem operations
  const updateNewsItem = (updatedNewsItem: NewsItem) => {
    setNewsItems(prevNewsItems => 
      prevNewsItems.map(newsItem => 
        newsItem.id === updatedNewsItem.id ? updatedNewsItem : newsItem
      )
    );
  };
  
  const addNewsItem = (newNewsItem: NewsItem): NewsItem => {
    setNewsItems(prevNewsItems => [...prevNewsItems, newNewsItem]);
    return newNewsItem;
  };
  
  const deleteNewsItem = (id: string) => {
    setNewsItems(prevNewsItems => prevNewsItems.filter(newsItem => newsItem.id !== id));
  };

  // Collaborator operations
  const updateCollaborator = (updatedCollaborator: Collaborator) => {
    setCollaborators(prevCollaborators => 
      prevCollaborators.map(collaborator => 
        collaborator.id === updatedCollaborator.id ? updatedCollaborator : collaborator
      )
    );
  };
  
  const addCollaborator = (newCollaborator: Collaborator): Collaborator => {
    setCollaborators(prevCollaborators => [...prevCollaborators, newCollaborator]);
    return newCollaborator;
  };
  
  const deleteCollaborator = (id: string) => {
    setCollaborators(prevCollaborators => prevCollaborators.filter(collaborator => collaborator.id !== id));
  };

  // New method: reorderCollaborators
  const reorderCollaborators = (collaboratorIds: string[]) => {
    // Create a new array of collaborators in the specified order
    const orderedCollaborators = collaboratorIds.map(id => 
      collaborators.find(collaborator => collaborator.id === id)
    ).filter((collaborator): collaborator is Collaborator => !!collaborator);
    
    // Update the collaborators state
    setCollaborators(orderedCollaborators);
  };

  // Publication operations
  const updatePublication = (updatedPublication: Publication) => {
    setPublications(prevPublications => 
      prevPublications.map(publication => 
        publication.id === updatedPublication.id ? updatedPublication : publication
      )
    );
  };
  
  const addPublication = (newPublication: Publication): Publication => {
    setPublications(prevPublications => [...prevPublications, newPublication]);
    return newPublication;
  };
  
  const deletePublication = (id: string) => {
    setPublications(prevPublications => prevPublications.filter(publication => publication.id !== id));
  };

  // Software operations
  const updateSoftware = (updatedSoftware: Software) => {
    setSoftware(prevSoftware => 
      prevSoftware.map(software => 
        software.id === updatedSoftware.id ? updatedSoftware : software
      )
    );
  };
  
  const addSoftware = (newSoftware: Software): Software => {
    setSoftware(prevSoftware => [...prevSoftware, newSoftware]);
    return newSoftware;
  };
  
  const deleteSoftware = (id: string) => {
    setSoftware(prevSoftware => prevSoftware.filter(software => software.id !== id));
  };

  // JobOpening operations
  const updateJobOpening = (updatedJobOpening: JobOpening) => {
    setJobOpenings(prevJobOpenings => 
      prevJobOpenings.map(jobOpening => 
        jobOpening.id === updatedJobOpening.id ? updatedJobOpening : jobOpening
      )
    );
  };
  
  const addJobOpening = (newJobOpening: JobOpening): JobOpening => {
    setJobOpenings(prevJobOpenings => [...prevJobOpenings, newJobOpening]);
    return newJobOpening;
  };
  
  const deleteJobOpening = (id: string) => {
    setJobOpenings(prevJobOpenings => prevJobOpenings.filter(jobOpening => jobOpening.id !== id));
  };

  // FundingSource operations
  const updateFundingSource = (updatedFundingSource: FundingSource) => {
    setFundingSources(prevFundingSources => 
      prevFundingSources.map(fundingSource => 
        fundingSource.id === updatedFundingSource.id ? updatedFundingSource : fundingSource
      )
    );
  };
  
  const addFundingSource = (newFundingSource: FundingSource): FundingSource => {
    setFundingSources(prevFundingSources => [...prevFundingSources, newFundingSource]);
    return newFundingSource;
  };
  
  const deleteFundingSource = (id: string) => {
    setFundingSources(prevFundingSources => prevFundingSources.filter(fundingSource => fundingSource.id !== id));
  };

  // Reset all data to defaults
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      localStorage.removeItem('projects');
      localStorage.removeItem('teamMembers');
      localStorage.removeItem('newsItems');
      localStorage.removeItem('collaborators');
      localStorage.removeItem('publications');
      localStorage.removeItem('software');
      localStorage.removeItem('jobOpenings');
      localStorage.removeItem('featuredItems');
      localStorage.removeItem('fundingSources');
      localStorage.removeItem('teamImage');
      localStorage.removeItem('teamImagePosition');
      localStorage.removeItem('topicColorRegistry');
      
      setProjects(initialProjects);
      setTeamMembers(initialTeamMembers);
      setNewsItems(initialNewsItems);
      setCollaborators(initialCollaborators);
      setPublications(initialPublications);
      setSoftware(initialSoftware);
      setJobOpenings(initialJobOpenings);
      setFundingSources(initialFundingSources);
      
      // Reset featured items
      setFeaturedProject(initialProjects.length > 0 ? initialProjects[0].id : null);
      setFeaturedNewsItem(initialNewsItems.length > 0 ? initialNewsItems[0].id : null);
      setFeaturedPublication(initialPublications.length > 0 ? initialPublications[0].id : null);
      
      // Reset team image
      setTeamImage('/assets/lab_team.jpeg');
      
      // Reset team image position
      setTeamImagePosition('center');
      
      // Reset topic color registry
      const registry: Record<string, TopicColor> = {};
      initialProjects.forEach(project => {
        if (project.topicsWithColors) {
          project.topicsWithColors.forEach(topic => {
            if (!registry[topic.name]) {
              registry[topic.name] = {
                name: topic.name,
                color: topic.color,
                hue: topic.hue
              };
            }
          });
        }
      });
      setTopicColorRegistry(registry);
      
      alert('Data has been reset to defaults.');
    }
  };

  // Get item by ID methods
  const getTeamMemberById = (id: string): TeamMember | undefined => {
    return teamMembers.find(member => member.id === id);
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  const getNewsItemById = (id: string): NewsItem | undefined => {
    return newsItems.find(newsItem => newsItem.id === id);
  };

  const getCollaboratorById = (id: string): Collaborator | undefined => {
    return collaborators.find(collaborator => collaborator.id === id);
  };

  const getPublicationById = (id: string): Publication | undefined => {
    return publications.find(publication => publication.id === id);
  };

  const getSoftwareById = (id: string): Software | undefined => {
    return software.find(softwareItem => softwareItem.id === id);
  };

  const getJobOpeningById = (id: string): JobOpening | undefined => {
    return jobOpenings.find(jobOpening => jobOpening.id === id);
  };

  const getFundingSourceById = (id: string): FundingSource | undefined => {
    return fundingSources.find(fundingSource => fundingSource.id === id);
  };

  // Featured items methods
  const handleSetFeaturedProject = (projectId: string) => {
    setFeaturedProject(projectId);
    saveFeaturedItems(projectId, featuredNewsItem, featuredPublication);
  };
  
  const handleSetFeaturedNewsItem = (newsItemId: string) => {
    setFeaturedNewsItem(newsItemId);
    saveFeaturedItems(featuredProject, newsItemId, featuredPublication);
  };
  
  const handleSetFeaturedPublication = (publicationId: string) => {
    setFeaturedPublication(publicationId);
    saveFeaturedItems(featuredProject, featuredNewsItem, publicationId);
  };
  
  const saveFeaturedItems = (
    projectId: string | null, 
    newsItemId: string | null, 
    publicationId: string | null
  ) => {
    const featuredItems = {
      projectId,
      newsItemId,
      publicationId
    };
    localStorage.setItem('featuredItems', JSON.stringify(featuredItems));
  };
  
  const getFeaturedItems = () => {
    return {
      projectId: featuredProject,
      newsItemId: featuredNewsItem,
      publicationId: featuredPublication
    };
  };

  // Team image methods
  const getTeamImage = (): string => {
    return teamImage;
  };
  
  const updateTeamImage = (imageUrl: string): void => {
    setTeamImage(imageUrl);
    localStorage.setItem('teamImage', imageUrl);
  };
  
  // Team image position methods
  const getTeamImagePosition = (): string => {
    return teamImagePosition;
  };
  
  const updateTeamImagePosition = (position: string): void => {
    setTeamImagePosition(position);
    localStorage.setItem('teamImagePosition', position);
  };

  return (
    <ContentContext.Provider value={{
      projects,
      teamMembers,
      newsItems,
      collaborators,
      publications,
      software,
      jobOpenings,
      fundingSources,
      topicColorRegistry,
      updateProject,
      addProject,
      deleteProject,
      reorderProjects,
      updateTeamMember,
      addTeamMember,
      deleteTeamMember,
      reorderTeamMembers,
      updateNewsItem,
      addNewsItem,
      deleteNewsItem,
      updateCollaborator,
      addCollaborator,
      deleteCollaborator,
      reorderCollaborators,
      updatePublication,
      addPublication,
      deletePublication,
      updateSoftware,
      addSoftware,
      deleteSoftware,
      updateJobOpening,
      addJobOpening,
      deleteJobOpening,
      updateFundingSource,
      addFundingSource,
      deleteFundingSource,
      updateTopicColor,
      addTopicColor,
      removeTopicColor,
      getTopicColorByName,
      resetToDefaults,
      getTeamMemberById,
      getProjectById,
      getNewsItemById,
      getCollaboratorById,
      getPublicationById,
      getSoftwareById,
      getJobOpeningById,
      getFundingSourceById,
      setFeaturedProject: handleSetFeaturedProject,
      setFeaturedNewsItem: handleSetFeaturedNewsItem,
      setFeaturedPublication: handleSetFeaturedPublication,
      getFeaturedItems,
      getTeamImage,
      updateTeamImage,
      getTeamImagePosition,
      updateTeamImagePosition,
    }}>
      {children}
    </ContentContext.Provider>
  );
};
