
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return false;
  
  return !isTokenExpired(accessToken);
};

export const logout = (currentRoute?: string): void => {
  if (typeof window === 'undefined') return;
  
  const currentPath = window.location.pathname;
  const isOnAuthPage = currentPath === '/login' || currentPath === '/register';
  
  if (!isOnAuthPage) {
    if (currentRoute) {
      localStorage.setItem('return_route', currentRoute);
    } else {
      const path = window.location.pathname;
      if (path && path !== '/login') {
        localStorage.setItem('return_route', path);
      }
    }
  }
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  if (!isOnAuthPage) {
    window.location.href = '/login';
  }
};

export const getReturnRoute = (): string => {
  if (typeof window === 'undefined') return '/';
  
  const route = localStorage.getItem('return_route');
  if (route) {
    localStorage.removeItem('return_route');
    return route;
  }
  return '/';
};

export const checkTokenAndLogout = (): void => {
  if (typeof window === 'undefined') return;
  
  const accessToken = localStorage.getItem('access_token');
  if (accessToken && isTokenExpired(accessToken)) {
    logout();
  }
};

