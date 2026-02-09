import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Upload } from 'lucide-react';

export function CodeReview() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<null | {
    issues: Array<{ severity: 'high' | 'medium' | 'low'; message: string; line: number }>;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    // Mockup response for now
    setResult({
      issues: [
        { severity: 'high', message: 'Potential SQL injection vulnerability', line: 12 },
        { severity: 'medium', message: 'Insecure password hashing', line: 25 },
        { severity: 'low', message: 'Missing input validation', line: 8 },
      ],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Secure Code Review
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Programming Language
              </label>
              <select
                id="language"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
              </select>
            </div>

            <div className="mb-6">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Source Code
              </label>
              <textarea
                id="code"
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
              />
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Analyze Code
              </motion.button>
            </div>
          </form>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Analysis Results
            </h2>
            <div className="space-y-4">
              {result.issues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    issue.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : issue.severity === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        issue.severity === 'high'
                          ? 'text-red-600 dark:text-red-400'
                          : issue.severity === 'medium'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Line {issue.line}: {issue.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        Severity: {issue.severity}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}