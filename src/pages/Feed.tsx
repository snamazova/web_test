import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useContent } from '../contexts/ContentContext';
import { getOpenMojiUrl, LAB_COLOR } from '../utils/colorUtils';
import '../styles/styles.css';

const Feed: React.FC = () => {
  const { newsItems } = useContent();
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Get unique tags
  const allTags = newsItems.flatMap(item => item.tags || []);
  const uniqueTags = ['All', ...Array.from(new Set(allTags))];

  // Filter news by selected tag
  const filteredNews = selectedTag === 'All'
    ? newsItems
    : newsItems.filter(item => item.tags?.includes(selectedTag));

  // Sort news by date (newest first), with featured items at the top
  const sortedNews = [...filteredNews].sort((a, b) => {
    // First sort by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then by date
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a news item has emojis
  const hasEmojis = (item: any): boolean => 
    Boolean(item.emojiHexcodes && item.emojiHexcodes.length > 0);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Latest News</h1>
        <p>Stay updated with the latest news from our lab.</p>
      </div>

      <div className="tag-filter">
        <h3>Filter by Tag</h3>
        <div className="tag-list">
          {uniqueTags.map(tag => (
            <button
              key={tag}
              className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="news-grid" style={{ marginTop: '30px' }}>
        {sortedNews.length > 0 ? (
          sortedNews.map(item => (
            <div key={item.id} className={`news-card ${item.featured ? 'featured' : ''}`}>
              {/* Show emojis if available, otherwise show image if available */}
              {hasEmojis(item) ? (
                <div 
                  className="news-emoji-container"
                  style={{ backgroundColor: LAB_COLOR }}
                >
                  {item.emojiHexcodes && item.emojiHexcodes.map((hexcode: string, index: number) => (
                    <img 
                      key={index}
                      src={getOpenMojiUrl(hexcode, true)} // Set invertColor to true to make emojis white
                      alt={`News Emoji ${index+1}`} 
                      className="news-emoji"
                      style={{ filter: 'invert(1)' }} // Add CSS filter to invert colors (black to white)
                      onError={(e) => {
                        console.error(`Failed to load emoji with hexcode: ${hexcode}`);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ))}
                  {item.featured && <span className="featured-banner">Featured</span>}
                </div>
              ) : item.imageUrl ? (
                <div className="news-image">
                  <img src={item.imageUrl} alt={item.title} />
                  {item.featured && <span className="featured-banner">Featured</span>}
                </div>
              ) : item.featured && (
                <div className="featured-header">
                  <span className="featured-banner">Featured</span>
                </div>
              )}
              <div className="news-content">
                <h3>{item.title}</h3>
                <div className="news-meta">
                  <span className="news-date">{formatDate(item.date)}</span>
                  <span className="news-author">By {item.author}</span>
                </div>
                <p className="news-text">{item.content}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="news-tags">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="news-tag"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-news">
            <p>No news items found for this tag.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
