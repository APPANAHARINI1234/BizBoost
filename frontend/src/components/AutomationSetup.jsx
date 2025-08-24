import React, { useState } from 'react';

function AutomationSetup({ customization }) {
  const [platform, setPlatform] = useState('WhatsApp');
  const [customers, setCustomers] = useState('');
  const [emailSubject, setEmailSubject] = useState(''); // New state for email subject
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [loadingGemini, setLoadingGemini] = useState(false);

  const handleScheduleAutomation = async () => {
    const scheduleDateTime = `${scheduleDate}T${scheduleTime}:00`;
    const automationData = {
      platform,
      customers: customers.split(',').map(c => c.trim()),
      message,
      schedule: scheduleDateTime,
      design_data: {
        ...customization,
        subject: emailSubject, // Include subject in design_data for email
      },
    };

    console.log('Scheduling automation:', automationData);
    try {
      const response = await fetch('http://localhost:5000/schedule-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(automationData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Automation scheduled successfully!');
        console.log('Backend response:', data);
      } else {
        alert(`Failed to schedule automation: ${data.error}`);
      }
    } catch (error) {
      console.error('Error scheduling automation:', error);
      alert('Error scheduling automation. Please check the backend server.');
    }
  };

  const handleGenerateMessage = async () => {
    setLoadingGemini(true);
    setGeminiResponse('');
    try {
      const prompt = `Generate a short, engaging marketing message for a business poster/card with the following details: Main Text: "${customization.text}", Sub Text: "${customization.subText}". The message should be suitable for sharing on social media.`;
      const response = await fetch('http://localhost:5000/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeminiResponse(data.text);
        setMessage(data.text); // Pre-fill message with generated text
      } else {
        alert(`Failed to generate message: ${data.error}`);
      }
    } catch (error) {
      console.error('Error generating message with Gemini:', error);
      alert('Error generating message. Please check the backend server and Gemini API key.');
    } finally {
      setLoadingGemini(false);
    }
  };

  return (
    <div className="automation-panel panel">
      <h2>Automation Workflow</h2>
      <div className="automation-form">
        <div>
          <label htmlFor="platform">Platform:</label>
          <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Email">Email</option> {/* New Email option */}
          </select>
        </div>
        <div>
          <label htmlFor="customers">Recipient List (comma-separated):</label>
          <input
            type="text"
            id="customers"
            value={customers}
            onChange={(e) => setCustomers(e.target.value)}
            placeholder={platform === 'Email' ? 'email1@example.com, email2@example.com' : 'customer1@example.com, +1234567890'}
          />
        </div>
        {platform === 'Email' && ( // Conditionally render email subject
          <div>
            <label htmlFor="emailSubject">Email Subject:</label>
            <input
              type="text"
              id="emailSubject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Your email subject"
            />
          </div>
        )}
        <div>
          <label htmlFor="message">Intro Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={platform === 'Email' ? 'Your email body...' : 'Your intro message for the post...'}
            rows="4"
          ></textarea>
          <button onClick={handleGenerateMessage} disabled={loadingGemini}>
            {loadingGemini ? 'Generating...' : 'Generate Message with Gemini AI'}\n          </button>
          {geminiResponse && <p style={{ fontSize: '0.9em', color: '#555', marginTop: '10px' }}>Generated: {geminiResponse}</p>}
        </div>
        <div>
          <label htmlFor="scheduleDate">Schedule Date:</label>
          <input
            type="date"
            id="scheduleDate"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="scheduleTime">Schedule Time:</label>
          <input
            type="time"
            id="scheduleTime"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
          />
        </div>
        <button onClick={handleScheduleAutomation}>Schedule Automatic Sharing</button>
      </div>
    </div>
  );
}

export default AutomationSetup;
