import React, { useState, useEffect } from 'react';
import './Analysis.css';
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
    <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
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
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search size={32} color="white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Analyze Your Business Idea</h2>
        <p className="text-gray-600">Get comprehensive insights and social media recommendations powered by Gemini AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Idea *
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Describe your business idea in detail..."
            value={formData.business_idea}
            onChange={(e) => setFormData({...formData, business_idea: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Young professionals aged 25-35"
              value={formData.target_audience}
              onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., United States, Europe, Global"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Range
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Goals (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {goalOptions.map(goal => (
              <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.goals.includes(goal)}
                  onChange={(e) => handleGoalChange(goal, e.target.checked)}
                />
                <span className="text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.business_idea || !formData.target_audience || !formData.industry}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
    const iconProps = { size: 24, className: getStatusIconClass() };
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

  const getStatusIconClass = () => {
    switch (status.status) {
      case 'pending': return 'text-yellow-500';
      case 'in_progress': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusCardClass = () => {
    const baseClass = 'bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto';
    switch (status.status) {
      case 'pending': return `${baseClass} border-l-4 border-yellow-500`;
      case 'in_progress': return `${baseClass} border-l-4 border-blue-500`;
      case 'completed': return `${baseClass} border-l-4 border-green-500`;
      case 'failed': return `${baseClass} border-l-4 border-red-500`;
      default: return `${baseClass} border-l-4 border-gray-500`;
    }
  };

  return (
    <div className="space-y-6">
      <div className={getStatusCardClass()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h3 className="text-xl font-semibold text-gray-800">Analysis Status</h3>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh status"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span className="text-sm font-semibold capitalize text-gray-800">
              {status.status.replace('_', ' ')}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress:</span>
              <span className="text-sm font-semibold text-gray-800">{status.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current Step:</span>
            <span className="text-sm font-semibold text-gray-800 text-right">
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
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getCompetitionColor = () => {
    switch (platform.competition_level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <IconComponent size={24} color="white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{platform.platform}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityClass()}`}>
              {platform.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Eye size={16} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-600">REACH</span>
          </div>
          <div className="text-xl font-bold text-purple-600">{platform.reach_potential}/10</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <MessageCircle size={16} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-600">ENGAGEMENT</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{platform.engagement_potential}/10</div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Competition:</span>
          <span className={`text-sm font-semibold capitalize ${getCompetitionColor()}`}>
            {platform.competition_level}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">Audience Size:</span>
          <span className="text-sm font-semibold text-gray-800">{platform.estimated_audience_size}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Types:</h4>
          <div className="flex flex-wrap gap-1">
            {platform.content_types.map((type, index) => (
              <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {type}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Demographics:</h4>
          <div className="flex flex-wrap gap-1">
            {platform.key_demographics.map((demo, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {demo}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Strategy:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{platform.recommended_strategy}</p>
        </div>
      </div>
    </div>
  );
};

// Competitor Analysis Card
const CompetitorCard = ({ competitor }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{competitor.name}</h3>
        <a 
          href={competitor.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 text-sm underline"
        >
          {competitor.website}
        </a>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Social Media Following:</h4>
          <div className="space-y-2">
            {Object.entries(competitor.estimated_followers).map(([platform, followers]) => {
              const IconComponent = platformIcons[platform.charAt(0).toUpperCase() + platform.slice(1)] || Target;
              return (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent size={16} />
                    <span className="text-sm capitalize text-gray-600">{platform}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {followers.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Content Strategy:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {competitor.content_strategy.map((strategy, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {strategy}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-green-600 mb-2">Strengths:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {competitor.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-1">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-red-600 mb-2">Weaknesses:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {competitor.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-1">-</span>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Results</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">{results.business_idea}</p>
      </div>

      {/* Industry Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Industry Overview</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {results.industry_overview}
          </p>
        </div>
      </div>

      {/* Target Audience Insights */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Target Audience Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.target_audience_insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Star size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Target size={24} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Platform Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.platform_recommendations.map((platform, index) => (
            <PlatformCard key={index} platform={platform} />
          ))}
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} className="text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Competitor Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {results.competitors.map((competitor, index) => (
            <CompetitorCard key={index} competitor={competitor} />
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Key Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.key_insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <Zap size={20} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Action Items</h3>
        </div>
        <div className="space-y-3">
          {results.action_items.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-gray-700">{item}</span>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} color="white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Business Analyzer</h1>
                <p className="text-sm text-gray-500">Powered by Gemini AI</p>
              </div>
            </div>
            {currentView !== 'form' && (
              <button
                onClick={handleStartNewAnalysis}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                <Search size={16} />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-red-700">{error}</span>
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
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Powered by Google Gemini AI & Advanced Language Models</p>
            <p className="text-sm text-gray-500 mt-1">Get comprehensive business analysis and social media recommendations</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Analysis;