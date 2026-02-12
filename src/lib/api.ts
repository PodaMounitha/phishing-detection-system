const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function analyzeEmail(emailContent: string) {
  const response = await fetch(`${API_BASE_URL}/phishing/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailContent }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze email');
  }

  return response.json();
}

export async function analyzeCode(code: string, language: string) {
  const response = await fetch(`${API_BASE_URL}/code-review/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze code');
  }

  return response.json();
}