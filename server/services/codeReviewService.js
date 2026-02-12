import esprima from 'esprima';

function analyzeJavaScript(code) {
  const issues = [];
  const lines = code.split('\n');

  try {
    // Parse the code to detect syntax errors
    esprima.parseScript(code, { tolerant: true });

    // Look for common security issues
    lines.forEach((lineText, index) => {
      const lineNum = index + 1;

      if (lineText.includes('eval(')) {
        issues.push({
          severity: 'high',
          message: 'Dangerous use of eval() detected',
          line: lineNum,
        });
      }

      if (lineText.includes('innerHTML')) {
        issues.push({
          severity: 'medium',
          message: 'Potential XSS vulnerability: Use of innerHTML',
          line: lineNum,
        });
      }

      if (lineText.match(/password|secret|key/i) && !lineText.match(/encrypt|hash/i) && lineText.includes('=')) {
        issues.push({
          severity: 'high',
          message: 'Hardcoded sensitive data (password/key) detected',
          line: lineNum,
        });
      }
    });
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
  const lines = code.split('\n');

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    if (lineText.includes('pickle.loads')) {
      issues.push({
        severity: 'high',
        message: 'Unsafe deserialization using pickle',
        line: lineNum,
      });
    }

    if (lineText.includes('subprocess.call') && lineText.includes('shell=True')) {
      issues.push({
        severity: 'high',
        message: 'Command injection vulnerability: shell=True in subprocess',
        line: lineNum,
      });
    }

    if (lineText.match(/^import\s+os$/) || lineText.match(/os\.system\(/)) {
      issues.push({
        severity: 'medium',
        message: 'Direct OS command execution detected',
        line: lineNum,
      });
    }
  });

  return issues;
}

function analyzeJava(code) {
  const issues = [];
  const lines = code.split('\n');

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    if (lineText.includes('Runtime.getRuntime().exec(')) {
      issues.push({
        severity: 'high',
        message: 'Potential command injection via Runtime.exec()',
        line: lineNum,
      });
    }

    if (lineText.includes('Statement') && lineText.includes('.executeQuery(') && lineText.includes('+')) {
      issues.push({
        severity: 'high',
        message: 'Potential SQL injection via string concatenation',
        line: lineNum,
      });
    }
  });

  return issues;
}

function analyzePHP(code) {
  const issues = [];
  const lines = code.split('\n');

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    if (lineText.includes('eval(')) {
      issues.push({
        severity: 'high',
        message: 'Dangerous use of eval() detected',
        line: lineNum,
      });
    }

    if (lineText.includes('$_GET') || lineText.includes('$_POST')) {
      if (lineText.includes('echo') || lineText.includes('print')) {
        issues.push({
          severity: 'medium',
          message: 'Potential XSS: Unfiltered user input printed to page',
          line: lineNum,
        });
      }
    }

    if (lineText.match(/mysql_query\(.*?\$.*?\)/)) {
      issues.push({
        severity: 'high',
        message: 'SQL Injection: Use of variables in raw MySQL query',
        line: lineNum,
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
    case 'java':
      issues = analyzeJava(code);
      break;
    case 'php':
      issues = analyzePHP(code);
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }

  return { issues };
}