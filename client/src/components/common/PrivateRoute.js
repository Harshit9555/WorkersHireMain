import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner center />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
