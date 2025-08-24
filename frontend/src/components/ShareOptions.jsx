import React from 'react';
// No local CSS import needed, styles are in BizzTools.css

// Helper function to get dimensions for each template
const getTemplateDimensions = (templateType) => {
  switch (templateType) {
    case 'poster':
      return { width: 400, height: 500 };
    case 'businessCard':
      return { width: 300, height: 200 };
    case 'modernEventPoster':
      return { width: 450, height: 600 };
    case 'minimalistBusinessCard':
      return { width: 350, height: 200 };
    case 'vibrantOfferPoster':
      return { width: 400, height: 550 };
    case 'professionalFlyer':
      return { width: 450, height: 650 };
    case 'socialMediaPost':
      return { width: 500, height: 500 };
    case 'eventTicket':
      return { width: 400, height: 250 };
    case 'traditionalIndianBusinessCard':
      return { width: 350, height: 200 };
    case 'productDiscountBanner':
      return { width: 600, height: 250 };
    case 'inspirationalQuoteCard':
      return { width: 400, height: 400 };
    case 'eventInvitationCard':
      return { width: 450, height: 300 };
    case 'productShowcasePost':
      return { width: 500, height: 500 };
    case 'limitedTimeOfferBanner':
      return { width: 700, height: 200 };
    case 'elegantContactCard':
      return { width: 350, height: 200 };
    case 'modernTechBusinessCard':
      return { width: 350, height: 200 };
    case 'minimalistQrCodeCard':
      return { width: 350, height: 200 };
    default:
      return { width: 800, height: 600 };
  }
};

