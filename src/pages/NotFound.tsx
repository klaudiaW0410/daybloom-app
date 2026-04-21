import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '24px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: '900', color: 'var(--accent-gold)', marginBottom: '0' }}>404</h1>
      <h2 className="title-large">Page not found</h2>
      <p className="text-secondary" style={{ maxWidth: '400px' }}>
        The page you are looking for doesn't exist or has been moved to another coordinate.
      </p>
      <Link to="/today" className="btn-primary" style={{ padding: '12px 32px' }}>
        Back to Dashboard
      </Link>
    </div>
  );
};
