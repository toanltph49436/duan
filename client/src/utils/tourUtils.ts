/**
 * Utility functions for tour operations
 */

/**
 * Generate consistent tour code from tour ID
 * @param tourId - Full tour ID from database
 * @returns Formatted tour code (6 characters)
 */
export const generateTourCode = (tourId: string): string => {
  if (!tourId) return '...';
  
  // Lấy 6 ký tự đầu tiên của ID
  return tourId.slice(0, 6).toUpperCase();
};

/**
 * Format tour code for display
 * @param tourId - Full tour ID from database  
 * @returns Formatted tour code with prefix
 */
export const formatTourCode = (tourId: string): string => {
  if (!tourId) return 'N/A';
  
  const code = generateTourCode(tourId);
  return `TOUR-${code}`;
};

/**
 * Get tour display price
 * @param tour - Tour object
 * @returns Price to display (finalPrice if available, otherwise price)
 */
export const getTourDisplayPrice = (tour: any): number => {
  return tour?.finalPrice ?? tour?.price ?? 0;
};

/**
 * Format price for display
 * @param price - Price number
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN');
};
