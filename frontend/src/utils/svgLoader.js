/**
 * Simplified SVG Loader - uses direct string replacement instead of DOM parsing
 */

// Cache for loaded SVG content
const svgCache = new Map();

/**
 * Load an SVG file from the public directory
 */
export async function loadSVG(speciesFolder, frameName) {
  const cacheKey = `${speciesFolder}/${frameName}`;
  
  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey);
  }

  try {
    const response = await fetch(`/fish-sprites/${speciesFolder}/${frameName}.svg`);
    if (!response.ok) {
      throw new Error(`SVG not found: ${cacheKey}`);
    }
    
    const svgText = await response.text();
    svgCache.set(cacheKey, svgText);
    return svgText;
  } catch (error) {
    console.warn(`Failed to load SVG: ${cacheKey}`, error);
    return null;
  }
}

/**
 * Generate color variations from hex
 */
export function generateColorVariations(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighter shade
  const lightR = Math.round(r + (255 - r) * 0.4);
  const lightG = Math.round(g + (255 - g) * 0.4);
  const lightB = Math.round(b + (255 - b) * 0.4);
  const light = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

  // Darker shade
  const darkR = Math.round(r * 0.6);
  const darkG = Math.round(g * 0.6);
  const darkB = Math.round(b * 0.6);
  const dark = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

  return {
    primary: hexColor,
    light,
    dark,
  };
}

/**
 * Recolor SVG using simple string replacement (much faster than DOM parsing)
 */
export function recolorSVG(svgText, targetColor) {
  if (!svgText) return null;

  const colors = generateColorVariations(targetColor);
  
  // Replace standard placeholder colors
  return svgText
    .replace(/#FF0000/gi, colors.primary)
    .replace(/#FF6666/gi, colors.light)
    .replace(/#CC0000/gi, colors.dark);
}

/**
 * Load and recolor an SVG in one step
 */
export async function loadAndRecolorSVG(speciesFolder, frameName, color) {
  const svgText = await loadSVG(speciesFolder, frameName);
  if (!svgText) return null;
  return recolorSVG(svgText, color);
}

/**
 * Clear cache (for development)
 */
export function clearSVGCache() {
  svgCache.clear();
}

