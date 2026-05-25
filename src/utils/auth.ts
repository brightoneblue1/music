// Session token storage & validation
interface SessionToken {
  token: string;
  expiresAt: number;
}

export const authTokens = {
  set: (token: string, expiresIn: number = 3600000) => {
    const expiresAt = Date.now() + expiresIn;
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminTokenExpiry', expiresAt.toString());
  },

  get: (): string | null => {
    const token = sessionStorage.getItem('adminToken');
    const expiry = sessionStorage.getItem('adminTokenExpiry');
    
    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry)) {
      authTokens.clear();
      return null;
    }
    
    return token;
  },

  clear: () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminTokenExpiry');
  },

  isValid: (): boolean => !!authTokens.get(),

  getRemainingTime: (): number => {
    const expiry = sessionStorage.getItem('adminTokenExpiry');
    if (!expiry) return 0;
    return Math.max(0, parseInt(expiry) - Date.now());
  },
};
