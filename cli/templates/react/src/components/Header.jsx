/**
 * Header Component
 * @license GPL-3.0-or-later
 */

import { useState, useEffect } from 'react';

function Header({ title, description, onCopyLink }) {
  const [theme, setTheme] = useState('auto');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return '☀️';
    if (theme === 'light') return '🌙';
    return '🌗';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1>{title}</h1>
          {description && <p className="description">{description}</p>}
        </div>
        
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="icon-button"
            aria-label="Toggle theme"
            title={`Theme: ${theme}`}
          >
            {getThemeIcon()}
          </button>
          
          <button
            onClick={onCopyLink}
            className="icon-button"
            aria-label="Copy share link"
            title="Copy share link"
          >
            🔗
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
