import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Upload, Shield, Link, Globe } from 'lucide-react';
import { analyzeEmail } from '../lib/api';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const resultVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

interface AnalysisResult {
  isPhishing: boolean;
  confidence: number;
  indicators: string[];
  urls?: Array<{ url: string; indicators: string[] }>;
  virusTotalResults?: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
  } | null;
  details?: {
    classifierScore: string;
    indicatorScore: string;
    patternScore: string;
    urlScore: string;
    virusTotalScore: string;
  };
}

export function PhishingDetection() {
  const [emailContent, setEmailContent] = useState('');
  const [result, setResult] = useState<null | AnalysisResult>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailContent.trim()) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const analysisResult = await analyzeEmail(emailContent);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mr-4" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Phishing Email Detection
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Content
              </label>
              <motion.div
                whileTap={{ scale: 0.995 }}
              >
                <textarea
                  id="email-content"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Paste the suspicious email content here..."
                />
              </motion.div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Upload className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isLoading ? 'Analyzing...' : 'Analyze Email'}
              </motion.button>
            </div>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`p-6 rounded-lg shadow-lg ${
                result.isPhishing
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-green-50 dark:bg-green-900/20'
              }`}
            >
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {result.isPhishing ? (
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {result.isPhishing ? 'Potential Phishing Detected' : 'Email Appears Safe'}
                </h2>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Confidence: {Number.isFinite(result.confidence) ? result.confidence.toFixed(2) : '0.00'}%
                </p>
                
                {result.indicators.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 dark:text-white">Suspicious indicators:</p>
                    <ul className="mt-2 space-y-1">
                      {result.indicators.map((indicator, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="text-sm text-gray-600 dark:text-gray-300"
                        >
                          • {indicator}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.urls && result.urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <p className="font-medium text-gray-900 dark:text-white">URL Analysis:</p>
                    </div>
                    {result.urls.map((urlData, index) => (
                      <div key={index} className="mt-2 ml-7 text-sm">
                        <p className="text-gray-700 dark:text-gray-300 font-mono break-all">{urlData.url}</p>
                        {urlData.indicators.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {urlData.indicators.map((indicator, idx) => (
                              <li key={idx} className="text-red-600 dark:text-red-400">
                                ⚠ {indicator}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.virusTotalResults && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      <p className="font-medium text-gray-900 dark:text-white">VirusTotal Scan:</p>
                    </div>
                    <div className="ml-7 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-red-600 dark:text-red-400">
                        Malicious: {result.virusTotalResults.malicious}
                      </div>
                      <div className="text-yellow-600 dark:text-yellow-400">
                        Suspicious: {result.virusTotalResults.suspicious}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        Harmless: {result.virusTotalResults.harmless}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Undetected: {result.virusTotalResults.undetected}
                      </div>
                    </div>
                  </div>
                )}

                {result.details && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Detection Breakdown:</p>
                    <div className="ml-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p>• Classifier Score: {result.details.classifierScore}%</p>
                      <p>• Keyword Indicators: {result.details.indicatorScore}%</p>
                      <p>• Pattern Matching: {result.details.patternScore}%</p>
                      <p>• URL Analysis: {result.details.urlScore}%</p>
                      {result.details.virusTotalScore !== '0.00' && (
                        <p>• VirusTotal: {result.details.virusTotalScore}%</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}