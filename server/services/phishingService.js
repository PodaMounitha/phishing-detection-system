import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// VirusTotal API configuration
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const VIRUSTOTAL_API_URL = 'https://www.virustotal.com/api/v3/urls';

// Train the classifier with comprehensive phishing examples
const phishingExamples = [
  'urgent action required verify your account immediately',
  'your account has been suspended click here to restore',
  'confirm your password or account will be closed',
  'you have won a prize claim it now',
  'verify your bank account details urgently',
  'your payment is pending click to confirm',
  'unusual activity detected verify identity now',
  'your package is waiting confirm delivery address',
  'account security alert reset password immediately',
  'congratulations you are a winner click here',
  'limited time offer act now or lose access',
  'your account will be deleted verify now',
  'confirm your social security number',
  'update your billing information immediately',
  'suspicious login attempt verify your identity',
  'your refund is ready click to claim',
  'final notice your account needs verification',
  'security breach detected change password now',
  'you have received a money transfer confirm receipt',
  'your subscription will expire renew now',
];

const legitimateExamples = [
  'meeting scheduled for tomorrow at 2pm',
  'your order has been shipped tracking number',
  'project status update for this week',
  'quarterly report is now available',
  'team lunch on friday please confirm attendance',
  'invoice for your recent purchase',
  'welcome to our newsletter',
  'your appointment is confirmed',
  'thank you for your feedback',
  'monthly summary of your account',
  'new feature announcement',
  'system maintenance scheduled',
  'your request has been processed',
  'here is the document you requested',
  'reminder about upcoming event',
  'weekly team sync notes',
  'your subscription renewal confirmation',
  'product update available',
  'customer satisfaction survey',
  'holiday office hours notification',
];

// Add manual training data
phishingExamples.forEach(example => classifier.addDocument(example, 'phishing'));
legitimateExamples.forEach(example => classifier.addDocument(example, 'legitimate'));

// Load additional training data from SpamAssasin.csv if available
try {
  const csvPath = path.resolve('server/SpamAssasin.csv');
  if (fs.existsSync(csvPath)) {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });

    const spamRecords = records.filter(r => r.Label === '1' && r.Body && r.Body !== 'empty').slice(0, 1000);
    const hamRecords = records.filter(r => r.Label === '0' && r.Body && r.Body !== 'empty').slice(0, 1000);

    spamRecords.forEach(r => classifier.addDocument(r.Body, 'phishing'));
    hamRecords.forEach(r => classifier.addDocument(r.Body, 'legitimate'));

    console.log(`Trained classifier with ${spamRecords.length} spam and ${hamRecords.length} ham examples from SpamAssasin.csv`);
  }
} catch (error) {
  console.error('Error loading training dataset:', error);
}

classifier.train();

// Comprehensive phishing indicators
const PHISHING_INDICATORS = {
  urgency: ['urgent', 'immediately', 'now', 'asap', 'hurry', 'quick', 'fast', 'limited', 'expires', 'deadline'],
  security: ['verify', 'confirm', 'suspend', 'suspended', 'locked', 'security', 'alert', 'breach', 'unauthorized'],
  credentials: ['password', 'username', 'login', 'account', 'credential', 'ssn', 'social security'],
  financial: ['bank', 'payment', 'credit card', 'billing', 'invoice', 'refund', 'money', 'transfer', 'paypal'],
  action: ['click', 'download', 'open', 'update', 'reset', 'change', 'submit', 'enter'],
  rewards: ['prize', 'winner', 'won', 'lottery', 'reward', 'gift', 'free', 'congratulations'],
  threats: ['close', 'delete', 'remove', 'terminate', 'cancel', 'expire', 'lose access'],
};

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /click\s+(here|link|below|now)/i,
  /verify\s+(your|account|identity|information)/i,
  /update\s+(your|account|payment|billing)/i,
  /confirm\s+(your|account|identity|password)/i,
  /suspended?\s+(account|access)/i,
  /unusual\s+activity/i,
  /security\s+(alert|breach|warning)/i,
  /act\s+now/i,
  /limited\s+time/i,
  /final\s+(notice|warning)/i,
];

// Extract URLs from text
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex) || [];
}

// Check if URL looks suspicious
function analyzeUrl(url) {
  const suspiciousIndicators = [];
  try {
    const urlObj = new URL(url);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
      suspiciousIndicators.push('IP address instead of domain name');
    }
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];
    if (suspiciousTlds.some(tld => urlObj.hostname.endsWith(tld))) {
      suspiciousIndicators.push('Suspicious top-level domain');
    }
    const subdomains = urlObj.hostname.split('.');
    if (subdomains.length > 4) {
      suspiciousIndicators.push('Excessive subdomains');
    }
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly'];
    if (shorteners.some(shortener => urlObj.hostname.includes(shortener))) {
      suspiciousIndicators.push('URL shortener detected');
    }
    if (urlObj.hostname.includes('@') || urlObj.hostname.includes('-')) {
      suspiciousIndicators.push('Potentially misleading characters in URL');
    }
  } catch (error) {
    suspiciousIndicators.push('Malformed URL');
  }
  return suspiciousIndicators;
}

