import React from 'react';
import { TrendingUp, LogIn, Eye, EyeOff } from 'lucide-react';

// Muted chic palette
const accent = {
  gray: '#f4f4f5',
  border: '#e5e7eb',
  text: '#22223b',
  subtext: '#6b7280',
  accent: '#c9ada7', // muted blush
  btn: '#22223b',
  btnHover: '#c9ada7'
};

function LoginPage({
  authForm,
  setAuthForm,
  showPassword,
  setShowPassword,
  handleLogin,
  success,
  errors,
  setCurrentPage
}) {
  // Chic styles for login
  const chicStyles = {
    gradientBg: {
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f4f4f5 0%, #e5e7eb 100%)',
      padding: '1rem'
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      borderRadius: '1.5rem',
      boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
      border: `1px solid ${accent.border}`,
      padding: '2rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',overflow: 'hidden',
    },
    textCenter: {
      textAlign: 'center'
    },
    title: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 700,
      color: accent.text,
      margin: 0,
      fontSize: '1.5rem'
    },
    subtitle: {
      color: accent.subtext,
      fontSize: '1rem',
      margin: '0.5rem 0 0 0'
    },
    formGroup: {
      marginBottom: '1.5rem',
      width: '100%',
      minWidth: '260px'
    },
    label: {
      fontWeight: 500,
      fontSize: '1rem',
      color: accent.text,
      marginBottom: '0.5rem',
      display: 'block'
    },
    inputWrap: {
      position: 'relative',
      width: '100%',
      minWidth: '260px'
    },
    input: {
      width: '100%',
      minWidth: '260px',
      padding: '1rem',
      borderRadius: '1rem',
      border: `1.5px solid ${accent.border}`,
      fontSize: '1rem',
      background: accent.gray,
      color: accent.text,
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      boxShadow: '0 1px 6px rgba(34,34,35,0.04)'
    },
    eyeBtn: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: accent.subtext,
      padding: 0,
      height: '2rem',
      width: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    btnPrimary: {
      background: accent.btn,
      color: '#fff',
      padding: '0.85rem 2rem',
      border: 'none',
      borderRadius: '999px',
      fontWeight: 600,
      fontSize: '1rem',
      boxShadow: '0 2px 8px rgba(34,34,35,0.10)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.5rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    btnLink: {
      background: 'none',
      border: 'none',
      color: accent.accent,
      fontWeight: 500,
      fontSize: '1rem',
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    alertSuccess: {
      background: accent.gray,
      color: accent.btn,
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
      marginBottom: '1rem',
      fontWeight: 500,
      fontSize: '0.95rem'
    },
    alertError: {
      background: accent.gray,
      color: accent.accent,
      borderRadius: '1rem',
      padding: '0.75rem 1rem',
      marginBottom: '1rem',
      fontWeight: 500,
      fontSize: '0.95rem'
    }
  };

  return (
    <div style={chicStyles.gradientBg}>
      <div style={chicStyles.card}>
        <div style={{...chicStyles.textCenter, marginBottom: '2rem'}}>
          <TrendingUp size={48} color={accent.accent} style={{margin: '0 auto 1rem'}} />
          <h1 style={chicStyles.title}>Grogent</h1>
          <p style={chicStyles.subtitle}>Grow your business with the most helpful agent</p>
        </div>

        {success && (
          <div style={chicStyles.alertSuccess}>
            <p style={{margin: 0, fontSize: '0.875rem'}}>{success}</p>
          </div>
        )}

        {errors.general && (
          <div style={chicStyles.alertError}>
            <p style={{margin: 0, fontSize: '0.875rem'}}>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleLogin} style={{width: '100%'}}>
          <div style={chicStyles.formGroup}>
            <label style={chicStyles.label}>Email</label>
            <div style={chicStyles.inputWrap}>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                style={chicStyles.input}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div style={chicStyles.formGroup}>
            <label style={chicStyles.label}>Password</label>
            <div style={chicStyles.inputWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                style={chicStyles.input}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={chicStyles.eyeBtn}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <button type="submit" style={chicStyles.btnPrimary} className="btn-primary">
              <LogIn size={16} />
              Login
            </button>
          </div>
        </form>

        <div style={{...chicStyles.textCenter, marginTop: '1.5rem'}}>
          <p style={{color: accent.subtext, marginBottom: '0.5rem'}}>Don't have an account?</p>
          <button
            onClick={() => setCurrentPage('register')}
            style={chicStyles.btnLink}
            className="btn-link"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;