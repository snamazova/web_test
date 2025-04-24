import React from 'react';
import { TopNav, Footer } from './Components';

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Layout component that provides consistent page structure
 * @param children - The page content
 * @param fullWidth - Whether the content should expand to the full width of the screen
 */
const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <>
      <TopNav />
      <div className={`main-content ${fullWidth ? 'full-width' : ''}`}>
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Layout;
