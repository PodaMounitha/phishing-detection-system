const API_URL = 'http://localhost:3001/api';

document.addEventListener('DOMContentLoaded', async () => {
  const emailAnalysis = document.getElementById('emailAnalysis');
  const emailResult = document.getElementById('emailResult');
  const codeAnalysis = document.getElementById('codeAnalysis');
  const languageSelect = document.getElementById('language');
  const codeInput = document.getElementById('codeInput');
  const analyzeCodeBtn = document.getElementById('analyzeCode');
  const codeResult = document.getElementById('codeResult');

  // Check if we're on an email page
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    if (tab.url.includes('gmail.com') || tab.url.includes('outlook.com')) {
      emailAnalysis.classList.remove('hidden');
      
      // Get selected email content from the page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getEmailContent,
      }, async (results) => {
        if (results && results[0].result) {
          const result = await analyzeEmail(results[0].result);
          displayEmailResult(result);
        }
      });
    }
  });

  // Show code analysis by default
  codeAnalysis.classList.remove('hidden');

  analyzeCodeBtn.addEventListener('click', async () => {
    const code = codeInput.value;
    const language = languageSelect.value;
    
    if (!code) return;

    try {
      const result = await analyzeCode(code, language);
      displayCodeResult(result);
    } catch (error) {
      codeResult.innerHTML = `
        <div class="p-3 bg-red-100 text-red-700 rounded">
          Error: ${error.message}
        </div>
      `;
    }
  });
});

function getEmailContent() {
  // Gmail-specific selector
  const gmailContent = document.querySelector('.a3s.aiL');
  // Outlook-specific selector
  const outlookContent = document.querySelector('.ReadMsgBody');
  
  return (gmailContent || outlookContent)?.textContent || '';
}

async function analyzeEmail(content) {
  const response = await fetch(`${API_URL}/phishing/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailContent: content }),
  });
  
  return response.json();
}

async function analyzeCode(code, language) {
  const response = await fetch(`${API_URL}/code-review/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  
  return response.json();
}

function displayEmailResult(result) {
  const { isPhishing, confidence, indicators } = result;
  const confidenceText = (typeof confidence === 'number' && Number.isFinite(confidence))
    ? confidence.toFixed(1)
    : '0.0';
  
  emailResult.innerHTML = `
    <div class="p-3 ${isPhishing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded">
      <p class="font-semibold">${isPhishing ? 'Potential Phishing Detected' : 'Email Appears Safe'}</p>
      <p class="text-sm mt-1">Confidence: ${confidenceText}%</p>
      ${indicators.length > 0 ? `
        <div class="mt-2 text-sm">
          <p class="font-medium">Suspicious indicators:</p>
          <ul class="list-disc list-inside">
            ${indicators.map(indicator => `<li>${indicator}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

function displayCodeResult(result) {
  const { issues } = result;
  
  if (issues.length === 0) {
    codeResult.innerHTML = `
      <div class="p-3 bg-green-100 text-green-700 rounded">
        No security issues found.
      </div>
    `;
    return;
  }

  codeResult.innerHTML = `
    <div class="space-y-2">
      ${issues.map(issue => `
        <div class="p-3 rounded ${
          issue.severity === 'high' ? 'bg-red-100 text-red-700' :
          issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }">
          <p class="font-medium">Line ${issue.line}: ${issue.message}</p>
          <p class="text-sm mt-1">Severity: ${issue.severity}</p>
        </div>
      `).join('')}
    </div>
  `;
}