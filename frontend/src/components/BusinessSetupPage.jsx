import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader, CheckCircle } from 'lucide-react';

const accent = {
  gray: '#f4f4f5',
  border: '#e5e7eb',
  text: '#22223b',
  subtext: '#6b7280',
  accent: '#c9ada7', 
  btn: '#22223b',
  btnHover: '#c9ada7'
};

const questions = [
  {
    key: 'business_name',
    label: 'What is your business name?',
    type: 'text',
    placeholder: 'e.g., Atelier & Co.',
    required: true
  },
  {
    key: 'industry',
    label: 'Which industry/category does your business belong to?',
    type: 'select',
    options: [
      'Food & Beverages', 'Fashion', 'Digital Services', 'Beauty', 'Fitness', 'Education', 'Automotive', 'Home & Living', 'Other'
    ],
    required: true
  },
  {
    key: 'description',
    label: 'Briefly describe your products/services.',
    type: 'text',
    placeholder: 'e.g., Vegan bakery, handmade jewelry, etc.',
    required: false
  },
  {
    key: 'business_model',
    label: 'What is your business model?',
    type: 'select',
    options: ['B2B', 'B2C', 'D2C', 'Local Store', 'Online-only', 'Hybrid'],
    required: false
  },
  {
    key: 'target_audience',
    label: 'Describe your target audience demographics (age, gender, region, interests). Leave blank to let AI infer.',
    type: 'text',
    placeholder: 'e.g., 18-35, women, Mumbai, fitness lovers',
    required: false
  },
  { key: 'target_geography',
    label: 'What is your target geography?',
    type: 'select',
    options: ['Local', 'National', 'Global'],
    required: false
  },
  {
    key: 'price_range',
    label: 'What is your price range?',
    type: 'select',
    options: ['Budget', 'Mid-range', 'Premium'],
    required: false
  },
  {key: 'acquisition_channels',
    label: 'Current customer acquisition channels (select all that apply):',
    type: 'checkbox-group',
    options: ['Walk-ins', 'Referrals', 'Instagram', 'Word of Mouth', 'Facebook', 'Website', 'Other'],
    required: false
  },
  {
    key: 'existing_platforms',
    label: 'Existing platforms (handles/links):',
    type: 'text',
    placeholder: 'e.g., @atelierco on Instagram, website.com, WhatsApp: 9876543210',
    required: false
  },
  {
    key: 'follower_base',
    label: 'Current follower base / email list (rough numbers):',
    type: 'text',
    placeholder: 'e.g., 1200 Instagram followers, 300 emails',
    required: false
  },
  {
    key: 'branding_assets',
    label: 'Branding assets (logo, colors, tagline, tone of voice):',
    type: 'text',placeholder: 'e.g., pastel logo, tagline: "Handcrafted for you", friendly tone',
    required: false
  },
  {
    key: 'primary_goal',
    label: 'Primary business goal:',
    type: 'select',
    options: ['Increase Sales', 'Brand Awareness', 'Customer Loyalty', 'Generate Leads'],
    required: false
  },
  {
    key: 'ad_budget',
    label: 'Budget for ads:',
    type: 'select',
    options: ['Low', 'Medium', 'High'],
    required: false
  },
  {
    key: 'communication_style',
    label: 'Preferred style of communication:',
    type: 'select',
    options: ['Casual', 'Professional', 'Trendy', 'Community-driven'],
    required: false
  },{
    key: 'restrictions',
    label: 'Any hard restrictions?',
    type: 'text',
    placeholder: 'e.g., can’t run ads, only local delivery',
    required: false
  }
];

