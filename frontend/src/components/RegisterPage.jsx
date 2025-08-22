import React from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

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

function RegisterPage({
  styles,
  authForm,
  setAuthForm,
  showPassword,
  setShowPassword,
  handleRegister,
  errors,
  setCurrentPage
}) {
  // Custom chic styles for this page
  const chicStyles = {
    gradientBg: {
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f4f4f5 0%, #e5e7eb 100%)',
      overflow: 'hidden'
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      borderRadius: '1.5rem',
      boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
      border: `1px solid ${accent.border}`,
      padding: '2.5rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden'
    },
    textCenter: {
      textAlign: 'center'
    },
    title: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 700,
      color: accent.text,
      margin: 0
    },
    subtitle: {
      color: accent.subtext,
      fontSize: '1rem',
      margin: '0.5rem 0 0 0'
    },
    formGroup: {
      marginBottom: '1.5rem',
      width: '100%'
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
      width: '100%'
    },
    input: {
      width: '100%',
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
      padding: 0
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
        <div style={{...chicStyles.textCenter, marginBottom: '1.5rem'}}>
          <UserPlus size={40} color={accent.accent} style={{margin: '0 auto 0.75rem'}} />
          <h2 style={{...chicStyles.title, fontSize: '1.5rem'}}>Create Account</h2>
          <p style={chicStyles.subtitle}>Join thousands of growing businesses</p>
        </div>

        {errors.general && (
          <div style={chicStyles.alertError}>
            <p style={{margin: 0, fontSize: '0.875rem'}}>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleRegister} style={{width: '100%'}}>
          <div style={chicStyles.formGroup}>
            <label style={chicStyles.label}>Full Name</label>
            <div style={chicStyles.inputWrap}>
              <input
                type="text"
                value={authForm.full_name}
                onChange={(e) => setAuthForm(prev => ({ ...prev, full_name: e.target.value }))}
                style={chicStyles.input}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

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
                placeholder="Create a password"
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
            {errors.password && (
              <p style={{color: '#ef4444', fontSize: '0.75rem', margin: '0.25rem 0 0 0'}}>{errors.password}</p>
            )}
          </div>

          <div style={chicStyles.formGroup}>
            <label style={chicStyles.label}>Confirm Password</label>
            <div style={chicStyles.inputWrap}>
              <input
                type="password"
                value={authForm.confirmPassword}
                onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                style={chicStyles.input}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <button type="submit" style={chicStyles.btnPrimary} className="btn-primary">
              <UserPlus size={16} />
              Create Account
            </button>
          </div>
        </form>

        <div style={{...chicStyles.textCenter, marginTop: '1.5rem'}}>
          <p style={{color: accent.subtext, marginBottom: '0.5rem'}}>Already have an account?</p>
          <button
            onClick={() => setCurrentPage('login')}
            style={chicStyles.btnLink}
            className="btn-link"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;