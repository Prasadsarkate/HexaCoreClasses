
// frontend/src/contexts/AuthContext.tsx
/**
 * Authentication Context Provider
 * 
 * This file manages the global authentication state of the application.
 * It provides the `User` object, `Profile` data, and authentication methods (signIn, signOut, etc.) to the entire app.
 * 
 * It uses React Context API to avoid prop drilling and `localStorage` for session persistence.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import type { Profile } from '@/types/types';

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, email: string, password: string) => Promise<{ error: Error | null }>; // Changed signature to include username
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Removed Supabase specific methods for now or keep as placeholders
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  verifyEmailOTP: (email: string, otp: string) => Promise<{ error: Error | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  confirmPasswordReset: (email: string, otp: string, newPassword: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>; // Kept for backward compatibility if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AUTOMATIC URL SWITCHING:
// AUTOMATIC URL SWITCHING:
const getBaseURL = () => {
  const isProd = import.meta.env.PROD;

  if (isProd) {
    const pathname = window.location.pathname.toLowerCase();
    return pathname.includes('/hexacore') ? '/hexacore/api' : '/api';
  }

  return '/api';
};

const API_BASE_URL = getBaseURL();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Ideally fetch profile here
      setProfile(JSON.parse(storedUser)); // Simplified: user data includes profile info in our PHP login response
    }
    setLoading(false);
  }, []);

  /**
   * Refreshes the user profile data from the server.
   * Useful when the user updates their profile (e.g., bio, avatar) and we want to reflect changes immediately without re-login.
   */
  const refreshProfile = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/users.php?id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const updatedData = await res.json();
        const newUserState = { ...user, ...updatedData };
        setUser(newUserState);
        setProfile(newUserState);
        localStorage.setItem('user_data', JSON.stringify(newUserState));
      }
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
      setProfile(data.user); // Assuming user object contains profile fields

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setProfile(null);
  };

  // Placeholders
  // Google Sign-In
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      try {
        const loginUrl = `${API_BASE_URL}/auth/google_login.php`;
        // alert(`Debug: Trying to fetch ${loginUrl}`); // Verify URL

        const res = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });


        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || `Server Error: ${res.status}`);
        }

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
        setProfile(data.user);

        // Show success toast? (Optional, maybe Login.tsx handles redirect)
      } catch (error: any) {
        console.error('Google Auth Error:', error);
        // Alert the user visible error
        alert("Login Failed: " + (error.message || "Unknown Error"));
      }
    },
    onError: (errorResponse: any) => {
      console.error('Google Login Failed:', errorResponse);
      alert("Google Popup Failed");
    }
  });

  const signInWithGoogle = async () => {
    try {
      googleLogin();
      return { error: null };
    } catch (e) {
      return { error: e as Error };
    }
  };
  const signInWithPhone = async () => ({ error: new Error('Not implemented') });
  const verifyPhoneOTP = async () => ({ error: new Error('Not implemented') });

  const verifyEmailOTP = async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify_otp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
      setProfile(data.user);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };
  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const confirmPasswordReset = async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Deprecated placeholder
  const resetPassword = async () => ({ error: new Error('Use requestPasswordReset instead') });

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      signInWithGoogle,
      signInWithPhone,
      verifyPhoneOTP,
      verifyEmailOTP,
      requestPasswordReset,
      confirmPasswordReset,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Ensure standard hooks usage for cleaner code
  return context;
}
/**
 * Note: Methods like signInWithGoogle, signInWithPhone, verifyPhoneOTP, and resetPassword
 * are currently placeholders. They need to be implemented with backend support (e.g., Firebase auth or custom PHP endpoints)
 * to become fully functional.
 */