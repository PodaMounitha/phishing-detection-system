import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Code, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '../lib/utils';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const navItemVariants = {
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const logoVariants = {
  initial: { rotate: 0 },
  hover: { 
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

export function Navbar({ theme, toggleTheme }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/phishing', icon: Shield, label: 'Phishing Detection' },
    { path: '/code-review', icon: Code, label: 'Code Review' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 w-full bg-white dark:bg-gray-900 shadow-md z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                variants={logoVariants}
                initial="initial"
                whileHover="hover"
              >
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                SecureGuard
              </motion.span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map(({ path, icon: Icon, label }) => (
                <motion.div
                  key={path}
                  variants={navItemVariants}
                  whileHover="hover"
                >
                  <Link
                    to={path}
                    className={cn(
                      "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === path
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <div className="flex items-center space-x-1">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    {location.pathname === path && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}