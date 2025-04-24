// Lab color constant - used across the application
export const LAB_COLOR = '#00AAFF';
export const LAB_COLOR_DARK = '#005580';
export const TOPIC_COLOR_SATURATION = 70; // Default saturation for topics
export const TOPIC_COLOR_LIGHTNESS = 80; // Set lightness to 80 for all topics

/**
 * Converts a hex color to HSL components
 */
export function hexToHsl(hex: string): [number, number, number] {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts HSL values to a hex color string
 */
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates a topic color based on hue with fixed saturation and lightness
 * @param hue - The hue value (0-360)
 * @returns Hex color string
 */
export const generateTopicColor = (hue: number): string => {
  return hslToHex(hue, TOPIC_COLOR_SATURATION, TOPIC_COLOR_LIGHTNESS);
};

// Extract saturation and lightness from LAB_COLOR to keep consistent
const [LAB_HUE, LAB_SATURATION, LAB_LIGHTNESS] = hexToHsl(LAB_COLOR);

/**
 * Creates a color with specific hue but using consistent saturation and lightness
 * @param hue The hue value (0-360)
 * @returns A hex color string
 */
export const createTopicColorWithLabValues = (hue: number): string => {
  return hslToHex(hue, TOPIC_COLOR_SATURATION, TOPIC_COLOR_LIGHTNESS);
};

/**
 * Updates a color's hue while preserving consistent saturation and lightness
 * @param color Current color in hex
 * @param newHue New hue value (0-360)
 * @returns Updated hex color
 */
export const updateColorHue = (color: string, newHue: number): string => {
  return hslToHex(newHue, TOPIC_COLOR_SATURATION, TOPIC_COLOR_LIGHTNESS);
};

/**
 * Creates a gradient from multiple colors
 * @deprecated Use createProjectGradient instead
 */
export function createGradient(
  colors: string[],
  options: {
    direction?: string;
    includeHighlight?: boolean;
    highlightColor?: string;
    mixColors?: boolean;
    mixRatio?: number;
    type?: 'linear' | 'radial';
    position?: string;
  } = {}
): string {
  // For backwards compatibility, redirect to createProjectGradient
  return createProjectGradient(colors);
}

/**
 * Creates a project gradient with colors arranged by hue from left to right
 * @param colors Array of hex colors to use in the gradient
 * @param direction Direction of the linear gradient (e.g. 'to right')
 * @returns CSS gradient string
 */
export const createProjectGradient = (colors: string[], direction: string = 'to right'): string => {
  if (!colors || colors.length === 0) {
    // Default to lab blue gradient
    return `linear-gradient(${direction}, ${LAB_COLOR} 0%, #005580 100%)`;
  }
  
  if (colors.length === 1) {
    // For a single color, create a simple gradient from the color to a darker version
    return `linear-gradient(${direction}, ${colors[0]} 0%, ${darkenColor(colors[0], 30)} 100%)`;
  }
  
  // Sort colors by hue value - lower hues (reds) on the left, higher hues (purples) on the right
  const sortedColors = [...colors].sort((a, b) => {
    const [hueA] = hexToHsl(a);
    const [hueB] = hexToHsl(b);
    return hueA - hueB;
  });
  
  // Create stops with even spacing
  const stops = sortedColors.map((color, index) => {
    const percent = (index / (sortedColors.length - 1)) * 100;
    return `${color} ${percent}%`;
  });
  
  return `linear-gradient(${direction}, ${stops.join(', ')})`;
};

/**
 * Darkens a hex color by the specified percentage
 * @param color Hex color string
 * @param percent Percent to darken (0-100)
 * @returns Darker hex color
 */
export const darkenColor = (color: string, percent: number): string => {
  const [h, s, l] = hexToHsl(color);
  // Reduce lightness but maintain hue and saturation
  return hslToHex(h, s, Math.max(0, l - (percent / 100) * l));
};

/**
 * Get topic colors from a project
 */
export function getTopicColorsFromProject(
  project: { topicsWithColors?: { name: string; color: string }[], topics?: string[] }
): string[] {
  if (project.topicsWithColors && project.topicsWithColors.length > 0) {
    return project.topicsWithColors.map(t => t.color);
  } else if (project.topics && project.topics.length > 0) {
    return project.topics.map((_, i) => {
      // Generate evenly spaced hues around the color wheel
      const hue = Math.round((i / project.topics!.length) * 360);
      return generateTopicColor(hue);
    });
  }
  return [];
}

// OpenMoji base URL - change to black and white version
export const OPENMOJI_BASE_URL = "https://openmoji.org/data/black/svg/";

/**
 * Get the OpenMoji URL for a given emoji hexcode
 * @param hexcode The hexcode of the emoji (e.g. "1F600" for 😀)
 * @param invertColor Whether to invert the color (black to white)
 * @returns The full URL to the OpenMoji SVG
 */
export const getOpenMojiUrl = (hexcode: string, invertColor: boolean = false): string => {
  if (!hexcode) return "";
  // Ensure the hexcode is properly formatted without any prefixes
  const cleanHexcode = hexcode.replace(/^U\+/i, "").toUpperCase();
  return `${OPENMOJI_BASE_URL}${cleanHexcode}.svg${invertColor ? '#invert' : ''}`;
};

/**
 * Extract just the hexcode from an OpenMoji URL
 * @param url The full OpenMoji URL
 * @returns Just the hexcode part
 */
export const getHexcodeFromUrl = (url: string): string => {
  if (!url) return "";
  const match = url.match(/\/([0-9A-F]+)\.svg$/i);
  return match ? match[1] : "";
};