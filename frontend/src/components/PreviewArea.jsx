import React from 'react';
// No local CSS import needed, styles are in BizzTools.css

function PreviewArea({ customization, templateType }) {
  // This is a placeholder for your actual template rendering logic.
  // You would dynamically render different components based on `templateType`
  // and pass `customization` as props.

  const renderTemplate = () => {
    if (!templateType) {
      return (
        <div className="no-template-selected">
          <h2>Select a Template to Start Designing</h2>
          <p>Choose from the left sidebar to see your design here.</p>
        </div>
      );
    }

    // Example: Basic rendering based on templateType
    // In a real app, you'd have dedicated components for each template
    switch (templateType) {
      case 'poster':
      case 'modernEventPoster':
      case 'vibrantOfferPoster':
      case 'professionalFlyer':
      case 'socialMediaPost': // Handle social media post specifically
      case 'productDiscountBanner':
      case 'inspirationalQuoteCard':
      case 'eventInvitationCard':
      case 'productShowcasePost':
      case 'limitedTimeOfferBanner':
        return (
          <div
            className="design-preview-card"
            style={{
              backgroundColor: customization.bgColor,
              color: customization.textColor,
              fontFamily: customization.fontFamily,
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {customization.logo && (
              <img
                src={customization.logo}
                alt="Logo"
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  marginBottom: '15px',
                  objectFit: 'contain',
                }}
              />
            )}
            <h1 style={{ fontSize: '2.5em', margin: '10px 0' }}>{customization.text || 'Main Headline'}</h1>
            <p style={{ fontSize: '1.2em', margin: '5px 0' }}>{customization.subText || 'Sub-headline or Tagline'}</p>
            {customization.offerDetails && (
              <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '15px 0', color: 'red' }}>
                {customization.offerDetails}
              </p>
            )}
            {customization.website && <p style={{ fontSize: '1em', margin: '5px 0' }}>{customization.website}</p>}
            {customization.phoneNumber && <p style={{ fontSize: '1em', margin: '5px 0' }}>{customization.phoneNumber}</p>}
            {customization.email && <p style={{ fontSize: '1em', margin: '5px 0' }}>{customization.email}</p>}
            {templateType === 'socialMediaPost' && customization.hashtags && (
              <p style={{ fontSize: '0.9em', margin: '10px 0 0', color: customization.textColor + 'aa' }}>
                {customization.hashtags}
              </p>
            )}
          </div>
        );
      case 'businessCard':
      case 'minimalistBusinessCard':
      case 'traditionalIndianBusinessCard':
      case 'elegantContactCard':
      case 'modernTechBusinessCard':
      case 'minimalistQrCodeCard':
        return (
          <div
            className="design-preview-card business-card"
            style={{
              backgroundColor: customization.bgColor,
              color: customization.textColor,
              fontFamily: customization.fontFamily,
              width: '350px', // Standard business card width
              height: '200px', // Standard business card height
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <div>
              {customization.logo && (
                <img
                  src={customization.logo}
                  alt="Logo"
                  style={{ maxWidth: '80px', maxHeight: '40px', marginBottom: '10px', objectFit: 'contain' }}
                />
              )}
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5em' }}>{customization.text || 'Your Name / Company'}</h2>
              <p style={{ margin: '0', fontSize: '0.9em', color: customization.textColor + 'cc' }}>{customization.subText || 'Your Title / Slogan'}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85em' }}>
              {customization.phoneNumber && <p style={{ margin: '2px 0' }}>📞 {customization.phoneNumber}</p>}
              {customization.email && <p style={{ margin: '2px 0' }}>✉️ {customization.email}</p>}
              {customization.website && <p style={{ margin: '2px 0' }}>🌐 {customization.website}</p>}
            </div>
          </div>
        );
      default:
        return (
          <div className="no-template-selected">
            <h2>Unknown Template Selected</h2>
            <p>Please select a valid template.</p>
          </div>
        );
    }
  };

  return (
    <div className="preview-content">
      {renderTemplate()}
    </div>
  );
}

export default PreviewArea;