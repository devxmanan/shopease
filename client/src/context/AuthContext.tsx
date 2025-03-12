import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChangedListener, loginWithEmailPassword, registerWithEmailPassword, loginWithGoogle, logoutUser } from '../lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<User | null>;
  isAdmin: boolean;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  googleSignIn: async () => null,
  isAdmin: false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Check if user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        // For simplicity, we're just checking if the email contains 'admin'
        // In a real application, you would check for a specific role in your database
        setIsAdmin(currentUser.email?.includes('admin') || false);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  useEffect(() => {
    try {
      console.log('Setting up Firebase auth listener...');
      const unsubscribe = onAuthStateChangedListener((user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'No user');
        setCurrentUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Firebase auth error:', error);
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: "Could not set up authentication. Please check Firebase configuration.",
        variant: "destructive",
      });
      // Return a no-op function as cleanup
      return () => {};
    }
  }, [toast]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await loginWithEmailPassword(email, password);
      toast({
        title: "Successfully logged in",
        description: "Welcome back to ShopEase!",
      });
      return userCredential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const register = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await registerWithEmailPassword(email, password);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      return userCredential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const googleSignIn = async (): Promise<User | null> => {
    try {
      const result = await loginWithGoogle();
      toast({
        title: "Successfully logged in",
        description: "Welcome to ShopEase!",
      });
      return result.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Google sign-in';
      toast({
        title: "Google sign-in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    googleSignIn,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
