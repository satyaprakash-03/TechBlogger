/**
 * Helper utility to construct correct absolute URLs for uploaded assets.
 * Handles both absolute URLs stored in the database and relative paths.
 * Works seamlessly in both local development and production.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
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
