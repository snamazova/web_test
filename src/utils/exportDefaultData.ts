/**
 * Utility to export the current localStorage data as TypeScript code
 * that could be used as the default data in the application.
 */

import { formatObject } from './formatUtils';

// Define the types of data that can be exported
const DATA_TYPES = [
  'projects', 
  'teamMembers', 
  'newsItems', 
  'collaborators', 
  'publications', 
  'software', 
  'jobOpenings',
  'fundingSources'
];

/**
 * Exports the current localStorage data as formatted TypeScript code
 */
export const exportAsDefaultData = (): { 
  success: boolean; 
  data?: {[key: string]: string}; 
  error?: string 
} => {
  try {
    const result: {[key: string]: string} = {};

    // Process each data type
    DATA_TYPES.forEach(type => {
      const data = localStorage.getItem(type);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          
          // Generate TypeScript code for this data type
          result[type] = formatDataAsTypeScript(type, parsedData);
        } catch (e) {
          console.error(`Error parsing ${type} data:`, e);
        }
      }
    });

    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Formats a data object as TypeScript code
 */
const formatDataAsTypeScript = (type: string, data: any[]): string => {
  // Start with the export statement
  let result = `export const ${type} = `;
  
  // Format the data as a pretty-printed TypeScript object
  result += formatObject(data, 2); // 2 spaces indentation
  
  // Add a semicolon at the end
  result += ';';
  
  return result;
};
