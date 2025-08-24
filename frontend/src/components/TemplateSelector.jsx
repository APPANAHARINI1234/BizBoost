import React from 'react';
import { FileText } from 'lucide-react'; // Keep FileText if used as a general fallback, otherwise remove

const templates = [
  { id: 'poster', name: 'Basic Poster' },
  { id: 'businessCard', name: 'Business Card' },
  { id: 'modernEventPoster', name: 'Event Poster' },
  { id: 'minimalistBusinessCard', name: 'Minimalist Card' },
  { id: 'vibrantOfferPoster', name: 'Offer Poster' },
  { id: 'professionalFlyer', name: 'Flyer' },
  { id: 'socialMediaPost', name: 'Social Post' },
  { id: 'eventTicket', name: 'Event Ticket' },
  { id: 'traditionalIndianBusinessCard', name: 'Indian Card' },
  { id: 'productDiscountBanner', name: 'Discount Banner' },
  { id: 'inspirationalQuoteCard', name: 'Quote Card' },
  { id: 'eventInvitationCard', name: 'Invitation Card' },
  { id: 'productShowcasePost', name: 'Product Post' },
  { id: 'limitedTimeOfferBanner', name: 'Limited Offer' },
  { id: 'elegantContactCard', name: 'Elegant Card' },
  { id: 'modernTechBusinessCard', name: 'Modern Tech Card' },
  { id: 'minimalistQrCodeCard', name: 'QR Code Card' },
];

function TemplateSelector({ onSelectTemplate, selectedTemplate }) {
  return (
    <div className="template-selector-grid">
      {templates.map((template) => (
        <div
          key={template.id}
          className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
          onClick={() => onSelectTemplate(template.id)}
        >
          {/* Icons removed as per request */}
          <span className="template-card-name">{template.name}</span>
        </div>
      ))}
    </div>
  );
}

export default TemplateSelector;