// Scan URL with VirusTotal
async function scanUrlWithVirusTotal(url) {
  if (!VIRUSTOTAL_API_KEY) {
    return null;
  }
  try {
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
    const response = await fetch(`${VIRUSTOTAL_API_URL}/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats || {};
    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
    };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}

export async function analyzeEmail(emailContent) {
  const normalized = (emailContent ?? '').toString();
  const trimmed = normalized.trim();

  if (!trimmed) {
    return {
      isPhishing: false,
      confidence: 0,
      indicators: [],
      urls: [],
      virusTotalResults: null,
    };
  }

  const lowerContent = normalized.toLowerCase();

  // 1. Bayes Classifier Analysis
  const classifications = classifier.getClassifications(normalized);

  let classifierScore = 0;
  if (classifications.length > 0) {
    const total = classifications.reduce((acc, c) => acc + c.value, 0);
    const phishing = classifications.find(c => c.label === 'phishing')?.value || 0;
    classifierScore = total > 0 ? phishing / total : 0;
  }

  // 2. Keyword Indicator Analysis
  const foundIndicators = [];
  let indicatorScore = 0;
  Object.entries(PHISHING_INDICATORS).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        foundIndicators.push({ keyword, category });
        indicatorScore += 1;
      }
    });
  });

  // 3. Pattern Matching
  let patternScore = 0;
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(normalized)) {
      patternScore += 1;
    }
  });

  // 4. URL Analysis
  const urls = extractUrls(normalized);
  let urlScore = 0;
  const urlAnalysis = [];
  for (const url of urls) {
    const urlIndicators = analyzeUrl(url);
    if (urlIndicators.length > 0) {
      urlScore += urlIndicators.length;
      urlAnalysis.push({ url, indicators: urlIndicators });
    }
  }

  // 5. VirusTotal Analysis
  let virusTotalResults = null;
  let vtScore = 0;
  if (urls.length > 0 && VIRUSTOTAL_API_KEY) {
    virusTotalResults = await scanUrlWithVirusTotal(urls[0]);
    if (virusTotalResults) {
      const totalDetections = virusTotalResults.malicious + virusTotalResults.suspicious;
      vtScore = totalDetections > 0 ? Math.min(totalDetections / 10, 1) : 0;
    }
  }

  // Calculate overall confidence score
  const normalizedClassifier = classifierScore;
  const normalizedIndicators = Math.min(indicatorScore / 8, 1);
  const normalizedPatterns = Math.min(patternScore / 4, 1);
  const normalizedUrls = Math.min(urlScore / 4, 1);
  const normalizedVT = vtScore;

  const weights = {
    classifier: 0.25,
    indicators: 0.25,
    patterns: 0.20,
    urls: 0.20,
    virusTotal: VIRUSTOTAL_API_KEY ? 0.10 : 0,
  };

  if (!VIRUSTOTAL_API_KEY) {
    weights.indicators += 0.04;
    weights.patterns += 0.03;
    weights.urls += 0.03;
  }

  let confidenceRaw = (
    normalizedClassifier * weights.classifier +
    normalizedIndicators * weights.indicators +
    normalizedPatterns * weights.patterns +
    normalizedUrls * weights.urls +
    normalizedVT * weights.virusTotal
  ) * 100;

  const highScoreMethods = [
    normalizedClassifier > 0.4,
    normalizedIndicators > 0.4,
    normalizedPatterns > 0.4,
    normalizedUrls > 0.4,
    normalizedVT > 0.4
  ].filter(Boolean).length;

  if (highScoreMethods >= 3) {
    confidenceRaw *= 1.15;
  }
  if (normalizedUrls > 0.6 && (normalizedIndicators > 0.3 || normalizedPatterns > 0.3)) {
    confidenceRaw *= 1.1;
  }

  const confidence = Math.min(Math.max(confidenceRaw, 0), 100);
  const isPhishing = confidence > 35;

  return {
    isPhishing,
    confidence: Number.isFinite(confidence) ? confidence : 0,
    indicators: foundIndicators.map(i => `${i.keyword} (${i.category})`),
    urls: urlAnalysis,
    virusTotalResults,
    details: {
      classifierScore: (normalizedClassifier * 100).toFixed(2),
      indicatorScore: (normalizedIndicators * 100).toFixed(2),
      patternScore: (normalizedPatterns * 100).toFixed(2),
      urlScore: (normalizedUrls * 100).toFixed(2),
      virusTotalScore: (normalizedVT * 100).toFixed(2),
    },
  };
}