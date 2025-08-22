import React, { useState, useEffect } from 'react';
import { 
  User, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target,
  CheckCircle,
  AlertCircle,
  Loader,
  LogIn,
  UserPlus,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// API utility functions using fetch instead of axios
const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  
  post: async (url, data) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Page state
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'business-setup', 'dashboard'
  
  // Form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    confirmPassword: ''
  });
  
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    description: '',
    industry: '',
    target_audience: '',
    budget_range: '',
    current_platforms: [],
    goals: ''
  });
  
  // Dashboard state
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // CSS Styles
  const styles = {
    // Base styles
    body: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      margin: 0,
      padding: 0
    },
    
    // Layout styles
    minHeight: {
      minHeight: '100vh'
    },
    
    gradientBg: {
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      minHeight: '100vh'
    },
    
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem'
    },
    
    // Card styles
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '2rem'
    },
    
    cardSmall: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    },
    
    // Form styles
    formGroup: {
      marginBottom: '1rem'
    },
    
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
      outline: 'none',
      boxSizing: 'border-box'
    },
    
    inputFocus: {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
    },
    
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'white',
      cursor: 'pointer',
      outline: 'none',
      boxSizing: 'border-box'
    },
    
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box'
    },
    
    // Button styles
    btnPrimary: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%'
    },
    
    btnSuccess: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%'
    },
    
    btnSecondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    
    btnLink: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500'
    },
    
    // Alert styles
    alertSuccess: {
      backgroundColor: '#dcfce7',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      color: '#166534'
    },
    
    alertError: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      color: '#991b1b'
    },
    
    alertInfo: {
      backgroundColor: '#dbeafe',
      border: '1px solid #93c5fd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      color: '#1e40af'
    },
    
    // Layout helpers
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    
    flexBetween: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    
    flex: {
      display: 'flex',
      alignItems: 'center'
    },
    
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem'
    },
    
    // Text styles
    textCenter: {
      textAlign: 'center'
    },
    
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: '0 0 0.5rem 0'
    },
    
    subtitle: {
      fontSize: '1.125rem',
      color: '#6b7280',
      margin: '0'
    },
    
    // Badge styles
    badgeSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    
    badgeWarning: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    
    badgeError: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    
    badgeInfo: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '0.25rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    
    // Table styles
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      overflow: 'hidden',
      borderRadius: '8px'
    },
    
    tableHeader: {
      backgroundColor: '#f9fafb',
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb'
    },
    
    tableCell: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#6b7280'
    },
    
    tableRow: {
      transition: 'background-color 0.15s ease-in-out'
    },
    
    // Position utilities
    relative: {
      position: 'relative'
    },
    
    absolute: {
      position: 'absolute'
    },
    
    // Spacing
    mb4: {
      marginBottom: '1rem'
    },
    
    mb6: {
      marginBottom: '1.5rem'
    },
    
    mt4: {
      marginTop: '1rem'
    },
    
    mt6: {
      marginTop: '1.5rem'
    },
    
    p4: {
      padding: '1rem'
    },
    
    p6: {
      padding: '1.5rem'
    },
    
    // Loading animation
    spin: {
      animation: 'spin 1s linear infinite'
    }
  };

  // Check authentication on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await api.get('/user');
      setUser(userData.user);
      
      // Check if user has business
      try {
        const businessData = await api.get('/business');
        setBusiness(businessData.business);
        setCurrentPage('dashboard');
      } catch (err) {
        setCurrentPage('business-setup');
      }
    } catch (error) {
      setCurrentPage('login');
    } finally {
      setIsLoading(false);
    }
  };

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const response = await api.post('/login', {
        email: authForm.email,
        password: authForm.password
      });
      
      setUser(response.user);
      setSuccess('Login successful!');
      
      // Check if user has business
      try {
        const businessData = await api.get('/business');
        setBusiness(businessData.business);
        setCurrentPage('dashboard');
      } catch (err) {
        setCurrentPage('business-setup');
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    if (authForm.password !== authForm.confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }
    
    if (authForm.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    
    try {
      const response = await api.post('/register', {
        email: authForm.email,
        password: authForm.password,
        full_name: authForm.full_name
      });
      
      setUser(response.user);
      setSuccess('Registration successful!');
      setCurrentPage('business-setup');
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed' });
    }
  };

  const handleBusinessSetup = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsAnalyzing(true);
    
    try {
      const response = await api.post('/business', businessForm);
      setBusiness({ ...businessForm, id: response.business_id });
      setSuccess('Business created! Analyzing your market...');
      
      // Start analytics loading
      setTimeout(() => {
        loadDashboardData(response.business_id);
      }, 3000);
      
      setCurrentPage('dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Business setup failed' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadDashboardData = async (businessId) => {
    try {
      setIsAnalyzing(true);
      
      // Load dashboard data
      const dashboardData = await api.get(`/dashboard/${businessId}`);
      
      setAnalytics(dashboardData.platforms || []);
      setInsights(dashboardData.insights || []);
      setBusiness(dashboardData.business);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout', {});
      setUser(null);
      setBusiness(null);
      setAnalytics([]);
      setInsights([]);
      setCurrentPage('login');
      setSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add keyframes for animations
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .table-row:hover {
        background-color: #f9fafb;
      }
      
      .btn-primary:hover {
        background-color: #1d4ed8;
      }
      
      .btn-success:hover {
        background-color: #047857;
      }
      
      .btn-secondary:hover {
        background-color: #e5e7eb;
      }
      
      .btn-link:hover {
        color: #1d4ed8;
        text-decoration: underline;
      }
      
      input:focus, select:focus, textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div style={{...styles.gradientBg, ...styles.flexCenter}}>
        <div style={styles.textCenter}>
          <Loader style={styles.spin} size={48} color="#2563eb" />
          <p style={{color: '#6b7280', marginTop: '1rem'}}>Loading SmallBiz Growth Hub...</p>
        </div>
      </div>
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <div style={{...styles.gradientBg, ...styles.flexCenter, padding: '1rem'}}>
        <div style={{...styles.card, width: '100%', maxWidth: '400px'}}>
          <div style={{...styles.textCenter, marginBottom: '2rem'}}>
            <TrendingUp size={64} color="#2563eb" style={{margin: '0 auto 1rem'}} />
            <h1 style={styles.title}>SmallBiz Growth Hub</h1>
            <p style={styles.subtitle}>Grow your business with AI-powered insights</p>
          </div>

          {success && (
            <div style={styles.alertSuccess}>
              <p style={{margin: 0, fontSize: '0.875rem'}}>{success}</p>
            </div>
          )}

          {errors.general && (
            <div style={styles.alertError}>
              <p style={{margin: 0, fontSize: '0.875rem'}}>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.relative}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{...styles.input, paddingRight: '2.5rem'}}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    ...styles.absolute,
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.btnPrimary} className="btn-primary">
              <LogIn size={16} />
              Login
            </button>
          </form>

          <div style={{...styles.textCenter, marginTop: '1.5rem'}}>
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>Don't have an account?</p>
            <button
              onClick={() => setCurrentPage('register')}
              style={styles.btnLink}
              className="btn-link"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Register Page
  if (currentPage === 'register') {
    return (
      <div style={{...styles.gradientBg, ...styles.flexCenter, padding: '1rem'}}>
        <div style={{...styles.card, width: '100%', maxWidth: '400px'}}>
          <div style={{...styles.textCenter, marginBottom: '1.5rem'}}>
            <UserPlus size={48} color="#2563eb" style={{margin: '0 auto 0.75rem'}} />
            <h2 style={{...styles.title, fontSize: '1.5rem'}}>Create Account</h2>
            <p style={styles.subtitle}>Join thousands of growing businesses</p>
          </div>

          {errors.general && (
            <div style={styles.alertError}>
              <p style={{margin: 0, fontSize: '0.875rem'}}>{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={authForm.full_name}
                onChange={(e) => setAuthForm(prev => ({ ...prev, full_name: e.target.value }))}
                style={styles.input}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                style={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.relative}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{...styles.input, paddingRight: '2.5rem'}}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    ...styles.absolute,
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0 0 0'}}>{errors.password}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                style={styles.input}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" style={styles.btnPrimary} className="btn-primary">
              <UserPlus size={16} />
              Create Account
            </button>
          </form>

          <div style={{...styles.textCenter, marginTop: '1.5rem'}}>
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>Already have an account?</p>
            <button
              onClick={() => setCurrentPage('login')}
              style={styles.btnLink}
              className="btn-link"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Business Setup Page
  if (currentPage === 'business-setup') {
    const industries = [
      'Fashion & Apparel',
      'Food & Beverages',
      'Technology',
      'Beauty & Personal Care',
      'Electronics',
      'Home & Garden',
      'Fitness & Health',
      'Education & Training',
      'Automotive',
      'Jewelry & Accessories'
    ];

    const budgetRanges = [
      'Under ₹10,000',
      '₹10,000 - ₹50,000',
      '₹50,000 - ₹2,00,000',
      '₹2,00,000 - ₹5,00,000',
      'Above ₹5,00,000'
    ];

    const platforms = [
      'Instagram',
      'Facebook',
      'Amazon',
      'Flipkart',
      'YouTube',
      'WhatsApp Business',
      'Website',
      'Physical Store'
    ];

    return (
      <div style={{...styles.gradientBg, padding: '1rem', minHeight: '100vh'}}>
        <div style={styles.container}>
          {/* Header */}
          <div style={{...styles.cardSmall, ...styles.mb6}}>
            <div style={styles.flexBetween}>
              <div style={styles.flex}>
                <Building2 size={32} color="#2563eb" style={{marginRight: '0.75rem'}} />
                <div>
                  <h1 style={{...styles.title, fontSize: '1.5rem', margin: 0}}>Business Setup</h1>
                  <p style={{...styles.subtitle, fontSize: '1rem', margin: 0}}>Tell us about your business for personalized insights</p>
                </div>
              </div>
              <div style={{...styles.flex, fontSize: '0.875rem', color: '#6b7280'}}>
                <User size={16} style={{marginRight: '0.25rem'}} />
                {user?.full_name}
                <button onClick={handleLogout} style={{...styles.btnLink, marginLeft: '1rem'}} className="btn-link">
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Business Form */}
          <div style={styles.card}>
            {success && (
              <div style={{...styles.alertSuccess, ...styles.flex, marginBottom: '1.5rem'}}>
                <CheckCircle size={20} color="#059669" style={{marginRight: '0.5rem'}} />
                <p style={{margin: 0}}>{success}</p>
              </div>
            )}

            {errors.general && (
              <div style={{...styles.alertError, ...styles.flex, marginBottom: '1.5rem'}}>
                <AlertCircle size={20} color="#dc2626" style={{marginRight: '0.5rem'}} />
                <p style={{margin: 0}}>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleBusinessSetup}>
              <div style={{...styles.grid2, marginBottom: '1.5rem'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessForm.business_name}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, business_name: e.target.value }))}
                    style={styles.input}
                    placeholder="e.g., Artisan Jewelry Studio"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Industry *
                  </label>
                  <select
                    value={businessForm.industry}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, industry: e.target.value }))}
                    style={styles.select}
                    required
                  >
                    <option value="">Select your industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{...styles.formGroup, marginBottom: '1.5rem'}}>
                <label style={styles.label}>
                  Business Description *
                </label>
                <textarea
                  value={businessForm.description}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{...styles.textarea, height: '100px'}}
                  placeholder="Describe your products/services, what makes you unique..."
                  required
                />
              </div>

              <div style={{...styles.grid2, marginBottom: '1.5rem'}}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={businessForm.target_audience}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, target_audience: e.target.value }))}
                    style={styles.input}
                    placeholder="e.g., Young professionals, Mothers, Students"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Marketing Budget
                  </label>
                  <select
                    value={businessForm.budget_range}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, budget_range: e.target.value }))}
                    style={styles.select}
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <label style={styles.label}>
                  Current Platforms (Select all that apply)
                </label>
                <div style={styles.grid4}>
                  {platforms.map(platform => (
                    <label key={platform} style={styles.flex}>
                      <input
                        type="checkbox"
                        checked={businessForm.current_platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBusinessForm(prev => ({
                              ...prev,
                              current_platforms: [...prev.current_platforms, platform]
                            }));
                          } else {
                            setBusinessForm(prev => ({
                              ...prev,
                              current_platforms: prev.current_platforms.filter(p => p !== platform)
                            }));
                          }
                        }}
                        style={{marginRight: '0.5rem'}}
                      />
                      <span style={{fontSize: '0.875rem', color: '#374151'}}>{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{...styles.formGroup, marginBottom: '1.5rem'}}>
                <label style={styles.label}>
                  Business Goals
                </label>
                <textarea
                  value={businessForm.goals}
                  onChange={(e) => setBusinessForm(prev => ({ ...prev, goals: e.target.value }))}
                  style={{...styles.textarea, height: '80px'}}
                  placeholder="What do you want to achieve? (e.g., increase sales, brand awareness, customer base)"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                style={{
                  ...styles.btnSuccess,
                  opacity: isAnalyzing ? 0.5 : 1,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                }}
                className="btn-success"
              >
                {isAnalyzing ? (
                  <>
                    <Loader style={styles.spin} size={16} />
                    Analyzing Your Business...
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    Start My Business Analysis
                  </>
                )}
              </button>
            </form>

            <div style={{...styles.textCenter, marginTop: '1rem'}}>
              <button
                onClick={() => setCurrentPage('login')}
                style={{...styles.btnLink, fontSize: '0.875rem'}}
                className="btn-link"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Page
  if (currentPage === 'dashboard' && business) {
    return (
      <div style={{backgroundColor: '#f9fafb', padding: '1rem', minHeight: '100vh'}}>
        <div style={styles.container}>
          {/* Header */}
          <div style={{...styles.cardSmall, ...styles.mb6}}>
            <div style={styles.flexBetween}>
              <div style={styles.flex}>
                <TrendingUp size={32} color="#2563eb" style={{marginRight: '0.75rem'}} />
                <div>
                  <h1 style={{...styles.title, fontSize: '2rem', margin: 0}}>{business.business_name}</h1>
                  <p style={{...styles.subtitle, margin: 0}}>{business.industry} • {business.description}</p>
                </div>
              </div>
              <div style={{...styles.flex, gap: '1rem'}}>
                <div style={{textAlign: 'right'}}>
                  <p style={{fontSize: '0.875rem', color: '#6b7280', margin: 0}}>Welcome back,</p>
                  <p style={{fontWeight: '500', color: '#111827', margin: 0}}>{user?.full_name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  style={styles.btnSecondary}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {isAnalyzing && (
            <div style={{...styles.alertInfo, ...styles.flex, marginBottom: '1.5rem'}}>
              <Loader style={styles.spin} size={24} color="#2563eb" />
              <div style={{marginLeft: '0.75rem'}}>
                <h3 style={{fontWeight: '500', color: '#1e40af', margin: '0 0 0.25rem 0'}}>Analyzing Your Market...</h3>
                <p style={{color: '#2563eb', fontSize: '0.875rem', margin: 0}}>This may take 1-2 minutes. We're gathering insights from multiple platforms.</p>
              </div>
            </div>
          )}

          {/* Platform Analytics */}
          <div style={{...styles.grid2, marginBottom: '1.5rem'}}>
            <div style={styles.card}>
              <div style={{...styles.flex, marginBottom: '1rem'}}>
                <BarChart3 size={24} color="#2563eb" style={{marginRight: '0.5rem'}} />
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0}}>Platform Recommendations</h2>
              </div>
              
              {analytics.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {analytics.slice(0, 4).map((platform, index) => (
                    <div key={index} style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem'}}>
                      <div style={{...styles.flexBetween, marginBottom: '0.5rem'}}>
                        <h3 style={{fontWeight: '500', color: '#111827', margin: 0, textTransform: 'capitalize'}}>{platform.name}</h3>
                        <span style={{
                          ...platform.score >= 80 ? styles.badgeSuccess :
                          platform.score >= 60 ? styles.badgeWarning : styles.badgeError
                        }}>
                          {platform.score?.toFixed(0)}% Match
                        </span>
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem'}}>
                        <div>
                          <span style={{color: '#6b7280'}}>Products:</span>
                          <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.products}</span>
                        </div>
                        <div>
                          <span style={{color: '#6b7280'}}>Competition:</span>
                          <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.competition}</span>
                        </div>
                        <div>
                          <span style={{color: '#6b7280'}}>Avg Rating:</span>
                          <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div>
                          <span style={{color: '#6b7280'}}>Engagement:</span>
                          <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.engagement?.toFixed(1) || 'N/A'}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{...styles.textCenter, padding: '2rem'}}>
                  <BarChart3 size={48} color="#d1d5db" style={{margin: '0 auto 0.75rem'}} />
                  <p style={{color: '#6b7280'}}>Platform analysis will appear here after business setup</p>
                </div>
              )}
            </div>

            {/* Business Insights */}
            <div style={styles.card}>
              <div style={{...styles.flex, marginBottom: '1rem'}}>
                <Target size={24} color="#059669" style={{marginRight: '0.5rem'}} />
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0}}>Growth Insights</h2>
              </div>
              
              {insights.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {insights.slice(0, 3).map((insight, index) => (
                    <div key={index} style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem'}}>
                      <div style={{...styles.flexBetween, marginBottom: '0.5rem'}}>
                        <h3 style={{fontWeight: '500', color: '#111827', margin: 0}}>{insight.data?.title}</h3>
                        <span style={styles.badgeInfo}>
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      
                      {insight.data?.recommendations && (
                        <ul style={{fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0', paddingLeft: '1rem'}}>
                          {insight.data.recommendations.slice(0, 2).map((rec, i) => (
                            <li key={i} style={{marginBottom: '0.25rem'}}>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {insight.data?.action_items && (
                        <ul style={{fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0 0', paddingLeft: '0', listStyle: 'none'}}>
                          {insight.data.action_items.slice(0, 2).map((action, i) => (
                            <li key={i} style={{...styles.flex, marginBottom: '0.25rem'}}>
                              <CheckCircle size={12} color="#059669" style={{marginRight: '0.5rem', marginTop: '0.125rem', flexShrink: 0}} />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{...styles.textCenter, padding: '2rem'}}>
                  <Target size={48} color="#d1d5db" style={{margin: '0 auto 0.75rem'}} />
                  <p style={{color: '#6b7280'}}>Growth insights will appear here after analysis</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{...styles.grid4, marginBottom: '1.5rem'}}>
            <div style={{...styles.cardSmall, ...styles.textCenter}}>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb'}}>{analytics.length}</div>
              <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Platforms Analyzed</div>
            </div>
            <div style={{...styles.cardSmall, ...styles.textCenter}}>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#059669'}}>
                {analytics.find(p => p.score >= 80) ? '✓' : '⏳'}
              </div>
              <div style={{fontSize: '0.875rem', color: '#6b7280'}}>High-Match Platform</div>
            </div>
            <div style={{...styles.cardSmall, ...styles.textCenter}}>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed'}}>{insights.length}</div>
              <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Growth Insights</div>
            </div>
            <div style={{...styles.cardSmall, ...styles.textCenter}}>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c'}}>
                {analytics.reduce((sum, p) => sum + (p.products || 0), 0)}
              </div>
              <div style={{fontSize: '0.875rem', color: '#6b7280'}}>Products Analyzed</div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div style={styles.card}>
            <div style={{...styles.flexBetween, marginBottom: '1.5rem'}}>
              <div style={styles.flex}>
                <PieChart size={24} color="#7c3aed" style={{marginRight: '0.5rem'}} />
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0}}>Detailed Platform Analysis</h2>
              </div>
              <button
                onClick={() => business?.id && loadDashboardData(business.id)}
                disabled={isAnalyzing}
                style={{
                  ...styles.btnPrimary,
                  width: 'auto',
                  opacity: isAnalyzing ? 0.5 : 1,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                }}
                className="btn-primary"
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>

            {analytics.length > 0 ? (
              <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Platform</th>
                      <th style={styles.tableHeader}>Match Score</th>
                      <th style={styles.tableHeader}>Products</th>
                      <th style={styles.tableHeader}>Avg Rating</th>
                      <th style={styles.tableHeader}>Competition</th>
                      <th style={styles.tableHeader}>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((platform, index) => (
                      <tr key={index} style={styles.tableRow} className="table-row">
                        <td style={styles.tableCell}>
                          <div style={styles.flex}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              marginRight: '0.5rem',
                              backgroundColor: 
                                platform.name === 'amazon' ? '#ff9900' :
                                platform.name === 'flipkart' ? '#f0b90b' :
                                platform.name === 'instagram' ? '#e4405f' :
                                platform.name === 'youtube' ? '#ff0000' : '#2563eb'
                            }}></div>
                            <span style={{fontWeight: '500', textTransform: 'capitalize'}}>{platform.name}</span>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...platform.score >= 80 ? styles.badgeSuccess :
                            platform.score >= 60 ? styles.badgeWarning : styles.badgeError
                          }}>
                            {platform.score?.toFixed(0)}%
                          </span>
                        </td>
                        <td style={styles.tableCell}>{platform.products || 0}</td>
                        <td style={styles.tableCell}>
                          {platform.rating ? `${platform.rating.toFixed(1)}/5.0` : 'N/A'}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...platform.competition === 'Low' ? styles.badgeSuccess :
                            platform.competition === 'Medium' ? styles.badgeWarning : styles.badgeError
                          }}>
                            {platform.competition}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          {platform.score >= 80 ? (
                            <span style={{color: '#059669', fontWeight: '500'}}>Highly Recommended</span>
                          ) : platform.score >= 60 ? (
                            <span style={{color: '#d97706', fontWeight: '500'}}>Consider</span>
                          ) : (
                            <span style={{color: '#dc2626', fontWeight: '500'}}>Low Priority</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{...styles.textCenter, padding: '3rem'}}>
                <BarChart3 size={64} color="#d1d5db" style={{margin: '0 auto 1rem'}} />
                <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: '#374151', margin: '0 0 0.5rem 0'}}>No Analytics Data Yet</h3>
                <p style={{color: '#6b7280', margin: '0 0 1rem 0'}}>Click "Refresh Analysis" to start analyzing your market</p>
                <button
                  onClick={() => business?.id && loadDashboardData(business.id)}
                  style={styles.btnPrimary}
                  className="btn-primary"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>

          {/* Growth Tips */}
          {insights.length > 0 && (
            <div style={{...styles.card, marginTop: '1.5rem'}}>
              <div style={{...styles.flex, marginBottom: '1rem'}}>
                <Target size={24} color="#059669" style={{marginRight: '0.5rem'}} />
                <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0}}>Personalized Growth Tips</h2>
              </div>
              
              <div style={styles.grid2}>
                {insights.slice(0, 4).map((insight, index) => (
                  <div key={index} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem',
                    transition: 'box-shadow 0.2s',
                    ':hover': {boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}
                  }}>
                    <div style={{...styles.flexBetween, marginBottom: '0.75rem'}}>
                      <h3 style={{fontWeight: '500', color: '#111827', margin: 0}}>{insight.data?.title}</h3>
                      <span style={styles.badgeInfo}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    
                    {insight.data?.action_items && (
                      <ul style={{margin: 0, paddingLeft: 0, listStyle: 'none'}}>
                        {insight.data.action_items.slice(0, 3).map((action, i) => (
                          <li key={i} style={{...styles.flex, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                            <CheckCircle size={16} color="#10b981" style={{marginRight: '0.5rem', marginTop: '0.125rem', flexShrink: 0}} />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {insight.data?.recommendations && (
                      <ul style={{margin: '0.75rem 0 0 0', paddingLeft: 0, listStyle: 'none'}}>
                        {insight.data.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} style={{...styles.flex, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                            <Target size={16} color="#3b82f6" style={{marginRight: '0.5rem', marginTop: '0.125rem', flexShrink: 0}} />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{...styles.gradientBg, ...styles.flexCenter}}>
      <div style={styles.textCenter}>
        <Loader style={styles.spin} size={48} color="#2563eb" />
        <p style={{color: '#6b7280', marginTop: '1rem'}}>Loading...</p>
      </div>
    </div>
  );
}

export default App;