import React, { useState, useEffect } from 'react';
import './index.css';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
  Star,
  Zap,
  Eye,
  MessageCircle,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Platform icons mapping
const platformIcons = {
  'Instagram': Instagram,
  'Twitter': Twitter,
  'Facebook': Facebook,
  'YouTube': Youtube,
  'LinkedIn': Linkedin,
  'TikTok': () => (
    <div style={{
      width: '20px',
      height: '20px',
      backgroundColor: '#000',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      T
    </div>
  )
};

// Business Analysis Form Component
const App = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    business_idea: '',
    target_audience: '',
    industry: '',
    location: 'United States',
    budget_range: 'small',
    goals: []
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage',
    'Fashion', 'Education', 'Real Estate', 'Automotive', 'Entertainment',
    'Fitness', 'Beauty', 'Travel', 'Professional Services', 'Other'
  ];

  const budgetRanges = [
    { value: 'small', label: 'Small ($0 - $1,000/month)' },
    { value: 'medium', label: 'Medium ($1,000 - $5,000/month)' },
    { value: 'large', label: 'Large ($5,000+ /month)' }
  ];

  const goalOptions = [
    'Brand Awareness', 'Lead Generation', 'Sales Conversion', 
    'Community Building', 'Customer Support', 'Thought Leadership'
  ];

  const handleGoalChange = (goal, checked) => {
    setFormData(prev => ({
      ...prev,
      goals: checked 
        ? [...prev.goals, goal]
        : prev.goals.filter(g => g !== goal)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-icon">
          <Search size={32} color="white" />
        </div>
        <h2 className="form-title">Analyze Your Business Idea</h2>
        <p className="form-subtitle">Get comprehensive insights and social media recommendations powered by AI</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">
            Business Idea *
          </label>
          <textarea
            className="form-textarea"
            placeholder="Describe your business idea in detail..."
            value={formData.business_idea}
            onChange={(e) => setFormData({...formData, business_idea: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Target Audience *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Young professionals aged 25-35"
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Industry *
            </label>
            <select
              className="form-select"
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
              required
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Location
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., United States, Europe, Global"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Budget Range
            </label>
            <select
              className="form-select"
              value={formData.budget_range}
              onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
            >
              {budgetRanges.map(budget => (
                <option key={budget.value} value={budget.value}>{budget.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Goals (Select all that apply)
          </label>
          <div className="checkbox-grid">
            {goalOptions.map(goal => (
              <label key={goal} className="checkbox-item">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={(e) => handleGoalChange(goal, e.target.checked)}
                />
                <span className="checkbox-label">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Analyze Business Idea</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Analysis Status Component
const AnalysisStatus = ({ status, onRefresh }) => {
  const getStatusIcon = () => {
    const iconStyle = { color: getStatusIconColor() };
    switch (status.status) {
      case 'pending':
        return <Clock size={24} style={iconStyle} />;
      case 'in_progress':
        return <Loader2 size={24} style={iconStyle} className="animate-spin" />;
      case 'completed':
        return <CheckCircle size={24} style={iconStyle} />;
      case 'failed':
        return <AlertCircle size={24} style={iconStyle} />;
      default:
        return <Clock size={24} style={iconStyle} />;
    }
  };

  const getStatusIconColor = () => {
    switch (status.status) {
      case 'pending': return '#eab308';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#16a34a';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusCardClass = () => {
    switch (status.status) {
      case 'pending': return 'status-card status-pending';
      case 'in_progress': return 'status-card status-progress';
      case 'completed': return 'status-card status-completed';
      case 'failed': return 'status-card status-failed';
      default: return 'status-card';
    }
  };

  return (
    <div className="status-container">
      <div className={getStatusCardClass()}>
        <div className="status-header">
          <div className="status-title-row">
            {getStatusIcon()}
            <h3 className="status-title">Analysis Status</h3>
          </div>
          <button
            onClick={onRefresh}
            className="refresh-btn"
            title="Refresh status"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="status-details">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className="status-value">{status.status.replace('_', ' ')}</span>
          </div>

          <div className="progress-container">
            <div className="progress-header">
              <span className="status-label">Progress:</span>
              <span className="status-value">{status.progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          <div className="status-row">
            <span className="status-label">Current Step:</span>
            <span className="status-value">{status.current_step}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform Recommendation Card
const PlatformCard = ({ platform }) => {
  const IconComponent = platformIcons[platform.platform] || Target;
  
  const getPriorityClass = () => {
    switch (platform.priority) {
      case 'high': return 'priority-badge priority-high';
      case 'medium': return 'priority-badge priority-medium';
      case 'low': return 'priority-badge priority-low';
      default: return 'priority-badge priority-low';
    }
  };

  const getCompetitionClass = () => {
    switch (platform.competition_level) {
      case 'low': return 'detail-value competition-low';
      case 'medium': return 'detail-value competition-medium';
      case 'high': return 'detail-value competition-high';
      default: return 'detail-value';
    }
  };

  return (
    <div className="platform-card">
      <div className="platform-header">
        <div className="platform-info">
          <div className="platform-icon">
            <IconComponent size={24} color="white" />
          </div>
          <div className="platform-details">
            <h3>{platform.platform}</h3>
            <span className={getPriorityClass()}>
              {platform.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Eye size={16} style={{color: '#8b5cf6'}} />
            <span className="metric-label">REACH</span>
          </div>
          <div className="metric-value">{platform.reach_potential}/10</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <MessageCircle size={16} style={{color: '#3b82f6'}} />
            <span className="metric-label">ENGAGEMENT</span>
          </div>
          <div className="metric-value">{platform.engagement_potential}/10</div>
        </div>
      </div>

      <div className="platform-details-section">
        <div className="detail-row">
          <span className="detail-label">Competition Level:</span>
          <span className={getCompetitionClass()}>
            {platform.competition_level}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Audience Size:</span>
          <span className="detail-value">{platform.estimated_audience_size}</span>
        </div>
      </div>

      <div className="content-section">
        <h4 className="section-subtitle">Content Types:</h4>
        <div className="tag-list">
          {platform.content_types.map((type, index) => (
            <span key={index} className="tag tag-purple">
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h4 className="section-subtitle">Key Demographics:</h4>
        <div className="tag-list">
          {platform.key_demographics.map((demo, index) => (
            <span key={index} className="tag tag-blue">
              {demo}
            </span>
          ))}
        </div>
      </div>

      <div className="strategy-section">
        <h4 className="section-subtitle">Recommended Strategy:</h4>
        <p className="strategy-text">{platform.recommended_strategy}</p>
      </div>
    </div>
  );
};

// Competitor Analysis Card
const CompetitorCard = ({ competitor }) => {
  return (
    <div className="competitor-card">
      <div className="competitor-header">
        <div className="competitor-info">
          <h3>{competitor.name}</h3>
          <a 
            href={competitor.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="competitor-link"
          >
            {competitor.website}
          </a>
        </div>
      </div>

      <div className="competitor-details">
        <div className="social-section">
          <h4 className="section-subtitle">Social Media:</h4>
          <div className="social-metrics">
            {Object.entries(competitor.estimated_followers).map(([platform, followers]) => {
              const IconComponent = platformIcons[platform.charAt(0).toUpperCase() + platform.slice(1)] || Target;
              return (
                <div key={platform} className="social-metric">
                  <div className="social-platform">
                    <IconComponent size={16} />
                    <span className="social-platform-name">{platform}</span>
                  </div>
                  <span className="social-count">
                    {followers.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="content-strategy-section">
          <h4 className="section-subtitle">Content Strategy:</h4>
          <div className="strategy-list">
            {competitor.content_strategy.map((strategy, index) => (
              <div key={index} className="strategy-item">• {strategy}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="strengths-weaknesses">
        <div className="strengths-section">
          <h4>Strengths:</h4>
          <div>
            {competitor.strengths.map((strength, index) => (
              <div key={index} className="strength-item">• {strength}</div>
            ))}
          </div>
        </div>
        <div className="weaknesses-section">
          <h4>Weaknesses:</h4>
          <div>
            {competitor.weaknesses.map((weakness, index) => (
              <div key={index} className="weakness-item">• {weakness}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Results Display Component
const AnalysisResults = ({ results }) => {
  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <h2 className="results-title">Analysis Results</h2>
        <p className="results-description">{results.business_idea}</p>
      </div>

      {/* Industry Overview */}
      <div className="section-card">
        <div className="section-header">
          <TrendingUp size={32} className="section-icon" style={{color: '#8b5cf6'}} />
          <h3 className="section-title">Industry Overview</h3>
        </div>
        <div className="section-content">
          {results.industry_overview}
        </div>
      </div>

      {/* Target Audience Insights */}
      <div className="section-card">
        <div className="section-header">
          <Users size={32} className="section-icon" style={{color: '#3b82f6'}} />
          <h3 className="section-title">Target Audience Insights</h3>
        </div>
        <div className="insights-grid">
          {results.target_audience_insights.map((insight, index) => (
            <div key={index} className="insight-card insight-blue">
              <Star size={20} style={{color: '#3b82f6'}} />
              <span className="insight-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Recommendations */}
      <div className="section-card">
        <div className="section-header">
          <Target size={32} className="section-icon" style={{color: '#16a34a'}} />
          <h3 className="section-title">Platform Recommendations</h3>
        </div>
        <div className="platform-grid">
          {results.platform_recommendations.map((platform, index) => (
            <PlatformCard key={index} platform={platform} />
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="section-card">
        <div className="section-header">
          <BarChart3 size={32} className="section-icon" style={{color: '#f97316'}} />
          <h3 className="section-title">Competitor Analysis</h3>
        </div>
        <div className="competitor-grid">
          {results.competitors.map((competitor, index) => (
            <CompetitorCard key={index} competitor={competitor} />
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="section-card">
        <div className="section-header">
          <Zap size={32} className="section-icon" style={{color: '#eab308'}} />
          <h3 className="section-title">Key Insights</h3>
        </div>
        <div className="insights-grid">
          {results.key_insights.map((insight, index) => (
            <div key={index} className="insight-card insight-yellow">
              <Zap size={20} style={{color: '#eab308'}} />
              <span className="insight-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="section-card">
        <div className="section-header">
          <CheckCircle size={32} className="section-icon" style={{color: '#16a34a'}} />
          <h3 className="section-title">Action Items</h3>
        </div>
        <div className="action-items-list">
          {results.action_items.map((item, index) => (
            <div key={index} className="action-item">
              <div className="action-number">
                {index + 1}
              </div>
              <span className="action-text">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const BusinessAnalysisApp = () => {
  const [currentView, setCurrentView] = useState('form'); // 'form', 'analyzing', 'results'
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll for analysis status
  useEffect(() => {
    if (analysisId && currentView === 'analyzing') {
      const pollStatus = async () => {
        try {
          const status = await apiCall(`/analysis/${analysisId}/status`);
          setAnalysisStatus(status);
          
          if (status.status === 'completed') {
            const results = await apiCall(`/analysis/${analysisId}/result`);
            setAnalysisResults(results);
            setCurrentView('results');
          } else if (status.status === 'failed') {
            setError('Analysis failed. Please try again.');
            setCurrentView('form');
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      };

      const interval = setInterval(pollStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [analysisId, currentView]);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall('/analyze', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setAnalysisId(response.analysis_id);
      setCurrentView('analyzing');
    } catch (err) {
      setError('Failed to start analysis. Please try again.');
      console.error('Error starting analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (analysisId) {
      try {
        const status = await apiCall(`/analysis/${analysisId}/status`);
        setAnalysisStatus(status);
      } catch (err) {
        console.error('Error refreshing status:', err);
      }
    }
  };

  const handleStartNewAnalysis = () => {
    setCurrentView('form');
    setAnalysisId(null);
    setAnalysisStatus(null);
    setAnalysisResults(null);
    setError(null);
  };

  return (
    <div className="app-background">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-logo">
              <div className="header-logo-icon">
                <TrendingUp size={24} color="white" />
              </div>
              <div>
                <h1 className="header-title">Business Analyzer</h1>
                <p className="header-subtitle">AI-powered market analysis</p>
              </div>
            </div>
            {currentView !== 'form' && (
              <button
                onClick={handleStartNewAnalysis}
                className="new-analysis-btn"
              >
                <Search size={16} />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {currentView === 'form' && (
          <BusinessAnalysisForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}

        {currentView === 'analyzing' && analysisStatus && (
          <AnalysisStatus status={analysisStatus} onRefresh={handleRefreshStatus} />
        )}

        {currentView === 'results' && analysisResults && (
          <AnalysisResults results={analysisResults} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <p className="footer-title">Powered by Portia AI & Advanced Language Models</p>
            <p className="footer-subtitle">Get comprehensive business analysis and social media recommendations</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;