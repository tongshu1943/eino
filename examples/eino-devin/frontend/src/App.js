import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
        </Routes>
      </main>
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="container mx-auto px-4">
          <p>© 2025 陈老师（tongshu1943@小红书）</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
