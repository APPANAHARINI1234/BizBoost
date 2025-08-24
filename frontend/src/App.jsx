import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Import routing components
import HomePageContent from './HomePageContent'; // Import the new HomePageContent component
 // Import the new ScrapComp component
import './App.css'; // Import App-specific styles
import BizzTools from './BizzTools';
import Analysis from './Analysis';
function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">Grogent</Link> {/* Link logo to homepage */}
          <nav className="nav-links">
            <Link to="/" className="link temp">Home</Link> {/* Link to homepage */}
            <Link to="/analysis" className="link temp">Analysis</Link> {/* New Analysis link */}
            <Link to="/tools" className="link temp">Tools</Link>
            <a href="#features">Features</a>
            <a href="#portia">Portia AI</a>
            <a href="#platforms">Platforms</a>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/tools" element={<BizzTools />} />
                <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </div>
  );
}

export default App;