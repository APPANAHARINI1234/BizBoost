import React, { useState } from 'react';
// No local CSS import needed, styles are in BizzTools.css

const fontOptions = ['Inter', 'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];

function CustomizationPanel({ customization, onUpdateCustomization, onUploadLogo }) {
  const [socialPostTopic, setSocialPostTopic] = useState('');
  const [generatingSocialPost, setGeneratingSocialPost] = useState(false);
  const [socialPostError, setSocialPostError] = useState(null);

  // NEW STATE FOR BRAND STYLE GUIDE
  const [brandKeywords, setBrandKeywords] = useState('');
  const [generatingStyleGuide, setGeneratingStyleGuide] = useState(false);
  const [styleGuideError, setStyleGuideError] = useState(null);
  const [generatedTone, setGeneratedTone] = useState('');
  const [suggestedPrimaryColor, setSuggestedPrimaryColor] = useState('');
  const [suggestedSecondaryColor, setSuggestedSecondaryColor] = useState('');
  const [suggestedHeadlineFont, setSuggestedHeadlineFont] = useState('');
  const [suggestedBodyFont, setSuggestedBodyFont] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdateCustomization({ ...customization, [name]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadLogo(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSocialPost = async () => {
    if (!socialPostTopic.trim()) {
      setSocialPostError('Please enter a topic or product/service for the social media post.');
      return;
    }
    setGeneratingSocialPost(true);
    setSocialPostError(null);

    try {
      // Simulate Portia AI generating a social media post
      console.log(`Simulating Portia AI social media post generation for topic: "${socialPostTopic}"`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing delay

      let generatedText = '';
      let generatedSubText = '';
      let generatedHashtags = '';

      if (socialPostTopic.toLowerCase().includes('coffee') || socialPostTopic.toLowerCase().includes('cafe')) {
        generatedText = '☕️ Your Daily Dose of Happiness!';
        generatedSubText = `Start your day right with our freshly brewed coffee and delicious pastries. Perfect for a morning boost or an afternoon treat!`;
        generatedHashtags = '#CoffeeLover #CafeLife #MorningCoffee #FreshlyBrewed #LocalCafe';
      } else if (socialPostTopic.toLowerCase().includes('skincare') || socialPostTopic.toLowerCase().includes('beauty')) {
        generatedText = '✨ Glow Up Your Routine!';
        generatedSubText = `Discover our new line of organic skincare products designed to nourish and revitalize your skin. Feel the difference, naturally!`;
        generatedHashtags = '#SkincareRoutine #OrganicBeauty #HealthySkin #GlowUp #NaturalSkincare';
      } else if (socialPostTopic.toLowerCase().includes('fitness') || socialPostTopic.toLowerCase().includes('gym')) {
        generatedText = '💪 Unleash Your Inner Strength!';
        generatedSubText = `Join our community and achieve your fitness goals with personalized training and state-of-the-art equipment. Your journey starts now!`;
        generatedHashtags = '#FitnessGoals #WorkoutMotivation #GymLife #PersonalTrainer #HealthAndWellness';
      } else {
        generatedText = `🚀 Exciting News from Our Team!`;
        generatedSubText = `We're thrilled to announce something special related to ${socialPostTopic}. Stay tuned for more updates!`;
        generatedHashtags = `#NewProduct #Innovation #SmallBusiness #ExcitingNews #StayTuned`;
      }

      onUpdateCustomization({
        ...customization,
        text: generatedText,
        subText: generatedSubText,
        hashtags: generatedHashtags, // New field for hashtags
      });
      alert('Social media post generated successfully (simulated)!');

    } catch (err) {
      setSocialPostError('Failed to generate social media post. Please try again.');
      console.error('Social media AI error:', err);
    } finally {
      setGeneratingSocialPost(false);
    }
  };

  // NEW FUNCTION FOR BRAND STYLE GUIDE
  const handleGenerateStyleGuide = async () => {
    if (!brandKeywords.trim()) {
      setStyleGuideError('Please enter brand keywords or a business description.');
      return;
    }
    setGeneratingStyleGuide(true);
    setStyleGuideError(null);
    setGeneratedTone('');
    setSuggestedPrimaryColor('');
    setSuggestedSecondaryColor('');
    setSuggestedHeadlineFont('');
    setSuggestedBodyFont('');

    try {
      console.log(`Simulating Portia AI brand style guide generation for keywords: "${brandKeywords}"`);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI processing delay

      let tone = '';
      let primaryColor = '';
      let secondaryColor = '';
      let headlineFont = '';
      let bodyFont = '';

      if (brandKeywords.toLowerCase().includes('eco-friendly') || brandKeywords.toLowerCase().includes('nature')) {
        tone = 'Your brand tone should be organic, trustworthy, and calming. Focus on sustainability and natural elements.';
        primaryColor = '#4CAF50'; // Green
        secondaryColor = '#8BC34A'; // Light Green
        headlineFont = 'Montserrat';
        bodyFont = 'Open Sans';
      } else if (brandKeywords.toLowerCase().includes('tech') || brandKeywords.toLowerCase().includes('modern')) {
        tone = 'Your brand tone should be innovative, sleek, and efficient. Emphasize forward-thinking and professionalism.';
        primaryColor = '#2196F3'; // Blue
        secondaryColor = '#03A9F4'; // Light Blue
        headlineFont = 'Roboto';
        bodyFont = 'Lato';
      } else if (brandKeywords.toLowerCase().includes('luxury') || brandKeywords.toLowerCase().includes('elegant')) {
        tone = 'Your brand tone should be sophisticated, exclusive, and refined. Convey a sense of premium quality and timelessness.';
        primaryColor = '#424242'; // Dark Grey
        secondaryColor = '#BDBDBD'; // Light Grey
        headlineFont = 'Georgia';
        bodyFont = 'Times New Roman';
      } else if (brandKeywords.toLowerCase().includes('playful') || brandKeywords.toLowerCase().includes('fun')) {
        tone = 'Your brand tone should be energetic, friendly, and approachable. Use vibrant language and engaging visuals.';
        primaryColor = '#FFC107'; // Amber
        secondaryColor = '#FFEB3B'; // Yellow
        headlineFont = 'Comic Sans MS'; // Just for fun, can be changed
        bodyFont = 'Verdana';
      }
      else {
        tone = 'Your brand tone should be clear, professional, and approachable. Focus on direct communication and reliability.';
        primaryColor = '#607D8B'; // Blue Grey
        secondaryColor = '#90A4AE'; // Lighter Blue Grey
        headlineFont = 'Inter';
        bodyFont = 'Arial';
      }

      setGeneratedTone(tone);
      setSuggestedPrimaryColor(primaryColor);
      setSuggestedSecondaryColor(secondaryColor);
      setSuggestedHeadlineFont(headlineFont);
      setSuggestedBodyFont(bodyFont);
      alert('AI Brand Style Guide generated successfully (simulated)!');

    } catch (err) {
      setStyleGuideError('Failed to generate brand style guide. Please try again.');
      console.error('Brand Style Guide AI error:', err);
    } finally {
      setGeneratingStyleGuide(false);
    }
  };


  return (
    <div className="customization-panel-content">
      <div className="input-group">
        <label htmlFor="text">Main Text:</label>
        <input
          type="text"
          id="text"
          name="text"
          value={customization.text}
          onChange={handleChange}
          placeholder="Enter your main message"
        />
      </div>
      <div className="input-group">
        <label htmlFor="subText">Sub Text:</label>
        <input
          type="text"
          id="subText"
          name="subText"
          value={customization.subText}
          onChange={handleChange}
          placeholder="Enter additional details"
        />
      </div>
      <div className="input-group">
        <label htmlFor="offerDetails">Offer Details (for posters):</label>
        <textarea
          id="offerDetails"
          name="offerDetails"
          value={customization.offerDetails}
          onChange={handleChange}
          placeholder="e.g., 'Buy One Get One Free!', 'Limited Time Offer'"
          rows="2"
        ></textarea>
      </div>
      <div className="input-group">
        <label htmlFor="subject">Email Subject (for emails):</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={customization.subject}
          onChange={handleChange}
          placeholder="e.g., 'Exclusive Offer Inside!'"
        />
      </div>
      <div className="input-group">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={customization.phoneNumber}
          onChange={handleChange}
          placeholder="e.g., +1 (123) 456-7890"
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Email Address:</label>
        <input
          type="text"
          id="email"
          name="email"
          value={customization.email}
          onChange={handleChange}
          placeholder="e.g., info@example.com"
        />
      </div>
      <div className="input-group">
        <label htmlFor="website">Website URL:</label>
        <input
          type="text"
          id="website"
          name="website"
          value={customization.website}
          onChange={handleChange}
          placeholder="e.g., www.yourwebsite.com"
        />
      </div>
      <div className="input-group">
        <label htmlFor="bgColor">Background Color:</label>
        <input
          type="color"
          id="bgColor"
          name="bgColor"
          value={customization.bgColor}
          onChange={handleChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="textColor">Text Color:</label>
        <input
          type="color"
          id="textColor"
          name="textColor"
          value={customization.textColor}
          onChange={handleChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="fontFamily">Font:</label>
        <select
          id="fontFamily"
          name="fontFamily"
          value={customization.fontFamily}
          onChange={handleChange}
        >
          {fontOptions.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="logoUpload">Upload Logo:</label>
        <input
          type="file"
          id="logoUpload"
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </div>

      {/* AI-Powered Social Media Post Generator (from previous turn) */}
      <div className="ai-social-media-generator-section">
        <h4>Generate Social Media Post with AI</h4>
        <p className="text-secondary">
          Tell Portia AI what your post is about, and it will draft a caption and hashtags.
        </p>
        <div className="input-group">
          <label htmlFor="socialPostTopic">Post Topic / Product:</label>
          <input
            type="text"
            id="socialPostTopic"
            className="scraper-input"
            placeholder="e.g., New summer drink, Eco-friendly soap, Yoga class"
            value={socialPostTopic}
            onChange={(e) => setSocialPostTopic(e.target.value)}
            disabled={generatingSocialPost}
          />
        </div>
        <button
          className="scraper-button"
          onClick={handleGenerateSocialPost}
          disabled={generatingSocialPost}
        >
          {generatingSocialPost ? 'Generating Post...' : 'Generate Social Post'}
        </button>
        {socialPostError && <p className="error-message">{socialPostError}</p>}
        {customization.hashtags && (
          <div className="input-group generated-hashtags-display">
            <label>Generated Hashtags:</label>
            <p>{customization.hashtags}</p>
          </div>
        )}
      </div>

      {/* NEW FEATURE: AI-Powered Brand Style Guide */}
      <div className="ai-brand-style-guide-section">
        <h4>AI Brand Style Guide</h4>
        <p className="text-secondary">
          Describe your business or brand with keywords to get style recommendations.
        </p>
        <div className="input-group">
          <label htmlFor="brandKeywords">Brand Keywords / Description:</label>
          <textarea
            id="brandKeywords"
            className="scraper-input"
            placeholder="e.g., Eco-friendly coffee shop, modern tech startup, luxury fashion brand"
            value={brandKeywords}
            onChange={(e) => setBrandKeywords(e.target.value)}
            disabled={generatingStyleGuide}
            rows="3"
          ></textarea>
        </div>
        <button
          className="scraper-button"
          onClick={handleGenerateStyleGuide}
          disabled={generatingStyleGuide}
        >
          {generatingStyleGuide ? 'Generating Style Guide...' : 'Generate Style Guide'}
        </button>
        {styleGuideError && <p className="error-message">{styleGuideError}</p>}

        {generatedTone && (
          <div className="ai-style-guide-display">
            <h5>Brand Tone:</h5>
            <p className="style-guide-item">{generatedTone}</p>

            <h5>Suggested Colors:</h5>
            <div className="color-suggestions">
              {suggestedPrimaryColor && (
                <div className="color-item">
                  <span className="color-swatch" style={{ backgroundColor: suggestedPrimaryColor }}></span>
                  <span className="color-hex">{suggestedPrimaryColor} (Primary)</span>
                  <button
                    className="apply-button"
                    onClick={() => onUpdateCustomization({ ...customization, bgColor: suggestedPrimaryColor })}
                  >
                    Apply
                  </button>
                </div>
              )}
              {suggestedSecondaryColor && (
                <div className="color-item">
                  <span className="color-swatch" style={{ backgroundColor: suggestedSecondaryColor }}></span>
                  <span className="color-hex">{suggestedSecondaryColor} (Secondary)</span>
                  <button
                    className="apply-button"
                    onClick={() => onUpdateCustomization({ ...customization, textColor: suggestedSecondaryColor })}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <h5>Suggested Fonts:</h5>
            <div className="font-suggestions">
              {suggestedHeadlineFont && (
                <div className="font-item">
                  <span className="font-name" style={{ fontFamily: suggestedHeadlineFont }}>{suggestedHeadlineFont} (Headline)</span>
                  <button
                    className="apply-button"
                    onClick={() => onUpdateCustomization({ ...customization, fontFamily: suggestedHeadlineFont })}
                  >
                    Apply
                  </button>
                </div>
              )}
              {suggestedBodyFont && (
                <div className="font-item">
                  <span className="font-name" style={{ fontFamily: suggestedBodyFont }}>{suggestedBodyFont} (Body)</span>
                  <button
                    className="apply-button"
                    onClick={() => onUpdateCustomization({ ...customization, fontFamily: suggestedBodyFont })}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomizationPanel;
