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
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import BusinessSetupPage from './components/BusinessSetupPage';
import DashboardPage from './components/DashboardPage';


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
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f4f4f5 0%, #e5e7eb 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        fontFamily: 'Inter, Playfair Display, serif, system-ui, sans-serif',
        color: '#22223b'
      }}>
        <Loader style={{animation: 'spin 1s linear infinite'}} size={48} color="#c9ada7" />
        <p style={{color: '#6b7280', marginTop: '1rem', fontSize: '1.1rem'}}>Loading Grogent...</p>
      </div>
    </div>
  );
}

  // Login Page
 if (currentPage === 'login') {
  return (
    <LoginPage
      styles={styles}
      authForm={authForm}
      setAuthForm={setAuthForm}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleLogin={handleLogin}
      success={success}
      errors={errors}
      setCurrentPage={setCurrentPage}
    />
  );
}

  // Register Page
  if (currentPage === 'register') {
  return (
    <RegisterPage
      styles={styles}
      authForm={authForm}
      setAuthForm={setAuthForm}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleRegister={handleRegister}
      errors={errors}
      setCurrentPage={setCurrentPage}
    />
  );
}

  // Business Setup Page
  if (currentPage === 'business-setup') {
  return (
    <BusinessSetupPage
      styles={styles}
      user={user}
      businessForm={businessForm}
      setBusinessForm={setBusinessForm}
      handleBusinessSetup={handleBusinessSetup}
      handleLogout={handleLogout}
      isAnalyzing={isAnalyzing}
      success={success}
      errors={errors}
      setCurrentPage={setCurrentPage}
    />
  );
}

  // Dashboard Page
  if (currentPage === 'dashboard' && business) {
  return (
    <DashboardPage
      styles={styles}
      business={business}
      user={user}
      analytics={analytics}
      insights={insights}
      isAnalyzing={isAnalyzing}
      handleLogout={handleLogout}
      loadDashboardData={loadDashboardData}
      setCurrentPage={setCurrentPage}
    />
  );
}

  return (
    <div style={{...styles.gradientBg, ...styles.flexCenter}}>
     <div style={{
  textAlign: 'center',
  fontFamily: 'Inter, Playfair Display, serif, system-ui, sans-serif',
  color: '#22223b'
}}>
  <Loader style={{animation: 'spin 1s linear infinite'}} size={48} color="#c9ada7" />
  <p style={{color: '#6b7280', marginTop: '1rem', fontSize: '1.1rem'}}>Loading...</p>
</div>
    </div>
  );
}

export default App;