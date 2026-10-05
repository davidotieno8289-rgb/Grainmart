import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast: React.FC = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1A1208',
          color: '#FBF5E6',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.88rem',
          fontFamily: 'DM Sans, sans-serif',
          boxShadow: '0 8px 24px rgba(26, 18, 8, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#2D5016',
            secondary: '#FBF5E6',
          },
          style: {
            background: '#EAF0E2',
            color: '#2D5016',
            border: '1px solid #2D5016',
          },
        },
        error: {
          iconTheme: {
            primary: '#C94A1A',
            secondary: '#FBF5E6',
          },
          style: {
            background: '#FDF0D5',
            color: '#C94A1A',
            border: '1px solid #C94A1A',
          },
        },
      }}
    />
  );
};

export default Toast;
