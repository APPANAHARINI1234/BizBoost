import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import CustomizationPanel from './CustomizationPanel';
// No local CSS import needed, styles are in BizzTools.css

function LeftSidebarTabs({
  onSelectTemplate,
  selectedTemplate,
  customization,
  onUpdateCustomization,
  onUploadLogo,
}) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'customize'

  return (
    <div className="left-sidebar-tabs">
      <div className="tab-buttons">
        <button
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={activeTab === 'customize' ? 'active' : ''}
          onClick={() => setActiveTab('customize')}
        >
          Customize
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'templates' && (
          <TemplateSelector
            onSelectTemplate={(templateId) => {
              onSelectTemplate(templateId);
              setActiveTab('customize'); // Automatically switch to customize after selecting a template
            }}
            selectedTemplate={selectedTemplate}
          />
        )}
        {activeTab === 'customize' && (
          <CustomizationPanel
            customization={customization}
            onUpdateCustomization={onUpdateCustomization}
            onUploadLogo={onUploadLogo}
          />
        )}
      </div>
    </div>
  );
}

export default LeftSidebarTabs;