function BusinessSetupPage({
  styles,
  businessForm,
  setBusinessForm,
  handleBusinessSetup,
  isAnalyzing,
  success,
  errors,
  setCurrentPage
}) {
  const [step, setStep] = useState(0);

  const current = questions[step];
  const total = questions.length;

  const handleChange = (e) => {
    setBusinessForm(prev => ({
      ...prev,
      [current.key]: e.target.value
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, total - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    handleBusinessSetup(e);
  };

  // Commanding chic styles
  const chicStyles = {
    gradientBg: {
      minHeight: '100vh',
      background: accent.gray,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    card: {
      maxWidth: 600,
      width: '100%',
      padding: '3.5rem 3rem 2.5rem 3rem',
      borderRadius: '2rem',
      background: '#fff',
      boxShadow: '0 8px 48px rgba(34,34,35,0.12)',
      border: `1px solid ${accent.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    progressBar: {
      height: 8,
      background: accent.gray,
      borderRadius: 4,
      marginBottom: '2.5rem',
      overflow: 'hidden',
      width: '100%'
    },
    progress: {
      height: '100%',
      background: accent.accent,
      transition: 'width 0.3s'
    },
    label: {
      fontWeight: 600,
      fontSize: '1.35rem',
      color: accent.text,
      marginBottom: '1.25rem',
      letterSpacing: '0.01em',
      textAlign: 'center'
    },
    input: {
      width: '85%',
      padding: '1.25rem 1.25rem',
      borderRadius: '1.1rem',
      border: `1.5px solid ${accent.border}`,
      fontSize: '1.15rem',
      background: accent.gray,
       marginTop: '2.5rem',
      marginBottom: '2.5rem',
      outline: 'none',
      color: accent.text,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 12px rgba(34,34,35,0.04)'
    },
    inputFocus: {
      borderColor: accent.accent,
      boxShadow: `0 0 0 3px ${accent.accent}33`
    },
    select: {
      width: '100%',
      padding: '1.25rem 1.25rem',
      borderRadius: '1.1rem',
      border: `1.5px solid ${accent.border}`,
      fontSize: '1.15rem',
      background: accent.gray,
      marginBottom: '2.5rem',
      outline: 'none',
      color: accent.text,
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 12px rgba(34,34,35,0.04)'
    },
    btnPrimary: {
      background: accent.btn,
      color: '#fff',
      padding: '1rem 2.5rem',
      border: 'none',
      borderRadius: '999px',
      fontWeight: 600,
      fontSize: '1.15rem',
      boxShadow: '0 2px 12px rgba(34,34,35,0.10)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'background 0.2s'
    },
    btnSecondary: {
      background: accent.gray,
      color: accent.text,
      padding: '1rem 2.5rem',
      border: 'none',
      borderRadius: '999px',
      fontWeight: 500,
      fontSize: '1.15rem',
      cursor: 'pointer',
      boxShadow: '0 1px 6px rgba(34,34,35,0.04)'
    },
    btnSuccess: {
      background: accent.accent,
      color: accent.text,
      padding: '1rem 2.5rem',
      border: 'none',
      borderRadius: '999px',
      fontWeight: 600,
      fontSize: '1.15rem',
      cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(201,173,167,0.10)'
    },
    alertError: {
      background: accent.gray,
      color: accent.accent,
      borderRadius: '1rem',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      fontWeight: 500,
      fontSize: '1.1rem'
    },
    alertSuccess: {
      background: accent.gray,
      color: accent.accent,
      borderRadius: '1rem',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
      fontWeight: 500,
      fontSize: '1.1rem',
      display: 'flex',
      alignItems: 'center'
    },
    textCenter: {
      textAlign: 'center'
    }
  };

  // For focus effect
  const [focusField, setFocusField] = useState('');

  return (
    <div style={chicStyles.gradientBg}>
      <div style={chicStyles.card}>
        {/* Progress Bar */}
        <div style={chicStyles.progressBar}>
          <div style={{
            ...chicStyles.progress,
            width: `${((step + 1) / total) * 100}%`
          }} />
        </div>

        {/* Question */}
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <label style={chicStyles.label}>{current.label}</label>
          {current.type === 'text' && (
            <input
              type="text"
              value={businessForm[current.key] || ''}
              onChange={handleChange}
              style={{
                ...chicStyles.input,
                ...(focusField === current.key ? chicStyles.inputFocus : {})
              }}
              placeholder={current.placeholder}
              required={current.required}
              onFocus={() => setFocusField(current.key)}
              onBlur={() => setFocusField('')}
            />
          )}
          {current.type === 'select' && (
            <select
              value={businessForm[current.key] || ''}
              onChange={handleChange}
              style={{
                ...chicStyles.select,
                ...(focusField === current.key ? chicStyles.inputFocus : {})
              }}
              required={current.required}
              onFocus={() => setFocusField(current.key)}
              onBlur={() => setFocusField('')}
            >
              <option value="">Select</option>
              {current.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* Error/Success */}
          {errors.general && (
            <div style={chicStyles.alertError}>
              {errors.general}
            </div>
          )}
          {success && (
            <div style={chicStyles.alertSuccess}>
              <CheckCircle size={20} style={{marginRight: 12}} />
              {success}
            </div>
          )}

          {/* Navigation */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem'}}>
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              style={{
                ...chicStyles.btnSecondary,
                opacity: step === 0 ? 0.5 : 1,
                cursor: step === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ArrowLeft size={18} />   Back
            </button>
            {step < total - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                style={chicStyles.btnPrimary}
                className="btn-primary"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isAnalyzing}
                style={{
                  ...chicStyles.btnSuccess,
                  opacity: isAnalyzing ? 0.5 : 1,
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer'
                }}
                className="btn-success"
              >
                {isAnalyzing ? (
                  <>
                    <Loader style={{animation: 'spin 1s linear infinite'}} size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Finish
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div style={{...chicStyles.textCenter, marginTop: '2.5rem'}}>
          <button
            onClick={() => setCurrentPage('login')}
            style={{
              background: 'none',
              border: 'none',
              color: accent.subtext,
              fontWeight: 500,
              textAlign: 'center',
              fontSize: '1.1rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            className="btn-link"
          >
            ←   Back to Login
          </button>
        </div>

        {current.type === 'checkbox-group' && (
  <div style={{marginBottom: '2.5rem', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
    {current.options.map(opt => (
      <label key={opt} style={{display: 'flex', alignItems: 'center', fontSize: '1.05rem', color: accent.text}}>
        <input
          type="checkbox"
          checked={Array.isArray(businessForm[current.key]) ? businessForm[current.key].includes(opt) : false}
          onChange={e => {
            setBusinessForm(prev => {
              const arr = Array.isArray(prev[current.key]) ? prev[current.key] : [];
              return {
                ...prev,
                [current.key]: e.target.checked
                  ? [...arr, opt]
                  : arr.filter(x => x !== opt)
              };
            });
          }}
          style={{marginRight: '0.5rem'}}
        />
        {opt}
      </label>
    ))}
  </div>
)}
      </div>
    </div>
  );
}

export default BusinessSetupPage;