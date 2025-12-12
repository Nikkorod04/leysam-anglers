/**
 * Validate fish species string
 * Rules:
 * - Only letters and commas allowed
 * - No consecutive commas
 * - Each word (between commas) must be 3-15 letters
 * - Words are separated by commas
 */
export const validateSpecies = (species: string): { valid: boolean; error?: string } => {
  if (!species || species.trim().length === 0) {
    return { valid: false, error: 'Species cannot be empty' };
  }

  const trimmed = species.trim();

  // Check for invalid characters (only letters and commas allowed)
  if (!/^[a-zA-Z,\s]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Only letters and commas are allowed',
    };
  }

  // Check for consecutive commas
  if (/,,/.test(trimmed)) {
    return {
      valid: false,
      error: 'No consecutive commas allowed',
    };
  }

  // Check for comma at start or end
  if (trimmed.startsWith(',') || trimmed.endsWith(',')) {
    return {
      valid: false,
      error: 'Species names cannot start or end with a comma',
    };
  }

  // Split by comma and validate each word
  const words = trimmed
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return {
      valid: false,
      error: 'At least one species name is required',
    };
  }

  for (const word of words) {
    // Check length (3-15 characters)
    if (word.length < 3 || word.length > 15) {
      return {
        valid: false,
        error: `Each species name must be 3-15 letters. "${word}" is ${word.length} letters`,
      };
    }

    // Check for only letters (no spaces within word)
    if (!/^[a-zA-Z]+$/.test(word)) {
      return {
        valid: false,
        error: `Species names must contain only letters. "${word}" contains other characters`,
      };
    }
  }

  return { valid: true };
};

/**
 * Format species string for display
 * Converts comma-separated species into a readable format
 */
export const formatSpeciesForDisplay = (species: string): string[] => {
  return species
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
};
