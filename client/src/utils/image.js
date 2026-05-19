/**
 * Helper utility to construct correct absolute URLs for uploaded assets.
 * Handles both absolute URLs stored in the database and relative paths.
 * Works seamlessly in both local development and production.
 */

// Default avatar shown when no profile photo is set or image fails to load
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=7c3aed&color=fff&size=128&bold=true&name=User';

export const getImageUrl = (imagePath, name = '') => {
  // If empty/null, return a generated avatar with user's initials (or default)
  if (!imagePath) {
    const encodedName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?background=7c3aed&color=fff&size=128&bold=true&name=${encodedName}`;
  }
  
  // If it's already a full HTTP/HTTPS URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Retrieve backend base URL from env variables
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Ensure the relative path has a leading slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${cleanPath}`;
};

/**
 * onError handler for <img> tags — if the image URL breaks (e.g. Render ephemeral
 * filesystem wipes uploads on restart), fall back to a generated avatar.
 * Usage: <img onError={handleImgError(user.name)} ... />
 */
export const handleImgError = (name = '') => (e) => {
  const encodedName = encodeURIComponent(name || 'User');
  e.target.onerror = null; // prevent infinite loop
  e.target.src = `https://ui-avatars.com/api/?background=7c3aed&color=fff&size=128&bold=true&name=${encodedName}`;
};
