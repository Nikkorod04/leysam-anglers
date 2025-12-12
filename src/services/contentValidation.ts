/**
 * Validate title and description for catch reports
 */

export interface ContentValidation {
  valid: boolean;
  error?: string;
}

// Catch Report constraints
const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;

// Fishing Spot constraints
const SPOT_NAME_MIN_LENGTH = 3;
const SPOT_NAME_MAX_LENGTH = 50;
const SPOT_DESC_MIN_LENGTH = 10;
const SPOT_DESC_MAX_LENGTH = 300;

// Profile constraints
const DISPLAY_NAME_MIN_LENGTH = 3;
const DISPLAY_NAME_MAX_LENGTH = 30;

// Auth constraints
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 50;

// Email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate catch report title
 */
export const validateTitle = (title: string): ContentValidation => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  const trimmed = title.trim();

  if (trimmed.length < TITLE_MIN_LENGTH) {
    return {
      valid: false,
      error: `Title must be at least ${TITLE_MIN_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  if (trimmed.length > TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Title must not exceed ${TITLE_MAX_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  return { valid: true };
};

/**
 * Validate catch report description
 */
export const validateDescription = (description: string): ContentValidation => {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description cannot be empty' };
  }

  const trimmed = description.trim();

  if (trimmed.length < DESCRIPTION_MIN_LENGTH) {
    return {
      valid: false,
      error: `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  return { valid: true };
};

/**
 * Validate fishing spot name
 */
export const validateSpotName = (name: string): ContentValidation => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Spot name cannot be empty' };
  }

  const trimmed = name.trim();

  if (trimmed.length < SPOT_NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Spot name must be at least ${SPOT_NAME_MIN_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  if (trimmed.length > SPOT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Spot name must not exceed ${SPOT_NAME_MAX_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  return { valid: true };
};

/**
 * Validate fishing spot description
 */
export const validateSpotDescription = (description: string): ContentValidation => {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Spot description cannot be empty' };
  }

  const trimmed = description.trim();

  if (trimmed.length < SPOT_DESC_MIN_LENGTH) {
    return {
      valid: false,
      error: `Description must be at least ${SPOT_DESC_MIN_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  if (trimmed.length > SPOT_DESC_MAX_LENGTH) {
    return {
      valid: false,
      error: `Description must not exceed ${SPOT_DESC_MAX_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  return { valid: true };
};

/**
 * Validate display name (for profile)
 */
export const validateDisplayName = (name: string): ContentValidation => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Display name cannot be empty' };
  }

  const trimmed = name.trim();

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Display name must not exceed ${DISPLAY_NAME_MAX_LENGTH} characters (currently ${trimmed.length})`,
    };
  }

  return { valid: true };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): ContentValidation => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  const trimmed = email.trim();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ContentValidation => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password cannot be empty' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters (currently ${password.length})`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      error: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
};

/**
 * Validate catch report content
 */
export const validateCatchReportContent = (
  title: string,
  description: string
): ContentValidation => {
  const titleValidation = validateTitle(title);
  if (!titleValidation.valid) {
    return titleValidation;
  }

  const descriptionValidation = validateDescription(description);
  if (!descriptionValidation.valid) {
    return descriptionValidation;
  }

  return { valid: true };
};

/**
 * Validate fishing spot content
 */
export const validateFishingSpotContent = (
  name: string,
  description: string
): ContentValidation => {
  const nameValidation = validateSpotName(name);
  if (!nameValidation.valid) {
    return nameValidation;
  }

  const descriptionValidation = validateSpotDescription(description);
  if (!descriptionValidation.valid) {
    return descriptionValidation;
  }

  return { valid: true };
};

/**
 * Get constraints for display
 */
export const getInputConstraints = (field: string) => {
  const constraints: Record<string, { min: number; max: number }> = {
    title: { min: TITLE_MIN_LENGTH, max: TITLE_MAX_LENGTH },
    description: { min: DESCRIPTION_MIN_LENGTH, max: DESCRIPTION_MAX_LENGTH },
    spotName: { min: SPOT_NAME_MIN_LENGTH, max: SPOT_NAME_MAX_LENGTH },
    spotDescription: { min: SPOT_DESC_MIN_LENGTH, max: SPOT_DESC_MAX_LENGTH },
    displayName: { min: DISPLAY_NAME_MIN_LENGTH, max: DISPLAY_NAME_MAX_LENGTH },
    password: { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH },
  };

  return constraints[field];
};
