import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F4F1',
        }}
      >
        <div style={{ textAlign: 'center', width: '280px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: '#171717' }}>
            UniGrade
          </div>
          <LoadingSkeleton height="1.5rem" />
          <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#858580' }}>
            Verifying institutional session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