function ShareOptions({ customization, templateType }) {
  const handleDownload = async () => {
    if (!templateType) {
      alert('Please select a template to download.');
      return;
    }

    const { width, height } = getTemplateDimensions(templateType);

    alert('Generating and downloading your design...');
    try {
      const response = await fetch('http://localhost:5000/generate-design-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          design_data: customization,
          template_type: templateType,
          image_width: width,
          image_height: height,
        }),
      });
      const data = await response.json();

      if (response.ok && data.image) {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${data.image}`;
        link.download = `${templateType}_design_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Design downloaded successfully!');
      } else {
        alert(`Failed to generate design for download: ${data.error || 'Unknown error'}`);
        console.error('Backend response for download:', data);
      }
    } catch (error) {
      console.error('Error generating design for download:', error);
      alert('Error generating design for download. Please check the backend server.');
    }
  };

  const handleShare = async (platform) => {
    if (!templateType) {
      alert('Please select a template to share.');
      return;
    }

    const { width, height } = getTemplateDimensions(templateType);

    const shareText = `${customization.text || 'Check out our new design!'} ${customization.subText ? '- ' + customization.subText : ''}`;
    const encodedShareText = encodeURIComponent(shareText);
    let shareUrl = '';

    let imageFile = null;
    try {
      const response = await fetch('http://localhost:5000/generate-design-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_data: customization,
          template_type: templateType,
          image_width: width,
          image_height: height,
        }),
      });
      const imageData = await response.json();

      if (response.ok && imageData.image) {
        const base64Image = imageData.image;
        const byteCharacters = atob(base64Image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        imageFile = new File([blob], `${templateType}_design_${Date.now()}.png`, { type: 'image/png' });
      } else {
        console.error('Failed to generate image for sharing:', imageData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating image for sharing:', error);
    }

    switch (platform) {
      case 'WhatsApp':
        if (navigator.share && imageFile && navigator.canShare({ files: [imageFile], text: shareText })) {
          try {
            alert(
              'Your device\'s native sharing dialog will now open. ' +
              'Please select WhatsApp and **confirm sending the message and image within the WhatsApp application**.'
            );
            await navigator.share({
              files: [imageFile],
              title: 'Grogent Design',
              text: shareText,
            });
            console.log('Shared successfully via Web Share API (user confirmation pending in WhatsApp)');
          } catch (error) {
            console.error('Error sharing via Web Share API:', error);
            alert(
              'Sharing via Web Share API failed or was cancelled. ' +
              'To share the image on WhatsApp, please first click "Download Design" to save the image to your device. ' +
              'Then, open the WhatsApp app and manually attach the downloaded image. ' +
              '\n\n(A new tab will open to share the text message, which you can use alongside the image.)'
            );
            shareUrl = `https://wa.me/?text=${encodedShareText}`;
          }
        } else {
          alert(
            'Your browser does not fully support direct image sharing to WhatsApp. ' +
            'Please first click "Download Design" to save the image to your device. ' +
            'Then, open the WhatsApp app and manually attach the downloaded image. ' +
            '\n\n(A new tab will open to share the text message, which you can use alongside the image.)'
          );
          shareUrl = `https://wa.me/?text=${encodedShareText}`;
        }
        break;
      case 'Facebook':
        alert(`Preparing to share to ${platform}...`);
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedShareText}`;
        break;
      case 'Instagram':
        alert('Instagram sharing from a web browser is highly restricted. Please download the image and share it manually from the Instagram app.');
        console.log(`Attempted to share to Instagram with text: "${decodeURIComponent(encodedShareText)}"`);
        return;
      default:
        alert('Unsupported sharing platform.');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
      console.log(`Opened share dialog for ${platform}`);
    }
  };

  return (
    <div className="share-options-container">
      <h3>Download And Share</h3>
      <button className="share-button download-button" onClick={handleDownload}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        Download Design
      </button>
      <button className="share-button" onClick={() => handleShare('WhatsApp')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L.05 16l4.207-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.601 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.625-2.96 6.584-6.592 6.584zm3.615-4.934c-.195-.099-1.156-.575-1.33-.648-.174-.073-.3-.086-.424.073-.124.16-.48.648-.582.772-.102.123-.2.131-.375.048-.174-.08-.772-.285-1.46-.9-.537-.45-.894-1.076-.996-1.2-.103-.124-.01-.198.075-.262.067-.056.15-.131.225-.196.075-.065.1-.11.15-.185.05-.075.025-.144-.003-.2-.028-.062-.25-.598-.34-.812-.09-.205-.184-.178-.25-.174-.065-.004-.14-.004-.215-.004-.075 0-.195.028-.295.144s-.34.34-.515.829-.16 1.076.084 1.329c.244.252.375.324.62.624.245.3.49.386.744.406.254.02.75.032 1.1-.294.354-.324.49-.448.648-.594.158-.146.25-.272.374-.362.124-.09.244-.144.37-.073s.424.772.48 1.024c.057.252.057.465.013.575-.04.106-.15.198-.295.272z"/>
        </svg>
        Share to WhatsApp
      </button>
      <button className="share-button" onClick={() => handleShare('Facebook')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.5V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
        Share to Facebook
      </button>
      <button className="share-button" onClick={() => handleShare('Instagram')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.916 3.916 0 0 0 .42 2.76C.222 3.269.087 3.85.048 4.703.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.509.198 1.09.333 1.942.372.854.038 1.127.047 3.297.047 2.172 0 2.445-.01 3.298-.048.85-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.37-1.942.039-.853.047-1.127.047-3.297 0-2.172-.01-2.445-.048-3.298-.04-.852-.174-1.433-.372-1.942a3.917 3.917 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.167 1.204-.275 1.486a2.59 2.59 0 0 1-.599.92c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.389-.009-3.232-.047c-.78-.036-1.204-.167-1.485-.276a2.59 2.59 0 0 1-.92-.598 2.59 2.59 0 0 1-.598-.92c-.11-.281-.24-.705-.276-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.167-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.233-.047z"/>
          <path d="M9.405 13.99c-2.602 0-3.041-.018-4.084-.06-.79-.035-1.244-.174-1.465-.267-.37-.14-.676-.314-.92-.559-.24-.245-.413-.55-.559-.92-.093-.22-.232-.675-.267-1.465-.042-1.042-.06-1.482-.06-4.084s.018-3.042.06-4.084c.035-.79.174-1.243.267-1.465.14-.37.314-.676.559-.92.245-.24.55-.413.92-.559.22-.093.675-.232 1.465-.267 1.043-.042 1.482-.06 4.084-.06s3.04.018 4.085.06c.79.035 1.243.174 1.465.267.37.14.676.314.92.559.244.245.417.55.559.92.093.22.232.675.267 1.465.042 1.042.06 1.482.06 4.084s-.018 3.04-.06 4.085c-.035.79-.174 1.243-.267 1.465-.14.37-.314.676-.559.92-.245.244-.55.417-.92.559-.22.093-.675.232-1.465.267-1.043.042-1.482.06-4.085.06zm0-2.886c1.32 0 2.508-.01 3.207-.046.78-.035 1.07-.174 1.21-.23.403-.155.684-.367.95-.633.267-.267.48-.56.633-.95.056-.14.195-.43.23-.78.036-.69.046-1.877.046-3.207 0-1.32-.01-2.508-.046-3.207-.035-.78-.174-1.07-.23-1.21-.155-.403-.367-.684-.633-.95-.267-.267-.56-.48-.95-.633-.14-.056-.43-.195-.78-.23-.69-.036-1.877-.046-3.207-.046s-2.508.01-3.207.046c-.78.035-1.07.174-1.21.23-.403.155-.684.367-.95.633-.267.267-.48.56-.633.95-.056.14-.195.43-.23.78-.036.69-.046 1.877-.046 3.207 0 1.32.01 2.508.046 3.207.035.78.174 1.07.23 1.21.155.403.367.684.633.95.267.267.56.48.95.633.14.056.43.195.78.23.69.036 1.877.046 3.207.046z"/>
          <path d="M12.94 7.346c-.01-.04-.02-.082-.02-.123 0-.09.015-.175.045-.25.03-.075.07-.14.12-.19.05-.05.11-.09.18-.12.07-.03.15-.045.23-.045.09 0 .17.015.24.045.07.03.13.07.18.12.05.05.09.11.12.18.03.07.045.15.045.24 0 .04-.01.08-.02.123-.01.04-.02.08-.04.115-.02.035-.04.06-.07.09-.03.03-.06.05-.09.07-.03.02-.07.03-.11.04-.04.01-.08.01-.12.01-.09 0-.17-.015-.24-.045-.07-.03-.13-.07-.18-.12-.05-.05-.09-.11-.12-.18-.03-.07-.045-.15-.045-.24z"/>
          <path d="M8 10.27c-1.24 0-2.24-.99-2.24-2.24s.99-2.24 2.24-2.24c1.24 0 2.24.99 2.24 2.24s-.99 2.24-2.24 2.24zm0-3.7c-.808 0-1.46.652-1.46 1.46s.652 1.46 1.46 1.46c.808 0 1.46-.652 1.46-1.46s-.652-1.46-1.46-1.46z"/>
        </svg>
        Share to Instagram
      </button>
    </div>
  );
}

export default ShareOptions;
