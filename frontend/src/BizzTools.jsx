import React, { useState } from 'react';
import LeftSidebarTabs from './components/LeftSideBarTasks';
import PreviewArea from './components/PreviewArea';
import ShareOptions from './components/ShareOptions';
import ContentScraper from './components/ContentScraper';
import './BizzTools.css';

// Helper function to get template name by ID
const getTemplateName = (templateId) => {
  const templates = [
    { id: 'poster', name: 'Basic Poster' },
    { id: 'businessCard', name: 'Basic Business Card' },
    { id: 'modernEventPoster', name: 'Modern Event Poster' },
    { id: 'minimalistBusinessCard', name: 'Minimalist Business Card' },
    { id: 'vibrantOfferPoster', name: 'Vibrant Offer Poster' },
    { id: 'professionalFlyer', name: 'Professional Flyer' },
    { id: 'socialMediaPost', name: 'Social Media Post' },
    { id: 'eventTicket', name: 'Event Ticket' },
    { id: 'traditionalIndianBusinessCard', name: 'Traditional Indian Card' },
    { id: 'productDiscountBanner', name: 'Product Discount Banner' },
    { id: 'inspirationalQuoteCard', name: 'Inspirational Quote Card' },
    { id: 'eventInvitationCard', name: 'Event Invitation Card' },
    { id: 'productShowcasePost', name: 'Product Showcase Post' },
    { id: 'limitedTimeOfferBanner', name: 'Limited Time Offer Banner' },
    { id: 'elegantContactCard', name: 'Elegant Contact Card' },
    { id: 'modernTechBusinessCard', name: 'Modern Tech Card' },
    { id: 'minimalistQrCodeCard', name: 'Minimalist QR Card' },
  ];
  const template = templates.find(t => t.id === templateId);
  return template ? template.name : 'Unknown Template';
};

function BizzTools() {
  const [templateType, setTemplateType] = useState(null);
  const [customization, setCustomization] = useState({
    text: '',
    subText: '',
    offerDetails: '',
    subject: '',
    phoneNumber: '',
    email: '',
    website: '',
    bgColor: '#0d1117', // Default to primary-color
    textColor: '#e6edf3', // Default to text-color
    fontFamily: 'Inter',
    logo: null,
    logoPosition: { x: 0, y: 0 },
    hashtags: '', // Hashtags field
  });

  const handleUpdateCustomization = (newCustomization) => {
    setCustomization(newCustomization);
  };

  const handleUploadLogo = (logoBase64) => {
    setCustomization(prev => ({ ...prev, logo: logoBase64 }));
  };

  const handleSelectTemplate = (templateId) => {
    setTemplateType(templateId);
  };

  const handleContentScraped = (scrapedData) => {
    setCustomization(prev => ({
      ...prev,
      text: scrapedData.main_text || prev.text,
      subText: scrapedData.sub_text || prev.subText,
      website: scrapedData.url || prev.website,
    }));
  };

  return (
    <div className="app-container">
      <div className="container main-content">
        {/* Left Sidebar: Template Selection & Customization Tabs */}
        <div className="left-sidebar">
          <LeftSidebarTabs
            onSelectTemplate={handleSelectTemplate}
            selectedTemplate={templateType}
            customization={customization}
            onUpdateCustomization={handleUpdateCustomization}
            onUploadLogo={handleUploadLogo}
          />
        </div>

        {/* Central Area: Design Preview */}
        <div className="preview-area">
          <PreviewArea
            customization={customization}
            templateType={templateType}
            onUpdateCustomization={handleUpdateCustomization}
          />
        </div>

        {/* Right Sidebar: Share Options and Content Scraper */}
        <div className="right-sidebar">
          <ShareOptions customization={customization} templateType={templateType} />
          <ContentScraper onContentScraped={handleContentScraped} />
        </div>
      </div>
    </div>
  );
}

export default BizzTools;