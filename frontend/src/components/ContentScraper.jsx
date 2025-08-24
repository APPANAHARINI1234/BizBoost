import React, { useState } from 'react';

function ContentScraper({ onContentScraped }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a URL to scrape.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (response.ok && data.main_text) {
        onContentScraped(data);
        alert('Content scraped successfully! Customization fields updated.');
      } else {
        setError(data.error || 'Failed to scrape content. Please check the URL and try again.');
        console.error('Scraping error:', data);
      }
    } catch (err) {
      setError('Network error or backend issue. Please ensure the backend is running.');
      console.error('Error during scraping:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-scraper panel">
          </div>
  );
}

export default ContentScraper;
