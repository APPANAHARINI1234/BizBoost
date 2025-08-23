import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, TrendingUp, Users, Target, BarChart3, Loader, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Analyse = () => {
  const [analysisForm, setAnalysisForm] = useState({
    business_idea: '',
    target_audience: '',
    industry: '',
    location: 'United States',
    budget_range: 'small',
    goals: []
  });
  
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const industries = [
    'Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance',
    'Real Estate', 'Food & Beverage', 'Fashion', 'Entertainment', 'Travel',
    'Fitness', 'Beauty', 'Professional Services', 'Manufacturing', 'Other'
  ];

  const budgetRanges = [
    { value: 'small', label: '$0 - $1,000' },
    { value: 'medium', label: '$1,000 - $5,000' },
    { value: 'large', label: '$5,000 - $20,000' },
    { value: 'enterprise', label: '$20,000+' }
  ];

  const goalOptions = [
    'Brand Awareness', 'Lead Generation', 'Sales Growth', 'Customer Engagement',
    'Market Expansion', 'Product Launch', 'Community Building', 'Thought Leadership'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnalysisForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoalsChange = (goal) => {
    setAnalysisForm(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const startAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisForm)
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisId(data.analysis_id);
        // Start polling for status
        pollAnalysisStatus(data.analysis_id);
      } else {
        setError(data.error || 'Failed to start analysis');
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Failed to connect to analysis service');
    } finally {
      setIsLoading(false);
    }
  };

  const pollAnalysisStatus = async (id) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/analysis/${id}/status`);
        const data = await response.json();

        if (data.success) {
          setAnalysisStatus(data);

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            fetchAnalysisResult(id);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setError('Analysis failed');
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  const fetchAnalysisResult = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/analysis/${id}/result`);
      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.result);
      } else {
        setError(data.error || 'Failed to fetch results');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to fetch analysis results');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Business Analysis
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!analysisId ? (
          /* Analysis Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Search className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold">Start Your Business Analysis</h2>
              </div>

              <div className="space-y-6">
                {/* Business Idea */}
                <div>
                  <label className="block text-sm font-medium mb-2">Business Idea *</label>
                  <textarea
                    name="business_idea"
                    value={analysisForm.business_idea}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe your business idea in detail..."
                    required
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience *</label>
                  <input
                    type="text"
                    name="target_audience"
                    value={analysisForm.target_audience}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Young professionals aged 25-35"
                    required
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium mb-2">Industry *</label>
                  <select
                    name="industry"
                    value={analysisForm.industry}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Location</label>
                  <input
                    type="text"
                    name="location"
                    value={analysisForm.location}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., United States, Europe, Global"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Marketing Budget Range</label>
                  <select
                    name="budget_range"
                    value={analysisForm.budget_range}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {budgetRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium mb-2">Business Goals (Select all that apply)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map(goal => (
                      <label key={goal} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={analysisForm.goals.includes(goal)}
                          onChange={() => handleGoalsChange(goal)}
                          className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={startAnalysis}
                  disabled={isLoading || !analysisForm.business_idea || !analysisForm.target_audience || !analysisForm.industry}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Starting Analysis...
                    </div>
                  ) : (
                    'Start Analysis'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Progress & Results */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analysis Progress</h3>
                <div className="text-sm text-gray-400">ID: {analysisId}</div>
              </div>
              
              {analysisStatus && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(analysisStatus.status)}
                    <span className="capitalize">{analysisStatus.status.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysisStatus.progress || 0}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-400">{analysisStatus.current_step}</p>
                </div>
              )}
            </div>

            {/* Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Industry Overview */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold">Industry Overview</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{analysisResult.industry_overview}</p>
                </div>

                {/* Target Audience Insights */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold">Target Audience Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.target_audience_insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Platform Recommendations */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold">Platform Recommendations</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.platform_recommendations.map((platform, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{platform.platform}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            platform.priority === 'high' ? 'bg-green-900 text-green-300' :
                            platform.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {platform.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{platform.recommended_strategy}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Reach Potential:</span>
                            <span>{platform.reach_potential}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engagement:</span>
                            <span>{platform.engagement_potential}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Competition:</span>
                            <span className="capitalize">{platform.competition_level}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitors */}
                {analysisResult.competitors && analysisResult.competitors.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <BarChart3 className="w-6 h-6 text-orange-400" />
                      <h3 className="text-lg font-semibold">Competitor Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      {analysisResult.competitors.map((competitor, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                          <h4 className="font-semibold mb-2">{competitor.name}</h4>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-green-400 mb-1">Strengths:</h5>
                              <ul className="space-y-1 text-gray-400">
                                {competitor.strengths.map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-red-400 mb-1">Weaknesses:</h5>
                              <ul className="space-y-1 text-gray-400">
                                {competitor.weaknesses.map((weakness, i) => (
                                  <li key={i}>• {weakness}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {competitor.estimated_followers && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <h5 className="font-medium text-blue-400 mb-2">Social Media Following:</h5>
                              <div className="flex flex-wrap gap-4 text-xs">
                                {Object.entries(competitor.estimated_followers).map(([platform, count]) => (
                                  <span key={platform} className="bg-gray-600 px-2 py-1 rounded">
                                    {platform}: {count.toLocaleString()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {analysisResult.key_insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Recommended Action Items</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysisResult.action_items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-700/50">
                  <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
                  <p className="text-gray-300 mb-4">
                    Your comprehensive business analysis is ready. This analysis was generated using real-time market data 
                    and industry insights powered by Portia AI.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>Business Idea: {analysisResult.business_idea}</span>
                    <span>•</span>
                    <span>Generated: {new Date(analysisResult.generated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setAnalysisId(null);
                      setAnalysisStatus(null);
                      setAnalysisResult(null);
                      setAnalysisForm({
                        business_idea: '',
                        target_audience: '',
                        industry: '',
                        location: 'United States',
                        budget_range: 'small',
                        goals: []
                      });
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-300"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyse;