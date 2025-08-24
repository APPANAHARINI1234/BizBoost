import React, { useState, useEffect } from 'react';
import './Analysis.css'; // Import the new CSS file
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

const API_BASE_URL = 'http://localhost:8000'; // Frontend expects backend on port 8000

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
    <div className="platform-tiktok-icon">
      T
    </div>
  )
};

// Business Analysis Form Component
const BusinessAnalysisForm = ({ onSubmit, isLoading }) => {
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
    <div className="analysis-form-card">
      <div className="form-header">
        <div className="form-header-icon-wrapper">
          <Search size={32} color="white" />
        </div>
        <h2 className="form-title">Analyze Your Business Idea</h2>
        <p className="form-subtitle">Get comprehensive insights and social media recommendations powered by Gemini AI</p>
      </div>

      <form onSubmit={handleSubmit} className="form-fields-group">
        <div>
          <label className="form-label">
            Business Idea *
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe your business idea in detail..."
            value={formData.business_idea}
            onChange={(e) => setFormData({...formData, business_idea: e.target.value})}
            required
          />
        </div>

        <div className="form-grid-2-cols">
          <div>
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

          <div>
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

        <div className="form-grid-2-cols">
          <div>
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

          <div>
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

        <div>
          <label className="form-label">
            Goals (Select all that apply)
          </label>
          <div className="form-checkbox-grid">
            {goalOptions.map(goal => (
              <label key={goal} className="checkbox-item">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={formData.goals.includes(goal)}
                  onChange={(e) => handleGoalChange(goal, e.target.checked)}
                />
                <span className="checkbox-text">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-submit-wrapper">
          <button
            type="submit"
            disabled={isLoading || !formData.business_idea || !formData.target_audience || !formData.industry}
            className="form-submit-button"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Analyzing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Analyze Business Idea</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Analysis Status Component
const AnalysisStatus = ({ status, onRefresh }) => {
  const getStatusIcon = () => {
    const iconProps = { size: 24, className: `status-icon ${status.status.replace('_', '-')}` };
    switch (status.status) {
      case 'pending':
        return <Clock {...iconProps} />;
      case 'in_progress':
        return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin`} />;
      case 'completed':
        return <CheckCircle {...iconProps} />;
      case 'failed':
        return <AlertCircle {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  return (
    <div className="analysis-status-container">
      <div className={`status-card ${status.status.replace('_', '-')}`}>
        <div className="status-header">
          <div className="status-header-left">
            {getStatusIcon()}
            <h3 className="status-title">Analysis Status</h3>
          </div>
          <button
            onClick={onRefresh}
            className="status-refresh-button"
            title="Refresh status"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="status-details-group">
          <div className="status-detail-item">
            <span className="status-detail-label">Status:</span>
            <span className="status-detail-value">
              {status.status.replace('_', ' ')}
            </span>
          </div>

          <div>
            <div className="status-detail-item">
              <span className="status-detail-label">Progress:</span>
              <span className="status-detail-value">{status.progress}%</span>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          <div className="status-detail-item">
            <span className="status-detail-label">Current Step:</span>
            <span className="status-detail-value">
              {status.current_step}
            </span>
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
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'default';
    }
  };

  const getCompetitionClass = () => {
    switch (platform.competition_level) {
      case 'low': return 'low-competition';
      case 'medium': return 'medium-competition';
      case 'high': return 'high-competition';
      default: return '';
    }
  };

  return (
    <div className="platform-card">
      <div className="platform-card-header">
        <div className="platform-card-header-left">
          <div className="platform-card-icon-wrapper">
            <IconComponent size={24} color="white" />
          </div>
          <div>
            <h3 className="platform-card-title">{platform.platform}</h3>
            <span className={`platform-priority-tag ${getPriorityClass()}`}>
              {platform.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
      </div>

      <div className="platform-metrics-grid">
        <div className="metric-item purple">
          <div className="metric-content">
            <Eye size={16} className="metric-icon" />
            <span className="metric-label">REACH</span>
          </div>
          <div className="metric-value">{platform.reach_potential}/10</div>
        </div>
        <div className="metric-item blue">
          <div className="metric-content">
            <MessageCircle size={16} className="metric-icon" />
            <span className="metric-label">ENGAGEMENT</span>
          </div>
          <div className="metric-value">{platform.engagement_potential}/10</div>
        </div>
      </div>

      <div className="platform-details-group">
        <div className="platform-detail-item">
          <span className="platform-detail-label">Competition:</span>
          <span className={`platform-detail-value ${getCompetitionClass()}`}>
            {platform.competition_level}
          </span>
        </div>
        <div className="platform-detail-item">
          <span className="platform-detail-label">Audience Size:</span>
          <span className="platform-detail-value">{platform.estimated_audience_size}</span>
        </div>
      </div>

      <div className="platform-strategy-section">
        <div>
          <h4 className="platform-strategy-heading">Content Types:</h4>
          <div className="platform-content-types">
            {platform.content_types.map((type, index) => (
              <span key={index} className="platform-tag purple">
                {type}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="platform-strategy-heading">Key Demographics:</h4>
          <div className="platform-key-demographics">
            {platform.key_demographics.map((demo, index) => (
              <span key={index} className="platform-tag blue">
                {demo}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="platform-strategy-heading">Strategy:</h4>
          <p className="platform-strategy-text">{platform.recommended_strategy}</p>
        </div>
      </div>
    </div>
  );
};

// Competitor Analysis Card
const CompetitorCard = ({ competitor }) => {
  return (
    <div className="competitor-card">
      <div className="competitor-header">
        <h3 className="competitor-name">{competitor.name}</h3>
        <a 
          href={competitor.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="competitor-website"
        >
          {competitor.website}
        </a>
      </div>

      <div className="competitor-details-group">
        <div>
          <h4 className="competitor-section-heading">Social Media Following:</h4>
          <div className="social-following-list">
            {Object.entries(competitor.estimated_followers).map(([platform, followers]) => {
              const IconComponent = platformIcons[platform.charAt(0).toUpperCase() + platform.slice(1)] || Target;
              return (
                <div key={platform} className="social-following-item">
                  <div className="social-platform-info">
                    <IconComponent size={16} />
                    <span className="social-platform-name">{platform}</span>
                  </div>
                  <span className="social-followers-count">
                    {followers.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="competitor-section-heading">Content Strategy:</h4>
          <ul className="content-strategy-list">
            {competitor.content_strategy.map((strategy, index) => (
              <li key={index} className="content-strategy-item">
                <span className="content-strategy-bullet">•</span>
                {strategy}
              </li>
            ))}
          </ul>
        </div>

        <div className="swot-grid">
          <div>
            <h4 className="competitor-section-heading strengths">Strengths:</h4>
            <ul className="swot-list">
              {competitor.strengths.map((strength, index) => (
                <li key={index} className="swot-item">
                  <span className="swot-bullet strength">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="competitor-section-heading weaknesses">Weaknesses:</h4>
            <ul className="swot-list">
              {competitor.weaknesses.map((weakness, index) => (
                <li key={index} className="swot-item">
                  <span className="swot-bullet weakness">-</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Results Display Component
const AnalysisResults = ({ results }) => {
  return (
    <div className="analysis-results-container">
      {/* Header */}
      <div className="results-header-card">
        <h2 className="results-header-title">Analysis Results</h2>
        <p className="results-header-subtitle">{results.business_idea}</p>
      </div>

      {/* Industry Overview */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper purple">
            <TrendingUp size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Industry Overview</h3>
        </div>
        <div className="content-block">
          <p className="content-block-text">
            {results.industry_overview}
          </p>
        </div>
      </div>

      {/* Target Audience Insights */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper blue">
            <Users size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Target Audience Insights</h3>
        </div>
        <div className="insights-grid">
          {results.target_audience_insights.map((insight, index) => (
            <div key={index} className="insight-item blue">
              <Star size={20} className="insight-item-icon" />
              <span className="insight-item-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Recommendations */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper green">
            <Target size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Platform Recommendations</h3>
        </div>
        <div className="insights-grid lg-cols-3"> {/* Added lg-cols-3 for larger screens */}
          {results.platform_recommendations.map((platform, index) => (
            <PlatformCard key={index} platform={platform} />
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper orange">
            <BarChart3 size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Competitor Analysis</h3>
        </div>
        <div className="insights-grid lg-cols-2"> {/* Added lg-cols-2 for larger screens */}
          {results.competitors.map((competitor, index) => (
            <CompetitorCard key={index} competitor={competitor} />
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper yellow">
            <Zap size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Key Insights</h3>
        </div>
        <div className="insights-grid">
          {results.key_insights.map((insight, index) => (
            <div key={index} className="insight-item yellow">
              <Zap size={20} className="insight-item-icon" />
              <span className="insight-item-text">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="results-section">
        <div className="results-section-header">
          <div className="results-section-icon-wrapper green">
            <CheckCircle size={24} className="icon" />
          </div>
          <h3 className="results-section-title">Action Items</h3>
        </div>
        <div className="action-items-list">
          {results.action_items.map((item, index) => (
            <div key={index} className="action-item">
              <div className="action-item-number">
                {index + 1}
              </div>
              <span className="action-item-text">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const Analysis = () => {
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
          setError('Failed to fetch analysis status. Please try refreshing.');
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
        setError('Failed to refresh analysis status.');
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
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-brand">
            <div className="app-header-icon-wrapper">
              <TrendingUp size={24} color="white" />
            </div>
            <div>
              <h1 className="app-header-title">Business Analyzer</h1>
            </div>
          </div>
          {currentView !== 'form' && (
            <button
              onClick={handleStartNewAnalysis}
              className="app-header-button"
            >
              <Search size={16} />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {error && (
          <div className="error-banner">
            <AlertCircle size={20} className="error-banner-icon" />
            <span className="error-banner-text">{error}</span>
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

      
    </div>
  );
};

export default Analysis;
