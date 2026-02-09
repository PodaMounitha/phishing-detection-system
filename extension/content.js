// Add SecureGuard button to email interfaces
function addSecureGuardButton() {
  // For Gmail
  if (window.location.hostname.includes('gmail.com')) {
    const toolbar = document.querySelector('.G-tF');
    if (toolbar && !document.querySelector('.secureguard-btn')) {
      const button = document.createElement('div');
      button.className = 'secureguard-btn T-I J-J5-Ji T-I-ax7';
      button.innerHTML = `
        <img src="${chrome.runtime.getURL('icons/icon16.png')}" 
             style="width: 16px; height: 16px; margin-right: 5px;">
        Analyze for Phishing
      `;
      button.addEventListener('click', analyzeCurrentEmail);
      toolbar.appendChild(button);
    }

    // Add click listeners to email threads
    const emailThreads = document.querySelectorAll('.ae4');
    emailThreads.forEach(thread => {
      if (!thread.dataset.secureguardInitialized) {
        thread.addEventListener('click', handleEmailClick);
        thread.dataset.secureguardInitialized = 'true';
      }
    });
  }
  
  // For Outlook
  if (window.location.hostname.includes('outlook.com')) {
    const toolbar = document.querySelector('._2jR8Yp3W6NKZwJA_VSEy7');
    if (toolbar && !document.querySelector('.secureguard-btn')) {
      const button = document.createElement('button');
      button.className = 'secureguard-btn ms-Button ms-Button--primary';
      button.innerHTML = `
        <img src="${chrome.runtime.getURL('icons/icon16.png')}" 
             style="width: 16px; height: 16px; margin-right: 5px;">
        Analyze for Phishing
      `;
      button.addEventListener('click', analyzeCurrentEmail);
      toolbar.appendChild(button);
    }

    // Add click listeners to email items
    const emailItems = document.querySelectorAll('._1xP-XmXM1GGHpRKCCeOKjP');
    emailItems.forEach(item => {
      if (!item.dataset.secureguardInitialized) {
        item.addEventListener('click', handleEmailClick);
        item.dataset.secureguardInitialized = 'true';
      }
    });
  }
}

async function handleEmailClick(event) {
  const emailContent = getEmailContent();
  if (emailContent) {
    try {
      const result = await analyzeEmail(emailContent);
      showPopup(result);
    } catch (error) {
      console.error('Failed to analyze email:', error);
    }
  }
}

function showPopup(result) {
  // Remove existing popup if any
  removePopup();

  const confidenceText = (typeof result.confidence === 'number' && Number.isFinite(result.confidence))
    ? result.confidence.toFixed(1)
    : '0.0';

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'secureguard-overlay';
  document.body.appendChild(overlay);

  // Create popup
  const popup = document.createElement('div');
  popup.className = `secureguard-popup ${result.isPhishing ? 'warning' : 'safe'}`;
  
  popup.innerHTML = `
    <div class="secureguard-popup-header">
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="SecureGuard">
      <h2 class="secureguard-popup-title">
        ${result.isPhishing ? '⚠️ Warning: Potential Phishing Detected' : '✅ Email Appears Safe'}
      </h2>
    </div>
    <div class="secureguard-popup-content">
      <p>Confidence: ${confidenceText}%</p>
      ${result.indicators.length > 0 ? `
        <div class="secureguard-popup-indicators">
          <strong>Suspicious indicators found:</strong>
          <ul>
            ${result.indicators.map(indicator => `<li>${indicator}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${result.isPhishing ? `
        <p><strong>Recommendation:</strong> Do not click any links or download any attachments from this email.</p>
      ` : ''}
    </div>
    <button class="secureguard-popup-close">Got it</button>
  `;

  document.body.appendChild(popup);

  // Add close handlers
  const closeButton = popup.querySelector('.secureguard-popup-close');
  closeButton.addEventListener('click', removePopup);
  overlay.addEventListener('click', removePopup);
}

function removePopup() {
  const popup = document.querySelector('.secureguard-popup');
  const overlay = document.querySelector('.secureguard-overlay');
  if (popup) popup.remove();
  if (overlay) overlay.remove();
}

async function analyzeEmail(content) {
  const response = await fetch('http://localhost:3001/api/phishing/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailContent: content })
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze email');
  }
  
  return response.json();
}

function getEmailContent() {
  // Gmail-specific selector
  const gmailContent = document.querySelector('.a3s.aiL');
  // Outlook-specific selector
  const outlookContent = document.querySelector('.ReadMsgBody');
  
  return (gmailContent || outlookContent)?.textContent || '';
}

// Watch for dynamic content changes
const observer = new MutationObserver(() => {
  addSecureGuardButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial button addition
addSecureGuardButton();