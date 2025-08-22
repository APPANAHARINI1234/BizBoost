import React from 'react';
import { TrendingUp, BarChart3, PieChart, Target, CheckCircle, Loader, LogOut } from 'lucide-react';

const accent = {
  gray: '#f4f4f5',
  border: '#e5e7eb',
  text: '#22223b',
  subtext: '#6b7280',
  accent: '#c9ada7'
};

function DashboardPage({
  styles,
  business,
  user,
  analytics,
  insights,
  isAnalyzing,
  handleLogout,
  loadDashboardData,
  setCurrentPage
}) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(120deg, #f4f4f5 0%, #e5e7eb 100%)',
      padding: '2rem 0'
    }}>
      <div style={{
        ...styles.container,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1rem'
      }}>
        {/* Header Section */}
        <div
          style={{
            background: '#fff',
            borderRadius: '1.25rem',
            boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
            border: `1px solid ${accent.border}`,
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {business?.logo_url && (
              <img
                src={business.logo_url}
                alt="Business Logo"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${accent.border}`
                }}
              />
            )}
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: accent.text
                }}
              >
                {business?.business_name || 'Your Business'}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', color: accent.subtext, fontSize: '1rem' }}>
                {user?.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: accent.gray,
              color: accent.text,
              padding: '0.85rem 2rem',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 500,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(34,34,35,0.10)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            className="btn-secondary"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Complete Profile Banner */}
        {!business?.profile_complete && (
          <div style={{
            background: 'linear-gradient(90deg,#c9ada720,#f4f4f5 100%)',
            borderRadius: '1.25rem',
            borderLeft: '4px solid #c9ada7',
            padding: '1.25rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <div>
              <h3 style={{margin: 0, color: accent.accent, fontWeight: 600}}>Complete your business profile</h3>
              <p style={{margin: '0.5rem 0 0 0', color: accent.text, fontSize: '0.95rem'}}>
                Fill in more details for smarter recommendations and insights!
              </p>
            </div>
            <button
              style={{
                background: accent.text,
                color: '#fff',
                padding: '0.85rem 2rem',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(34,34,35,0.10)',
                cursor: 'pointer'
              }}
              className="btn-primary"
              onClick={() => setCurrentPage('business-setup')}
            >
              Complete Profile
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div style={{
            background: accent.gray,
            color: accent.accent,
            borderRadius: '1rem',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            fontWeight: 500,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Loader style={{animation: 'spin 1s linear infinite'}} size={24} color={accent.accent} />
            <div style={{marginLeft: '0.75rem'}}>
              <h3 style={{fontWeight: '500', color: accent.accent, margin: '0 0 0.25rem 0'}}>Analyzing Your Market...</h3>
              <p style={{color: accent.accent, fontSize: '0.875rem', margin: 0}}>This may take 1-2 minutes. We're gathering insights from multiple platforms.</p>
            </div>
          </div>
        )}

        {/* Platform Analytics */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem'}}>
          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
            border: `1px solid ${accent.border}`,
            padding: '2rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
              <BarChart3 size={24} color={accent.accent} style={{marginRight: '0.5rem'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: accent.text, margin: 0}}>Platform Recommendations</h2>
            </div>
            {analytics.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {analytics.slice(0, 4).map((platform, index) => (
                  <div key={index} style={{border: `1px solid ${accent.border}`, borderRadius: '8px', padding: '1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <h3 style={{fontWeight: '500', color: accent.text, margin: 0, textTransform: 'capitalize'}}>{platform.name}</h3>
                      <span style={
                        platform.score >= 80 ? styles.badgeSuccess :
                        platform.score >= 60 ? styles.badgeWarning : styles.badgeError
                      }>
                        {platform.score?.toFixed(0)}% Match
                      </span>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem'}}>
                      <div>
                        <span style={{color: accent.subtext}}>Products:</span>
                        <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.products}</span>
                      </div>
                      <div>
                        <span style={{color: accent.subtext}}>Competition:</span>
                        <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.competition}</span>
                      </div>
                      <div>
                        <span style={{color: accent.subtext}}>Avg Rating:</span>
                        <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{color: accent.subtext}}>Engagement:</span>
                        <span style={{marginLeft: '0.25rem', fontWeight: '500'}}>{platform.engagement?.toFixed(1) || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '2rem'}}>
                <BarChart3 size={48} color={accent.border} style={{margin: '0 auto 0.75rem'}} />
                <p style={{color: accent.subtext}}>Platform analysis will appear here after business setup</p>
              </div>
            )}
          </div>

          {/* Business Insights */}
          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
            border: `1px solid ${accent.border}`,
            padding: '2rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
              <Target size={24} color="#059669" style={{marginRight: '0.5rem'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: accent.text, margin: 0}}>Growth Insights</h2>
            </div>
            {insights.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} style={{border: `1px solid ${accent.border}`, borderRadius: '8px', padding: '1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <h3 style={{fontWeight: '500', color: accent.text, margin: 0}}>{insight.data?.title}</h3>
                      <span style={styles.badgeInfo}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    {insight.data?.recommendations && (
                      <ul style={{fontSize: '0.875rem', color: accent.subtext, margin: '0.5rem 0', paddingLeft: '1rem'}}>
                        {insight.data.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} style={{marginBottom: '0.25rem'}}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    )}
                    {insight.data?.action_items && (
                      <ul style={{fontSize: '0.875rem', color: accent.subtext, margin: '0.5rem 0 0 0', paddingLeft: '0', listStyle: 'none'}}>
                        {insight.data.action_items.slice(0, 2).map((action, i) => (
                          <li key={i} style={{display: 'flex', alignItems: 'center', marginBottom: '0.25rem'}}>
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
              <div style={{textAlign: 'center', padding: '2rem'}}>
                <Target size={48} color={accent.border} style={{margin: '0 auto 0.75rem'}} />
                <p style={{color: accent.subtext}}>Growth insights will appear here after analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: accent.gray,
            borderRadius: '1rem',
            textAlign: 'center',
            padding: '1.25rem 0'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#2563eb'}}>{analytics.length}</div>
            <div style={{fontSize: '0.875rem', color: accent.subtext}}>Platforms Analyzed</div>
          </div>
          <div style={{
            background: accent.gray,
            borderRadius: '1rem',
            textAlign: 'center',
            padding: '1.25rem 0'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#059669'}}>
              {analytics.find(p => p.score >= 80) ? '✓' : '⏳'}
            </div>
            <div style={{fontSize: '0.875rem', color: accent.subtext}}>High-Match Platform</div>
          </div>
          <div style={{
            background: accent.gray,
            borderRadius: '1rem',
            textAlign: 'center',
            padding: '1.25rem 0'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed'}}>{insights.length}</div>
            <div style={{fontSize: '0.875rem', color: accent.subtext}}>Growth Insights</div>
          </div>
          <div style={{
            background: accent.gray,
            borderRadius: '1rem',
            textAlign: 'center',
            padding: '1.25rem 0'
          }}>
            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#ea580c'}}>
              {analytics.reduce((sum, p) => sum + (p.products || 0), 0)}
            </div>
            <div style={{fontSize: '0.875rem', color: accent.subtext}}>Products Analyzed</div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div style={{
          background: '#fff',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
          border: `1px solid ${accent.border}`,
          padding: '2rem'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <PieChart size={24} color="#7c3aed" style={{marginRight: '0.5rem'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: accent.text, margin: 0}}>Detailed Platform Analysis</h2>
            </div>
            <button
              onClick={() => business?.id && loadDashboardData(business.id)}
              disabled={isAnalyzing}
              style={{
                background: accent.text,
                color: '#fff',
                padding: '0.85rem 2rem',
                border: 'none',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(34,34,35,0.10)',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing ? 0.5 : 1
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
                        <div style={{display: 'flex', alignItems: 'center'}}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            marginRight: '0.5rem',
                            backgroundColor: 
                              platform.name === 'amazon' ? '#ff9900' :
                              platform.name === 'flipkart' ? '#f0b90b' :
                              platform.name === 'instagram' ? '#e4405f' :
                              platform.name === 'youtube' ? '#ff0000' : accent.accent
                          }}></div>
                          <span style={{fontWeight: '500', textTransform: 'capitalize'}}>{platform.name}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={
                          platform.score >= 80 ? styles.badgeSuccess :
                          platform.score >= 60 ? styles.badgeWarning : styles.badgeError
                        }>
                          {platform.score?.toFixed(0)}%
                        </span>
                      </td>
                      <td style={styles.tableCell}>{platform.products || 0}</td>
                      <td style={styles.tableCell}>
                        {platform.rating ? `${platform.rating.toFixed(1)}/5.0` : 'N/A'}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={
                          platform.competition === 'Low' ? styles.badgeSuccess :
                          platform.competition === 'Medium' ? styles.badgeWarning : styles.badgeError
                        }>
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
            <div style={{textAlign: 'center', padding: '3rem'}}>
              <BarChart3 size={64} color={accent.border} style={{margin: '0 auto 1rem'}} />
              <h3 style={{fontSize: '1.125rem', fontWeight: '500', color: accent.text, margin: '0 0 0.5rem 0'}}>No Analytics Data Yet</h3>
              <p style={{color: accent.subtext, margin: '0 0 1rem 0'}}>Click "Refresh Analysis" to start analyzing your market</p>
              <button
                onClick={() => business?.id && loadDashboardData(business.id)}
                style={{
                  background: accent.text,
                  color: '#fff',
                  padding: '0.85rem 2rem',
                  border: 'none',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(34,34,35,0.10)',
                  cursor: 'pointer'
                }}
                className="btn-primary"
              >
                Start Analysis
              </button>
            </div>
          )}
        </div>

        {/* Growth Tips */}
        {insights.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            boxShadow: '0 8px 32px rgba(34,34,35,0.10)',
            border: `1px solid ${accent.border}`,
            padding: '2rem',
            marginTop: '1.5rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
              <Target size={24} color="#059669" style={{marginRight: '0.5rem'}} />
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', color: accent.text, margin: 0}}>Personalized Growth Tips</h2>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              {insights.slice(0, 4).map((insight, index) => (
                <div key={index} style={{
                  border: `1px solid ${accent.border}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  transition: 'box-shadow 0.2s'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem'}}>
                    <h3 style={{fontWeight: '500', color: accent.text, margin: 0}}>{insight.data?.title}</h3>
                    <span style={styles.badgeInfo}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  {insight.data?.action_items && (
                    <ul style={{margin: 0, paddingLeft: 0, listStyle: 'none'}}>
                      {insight.data.action_items.slice(0, 3).map((action, i) => (
                        <li key={i} style={{display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: accent.subtext, marginBottom: '0.5rem'}}>
                          <CheckCircle size={16} color="#10b981" style={{marginRight: '0.5rem', marginTop: '0.125rem', flexShrink: 0}} />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {insight.data?.recommendations && (
                    <ul style={{margin: '0.75rem 0 0 0', paddingLeft: 0, listStyle: 'none'}}>
                      {insight.data.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} style={{display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: accent.subtext, marginBottom: '0.5rem'}}>
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

export default DashboardPage;