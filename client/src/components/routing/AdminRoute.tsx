import React from 'react';
import { useAuth } from "@/context/AuthContext";

// Protected route component for admin routes
const AdminRoute = ({ component: Component, ...rest }: { component: React.ComponentType<any>, [x: string]: any }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  // While loading auth state, show nothing
  if (loading) return null;
  
  // If user is not an admin, redirect to home
  if (!currentUser || !isAdmin) {
    window.location.href = '/';
    return null;
  }
  
  return <Component {...rest} />;
};

export default AdminRoute;