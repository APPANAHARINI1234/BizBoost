import React from 'react';
import Modal from './Modal';
import CustomizationPanel from './CustomizationPanel';
// No local CSS import needed, styles are in BizzTools.css

function CustomizationModal({
  isOpen,
  onClose,
  customization,
  onUpdateCustomization,
  onUploadLogo,
  selectedTemplateName,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize: ${selectedTemplateName || 'No Template Selected'}`}
    >
      <CustomizationPanel
        customization={customization}
        onUpdateCustomization={onUpdateCustomization}
        onUploadLogo={onUploadLogo}
      />
      <div className="modal-footer">
        <button onClick={onClose} className="modal-done-button">Done</button>
      </div>
    </Modal>
  );
}

export default CustomizationModal;
