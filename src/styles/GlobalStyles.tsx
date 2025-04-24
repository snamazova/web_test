import React from 'react';

// Create a global style component using regular style element
const GlobalStyles: React.FC = () => {
  return (
    <style>
      {`
        * {
          box-sizing: border-box;
        }
        
        html, body, #root, .app {
          height: 100%;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        h1, h2, h3, h4, h5, h6, button, .nav-links, .logo-text {
          font-family: 'Inter', sans-serif;
        }
        
        /* Additional global styles can be added here */
      `}
    </style>
  );
};

export default GlobalStyles;
