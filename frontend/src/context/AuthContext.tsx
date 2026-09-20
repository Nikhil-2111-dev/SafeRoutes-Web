'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { fetchAuthSession, getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

// We extend the AuthUser to include the profile data from DynamoDB
interface SafeRouteUser extends AuthUser {
  profile?: any;
}

interface AuthContextType {
  user: SafeRouteUser | null;
  isLoading: boolean;
  syncProfile: () => Promise<void>;
  updateProfile: (updates: any) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isLoading: true,
  syncProfile: async () => {},
  updateProfile: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SafeRouteUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBackendProfile = async (currentUser: AuthUser) => {
    try {
      // Get the Cognito JWT session
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) throw new Error("No ID Token found");

      // Securely fetch application profile from DynamoDB via Express
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const profile = await res.json();
        setUser({ ...currentUser, profile });
      } else if (res.status === 404) {
        // Profile not found, let's create/sync it
        const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/profile`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (createRes.ok) {
          const data = await createRes.json();
          setUser({ ...currentUser, profile: data.profile });
        } else {
          setUser(currentUser);
        }
      } else {
        // Fallback: If backend/DynamoDB is unreachable, pull real details dynamically from Cognito
        try {
          const { fetchUserAttributes } = await import('aws-amplify/auth');
          const attributes = await fetchUserAttributes();
          setUser({
            ...currentUser,
            profile: {
              name: attributes.name || attributes.email,
              email: attributes.email,
              phone_number: attributes.phone_number,
              birthdate: attributes.birthdate,
              gender: attributes.gender,
              address: attributes.address,
              picture: attributes.picture,
              createdAt: new Date().toISOString()
            }
          });
        } catch (e) {
          setUser(currentUser);
        }
      }
    } catch (err) {
      console.error("Failed to fetch backend profile:", err);
      // Fallback to Cognito attributes
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        const attributes = await fetchUserAttributes();
        setUser({
          ...currentUser,
          profile: {
            name: attributes.name || attributes.email,
            email: attributes.email,
            phone_number: attributes.phone_number,
            birthdate: attributes.birthdate,
            gender: attributes.gender,
            address: attributes.address,
            picture: attributes.picture,
            createdAt: new Date().toISOString()
          }
        });
      } catch (e) {
        setUser(currentUser);
      }
    }
  };

  const syncProfile = async () => {
    try {
      // 1. Instantly get the cached Cognito user (Local Storage - ~1ms)
      const currentUser = await getCurrentUser();
      
      // 2. Instantly set the user in React state to bypass ProtectedRoutes and allow instant UI transition
      // Preserve the existing profile if it exists to prevent UI flashing
      setUser((prevUser) => ({
        ...currentUser,
        profile: prevUser?.profile
      }));
      setIsLoading(false);
      
      // 3. Fetch the heavy DynamoDB backend profile in the background without blocking the user
      fetchBackendProfile(currentUser);
    } catch (e) {
      console.error(e);
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: any) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile: { ...prev.profile, ...updates }
      };
    });
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        await fetchBackendProfile(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen to AWS Amplify Auth events (login/logout)
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, syncProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
