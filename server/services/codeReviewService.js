import esprima from 'esprima';
import eslint from 'eslint';

const securityRules = {
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'security/detect-object-injection': 'warn',
  'security/detect-non-literal-regexp': 'warn',
  'security/detect-unsafe-regex': 'warn',
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'warn',
  'security/detect-disable-mustache-escape': 'error',
  'security/detect-new-buffer': 'warn',
  'security/detect-no-csrf-before-method-override': 'error',
  'security/detect-pseudo-random-bytes': 'warn',
  'security/detect-possible-timing-attacks': 'warn',
};

function analyzeJavaScript(code) {
  const issues = [];
  
  try {
    // Parse the code to detect syntax errors
    esprima.parseScript(code, { tolerant: true });
    
    // Look for common security issues
    if (code.includes('eval(')) {
      issues.push({
        severity: 'high',
        message: 'Dangerous use of eval() detected',
        line: code.split('\n').findIndex(line => line.includes('eval(')),
      });
    }
    
    if (code.includes('innerHTML')) {
      issues.push({
        severity: 'medium',
        message: 'Potential XSS vulnerability: Use of innerHTML',
        line: code.split('\n').findIndex(line => line.includes('innerHTML')),
      });
    }
    
    if (code.match(/password|secret|key/i) && !code.match(/encrypt|hash/i)) {
      issues.push({
        severity: 'high',
        message: 'Sensitive data might be handled insecurely',
        line: code.split('\n').findIndex(line => line.match(/password|secret|key/i)),
      });
    }
  } catch (error) {
    issues.push({
      severity: 'high',
      message: `Syntax error: ${error.message}`,
      line: error.lineNumber || 1,
    });
  }
  
  return issues;
}

function analyzePython(code) {
  const issues = [];
  
  // Basic pattern matching for common Python security issues
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('pickle.loads')) {
      issues.push({
        severity: 'high',
        message: 'Unsafe deserialization using pickle',
        line: index + 1,
      });
    }
    
    if (line.includes('subprocess.call') && line.includes('shell=True')) {
      issues.push({
        severity: 'high',
        message: 'Command injection vulnerability: shell=True in subprocess',
        line: index + 1,
      });
    }
    
    if (line.match(/^import\s+os$/)) {
      issues.push({
        severity: 'medium',
        message: 'Direct OS command execution possible',
        line: index + 1,
      });
    }
  });
  
  return issues;
}

export async function analyzeCode(code, language) {
  let issues = [];
  
  switch (language.toLowerCase()) {
    case 'javascript':
      issues = analyzeJavaScript(code);
      break;
    case 'python':
      issues = analyzePython(code);
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
  
  return { issues };
}