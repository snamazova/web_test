/**
 * Utilities for formatting data as TypeScript code
 */

/**
 * Formats an object or array as readable TypeScript code
 */
export const formatObject = (obj: any, indentLevel: number = 0): string => {
  const indent = ' '.repeat(indentLevel);
  const indentInner = ' '.repeat(indentLevel + 2);
  
  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }
    
    const items = obj.map(item => 
      `${indentInner}${formatValue(item, indentLevel + 2)}`
    ).join(',\n');
    
    return `[\n${items}\n${indent}]`;
  }
  
  // Handle objects
  if (obj && typeof obj === 'object') {
    // If it's a Date object, return it as a date literal
    if (obj instanceof Date) {
      return `new Date("${obj.toISOString()}")`;
    }
    
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return '{}';
    }
    
    const properties = entries.map(([key, value]) => {
      // Format the key with quotes if it has special characters
      const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
        ? key 
        : `"${key}"`;
      
      return `${indentInner}${formattedKey}: ${formatValue(value, indentLevel + 2)}`;
    }).join(',\n');
    
    return `{\n${properties}\n${indent}}`;
  }
  
  // Handle null
  return 'null';
};

/**
 * Formats a value based on its type
 */
const formatValue = (value: any, indentLevel: number): string => {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'string') {
    // Escape quotes and special characters
    const escaped = value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  
  if (value instanceof Date) {
    return `new Date("${value.toISOString()}")`;
  }
  
  if (Array.isArray(value) || (typeof value === 'object')) {
    return formatObject(value, indentLevel);
  }
  
  // Default for any other types
  return JSON.stringify(value);
};
