import React from 'react';
import './App.css'; // Import App-specific styles for sections

function HomePageContent() {
  const platforms = [
    "Shopify", "Etsy", "Amazon", "eBay", "WooCommerce", "BigCommerce", "Square", "Wix", "Magento", "Walmart"
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="hero-content">
          <h1 className="hero-title">Empowering Small Businesses with AI</h1>
          <p className="hero-subtitle">
            Grogent provides the insights and automation you need to thrive in the digital marketplace.
          </p>
          <button className="cta-button">Get Started Today</button>
        </div>
      </section>

      {/* Feature Section 1: Market Insights & Platform Identification */}
      <section id="features" className="section section-padding parallax-bg-1">
        <div className="container text-center">
          <h2 className="section-title">Unlock Market Insights with AI</h2>
          <p className="section-subtitle">
            Stop guessing, start growing. Grogent leverages advanced AI to provide you with data-driven decisions.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Platform Identification</h3>
              <p>
                Provide your product details, and Grogent identifies the most suitable platforms for selling.
                We analyze product categories, target audience, and platform policies to give you the best matches.
              </p>
            </div>
            <div className="feature-card">
              <h3>Margin and Sales Analysis</h3>
              <p>
                Get realistic insights into potential profit margins and historical sales data for your products on various platforms.
                We show you how many sales have happened and if it's truly worth your investment.
              </p>
            </div>
            <div className="feature-card">
              <h3>Data-Driven Decisions (Powered by Portia AI)</h3>
              <p>
                Our core strength lies in Portia AI's robust web scraping capabilities. We extract
                realistic, up-to-date information directly from platforms to ensure you have
                the most accurate data for your business strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Marketing Automation & Customization */}
      <section className="section section-padding">
        <div className="container text-center">
          <h2 className="section-title">Automate Your Marketing & Reach Customers</h2>
          <p className="section-subtitle">
            Create stunning marketing materials and automate your outreach with ease.
          </p>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Custom Business Assets</h3>
              <p>
                Easily customize professional business posters and cards. Design them to match your brand
                and download them instantly for print or digital use.
              </p>
            </div>
            <div className="feature-card">
              <h3>Seamless Sharing and Automation Powered by Portia AI</h3>
              <p>
                Share your customized assets directly to WhatsApp, Facebook, and Instagram.
                Portia AI enables intelligent automation, allowing you to schedule and
                even prompt users to send personalized intro messages to their customers,
                maximizing your reach with minimal effort.
              </p>
            </div>
            <div className="feature-card">
              <h3>Engage Your Audience</h3>
              <p>
                Activate automation sequences to engage your customers with timely messages and promotions,
                building stronger relationships and driving repeat business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Powered by Portia AI Section */}
      <section id="portia" className="section section-padding portia-section parallax-bg-2">
        <div className="container text-center">
          <h2 className="section-title">Grogent is Powered by Portia AI</h2>
          <p className="section-subtitle">
            Portia's advanced Model Context Protocol  is the engine behind Grogent's powerful
            data scraping, market analysis, and intelligent marketing automation capabilities.
            We leverage Portia to bring you unparalleled accuracy and efficiency.
          </p>
          {/* Placeholder for Portia Logo */}
          
        </div>
      </section>

      {/* Integrated Platforms Section */}
      <section id="platforms" className="section section-padding parallax-bg-3">
        <div className="container text-center">
          <h2 className="section-title">Platforms We Integrate With</h2>
          <p className="section-subtitle">
            Grogent connects with the leading e-commerce platforms to give you a comprehensive view of the market.
          </p>
          <div className="platform-logos-container">
            {platforms.map((platform, index) => (
              <div key={index} className="platform-logo">
                {platform}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </>
  );
}

export default HomePageContent;