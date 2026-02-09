import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const cardHover = {
  scale: 1.03,
  transition: {
    duration: 0.2,
    ease: "easeInOut"
  }
};

export function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1 
          className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Secure Your Digital World
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Protect against phishing attacks and ensure code security with our advanced detection tools.
        </motion.p>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          <motion.div
            variants={item}
            whileHover={cardHover}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform-gpu transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Shield className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Phishing Detection
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Advanced AI-powered email analysis to identify and protect against phishing attempts.
              </p>
              <Link
                to="/phishing"
                className="group inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Get Started</span>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            whileHover={cardHover}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transform-gpu transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Code className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Secure Code Review
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Automated code analysis to identify security vulnerabilities and best practices.
              </p>
              <Link
                to="/code-review"
                className="group inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Get Started</span>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}