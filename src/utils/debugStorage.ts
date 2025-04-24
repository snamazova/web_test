/**
 * Helper functions for debugging localStorage issues
 */

/**
 * Get all items from localStorage with their size information
 */
export const getStorageInfo = () => {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    const value = localStorage.getItem(key) || '';
    const size = new Blob([value]).size / 1024; // Size in KB
    items.push({ 
      key, 
      value: value.length > 100 ? `${value.substring(0, 100)}...` : value,
      size: Math.round(size * 100) / 100 
    });
  }
  return items;
};

/**
 * Get a specific localStorage item
 */
export const getStorageItem = (key: string) => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

/**
 * Create a backup of all localStorage items
 */
export const backupStorage = () => {
  const backup: Record<string, string> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) backup[key] = value;
    }
  }
  
  return backup;
};

/**
 * Restore localStorage from backup
 */
export const restoreStorage = (backup: Record<string, string>) => {
  // Clear existing storage
  localStorage.clear();
  
  // Restore from backup
  Object.entries(backup).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

/**
 * Clean up localStorage for a specific key
 * by removing duplicate entries or entries with null/undefined values
 */
export const cleanupStorage = (key: string): boolean => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return false;
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return false;
    
    // Remove duplicate IDs
    const seen = new Set();
    const cleaned = parsed.filter((item: any) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    
    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(cleaned));
    return true;
  } catch (e) {
    console.error("Error cleaning up localStorage:", e);
    return false;
  }
};

/**
 * Reset news items in localStorage
 */
export const resetNewsItems = () => {
  localStorage.removeItem('newsItems');
  return true;
};

/**
 * Verify and repair team-project associations
 * This function ensures consistency between team members and projects
 */
export const repairTeamProjectAssociations = () => {
  try {
    // Get current data
    const projectsData = localStorage.getItem('projects');
    const teamData = localStorage.getItem('teamMembers');
    
    if (!projectsData || !teamData) {
      console.error("Missing data in localStorage");
      return false;
    }
    
    const projects = JSON.parse(projectsData);
    const teamMembers = JSON.parse(teamData);
    
    if (!Array.isArray(projects) || !Array.isArray(teamMembers)) {
      console.error("Invalid data format in localStorage");
      return false;
    }
    
    // Track changes
    let projectsChanged = false;
    let membersChanged = false;
    
    // First update projects based on team member associations
    const updatedProjects = projects.map(project => {
      const originalTeam = [...project.team];
      
      // Add team members who have this project in their projects array
      teamMembers.forEach(member => {
        if (member.projects && 
            Array.isArray(member.projects) && 
            member.projects.includes(project.id) && 
            !project.team.includes(member.name)) {
          project.team.push(member.name);
          projectsChanged = true;
        }
      });
      
      if (projectsChanged && project.team.length !== originalTeam.length) {
        console.log(`Updated project ${project.id}: added ${project.team.length - originalTeam.length} team members`);
      }
      
      return project;
    });
    
    // Then update team members based on project teams
    const updatedMembers = teamMembers.map(member => {
      if (!member.projects) member.projects = [];
      const originalProjects = [...member.projects];
      
      // Add projects that include this team member
      projects.forEach(project => {
        if (project.team.includes(member.name) && 
            !member.projects.includes(project.id)) {
          member.projects.push(project.id);
          membersChanged = true;
        }
      });
      
      if (membersChanged && member.projects.length !== originalProjects.length) {
        console.log(`Updated member ${member.name}: added ${member.projects.length - originalProjects.length} projects`);
      }
      
      return member;
    });
    
    // Save changes if needed
    if (projectsChanged) {
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
    
    if (membersChanged) {
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
    }
    
    return projectsChanged || membersChanged;
  } catch (e) {
    console.error("Error repairing team-project associations:", e);
    return false;
  }
};
