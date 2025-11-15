/**
 * Auth utility functions for token management and logout
 */

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    return true; // If token is invalid, consider it expired
  }
};

/**
 * Check if access token exists and is valid
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return false;
  
  return !isTokenExpired(accessToken);
};

/**
 * Logout function - removes only access_token and refresh_token
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove only access_token and refresh_token
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Redirect to login
  window.location.href = '/login';
};

/**
 * Auto logout if token is expired
 */
export const checkTokenAndLogout = (): void => {
  if (typeof window === 'undefined') return;
  
  const accessToken = localStorage.getItem('access_token');
  if (accessToken && isTokenExpired(accessToken)) {
    logout();
  }
};

