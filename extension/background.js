chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_EMAIL') {
    analyzeEmail(message.content)
      .then(result => {
        const confidenceText = (typeof result.confidence === 'number' && Number.isFinite(result.confidence))
          ? result.confidence.toFixed(1)
          : '0.0';
        // Show result in a notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: result.isPhishing ? 'Warning: Potential Phishing Detected' : 'Email Analysis Complete',
          message: `Confidence: ${confidenceText}%\n${
            result.indicators.length > 0 
              ? `Suspicious indicators found: ${result.indicators.join(', ')}`
              : 'No suspicious indicators found.'
          }`
        });
      })
      .catch(error => {
        console.error('Analysis failed:', error);
      });
  }
  return true;
});

async function analyzeEmail(content) {
  const response = await fetch('http://localhost:3001/api/phishing/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailContent: content })
  });
  
  return response.json();
}