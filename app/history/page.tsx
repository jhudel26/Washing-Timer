'use client';

import { useState, useEffect } from 'react';
import { loadHistory, clearHistory, formatHistoryDate, HistoryEntry } from '@/utils/history';
import { formatDuration } from '@/utils/timer';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setHistory(loadHistory());
    
    // Load dark mode setting
    const settingsData = localStorage.getItem('washing-settings');
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      setDarkMode(settings.darkMode ?? true);
    }
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-b ${darkMode ? 'from-gray-950 via-gray-900 to-gray-950' : 'from-gray-100 via-gray-50 to-gray-100'} ${darkMode ? 'text-white' : 'text-gray-900'} safe-area-bottom`}>
      <div className="container mx-auto px-4 py-4 pt-6 pb-8 max-w-2xl min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold tracking-wider">HISTORY</h1>
          <button
            onClick={() => history.length > 0 && setShowClearConfirm(true)}
            disabled={history.length === 0}
            className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </header>

        {/* History list */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No history yet</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Complete a wash cycle to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{entry.programName}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDuration(entry.duration)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatHistoryDate(entry.completedAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clear confirmation dialog */}
        {showClearConfirm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <div 
              className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 max-w-sm w-full shadow-2xl border`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Clear all history?
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                This will permanently delete all wash history.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`flex-1 px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}