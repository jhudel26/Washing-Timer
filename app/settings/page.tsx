'use client';

import { useState, useEffect } from 'react';
import { soundManager } from '@/utils/sound';
import Link from 'next/link';

type Settings = {
  notifications: boolean;
  sound: boolean;
  haptic: boolean;
  darkMode: boolean;
  defaultProgram: string;
};

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  sound: true,
  haptic: true,
  darkMode: true,
  defaultProgram: 'cotton',
};

const SETTINGS_STORAGE_KEY = 'washing-settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showResetConfirm, setShowResetConfirm] = useState<'settings' | 'all' | false>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Apply dark mode setting
      if (parsedSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSettingChange = (key: keyof Settings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    
    // Update sound manager for sound setting
    if (key === 'notifications' && typeof value === 'boolean') {
      // Notifications are handled separately
    }
    if (key === 'sound' && typeof value === 'boolean') {
      soundManager.setEnabled(value);
    }
    
    // Apply dark mode setting
    if (key === 'darkMode' && typeof value === 'boolean') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      handleSettingChange('notifications', permission === 'granted');
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setShowResetConfirm(false);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setShowResetConfirm(false);
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <main className={`min-h-screen bg-gradient-to-b ${settings.darkMode ? 'from-gray-950 via-gray-900 to-gray-950' : 'from-gray-100 via-gray-50 to-gray-100'} ${settings.darkMode ? 'text-white' : 'text-gray-900'} safe-area-bottom`}>
      <div className="container mx-auto px-4 py-4 pt-6 pb-8 max-w-2xl min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold tracking-wider">SETTINGS</h1>
          <div className="w-6" />
        </header>

        {/* Settings sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Push Notifications</p>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notificationPermission === 'granted' 
                      ? 'Enabled' 
                      : notificationPermission === 'denied'
                        ? 'Blocked by browser'
                        : 'Not enabled'
                    }
                  </p>
                </div>
                {notificationPermission === 'default' ? (
                  <button
                    onClick={handleRequestNotificationPermission}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enable
                  </button>
                ) : (
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    disabled={notificationPermission === 'denied'}
                    className={`
                      w-12 h-6 rounded-full p-1 transition-colors
                      ${settings.notifications && notificationPermission === 'granted' 
                        ? 'bg-cyan-600' 
                        : 'bg-gray-600'
                      }
                      ${notificationPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div
                      className={`
                        w-4 h-4 rounded-full bg-white transition-transform
                        ${settings.notifications && notificationPermission === 'granted' 
                          ? 'translate-x-6' 
                          : 'translate-x-0'
                        }
                      `}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sound & Haptics */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sound & Haptics
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Sound Effects</p>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Play sounds on interactions</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => soundManager.playClick()}
                    className={`px-3 py-1 ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded text-xs transition-colors`}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleSettingChange('sound', !settings.sound)}
                    className={`
                      w-12 h-6 rounded-full p-1 transition-colors
                      ${settings.sound ? 'bg-cyan-600' : 'bg-gray-600'}
                    `}
                  >
                    <div
                      className={`
                        w-4 h-4 rounded-full bg-white transition-transform
                        ${settings.sound ? 'translate-x-6' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Haptic Feedback</p>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vibration on supported devices</p>
                </div>
                <button
                  onClick={() => handleSettingChange('haptic', !settings.haptic)}
                  className={`
                    w-12 h-6 rounded-full p-1 transition-colors
                    ${settings.haptic ? 'bg-cyan-600' : 'bg-gray-600'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full bg-white transition-transform
                      ${settings.haptic ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Use dark theme</p>
                </div>
                <button
                  onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                  className={`
                    w-12 h-6 rounded-full p-1 transition-colors
                    ${settings.darkMode ? 'bg-cyan-600' : 'bg-gray-600'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full bg-white transition-transform
                      ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Default Program */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Default Program
            </h2>
            
            <select
              value={settings.defaultProgram}
              onChange={(e) => handleSettingChange('defaultProgram', e.target.value)}
              className={`w-full ${settings.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
            >
              <option value="cotton">Cotton</option>
              <option value="eco-40-60">Eco 40-60</option>
              <option value="mixed">Mixed</option>
              <option value="synthetics">Synthetics</option>
              <option value="delicates">Delicates</option>
              <option value="quick-wash">Quick Wash</option>
              <option value="heavy-duty">Heavy Duty</option>
              <option value="bedding">Bedding</option>
              <option value="towels">Towels</option>
              <option value="baby-care">Baby Care</option>
              <option value="rinse-spin">Rinse + Spin</option>
              <option value="spin-only">Spin Only</option>
              <option value="tub-clean">Tub Clean</option>
            </select>
          </div>

          {/* Data Management */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Data Management
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowResetConfirm('settings')}
                className={`w-full px-4 py-3 ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg text-left font-medium transition-colors`}
              >
                Reset Settings
              </button>
              
              <button
                onClick={() => setShowResetConfirm('all')}
                className={`w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-left font-medium transition-colors`}
              >
                Clear All Data
              </button>
            </div>
          </div>

          {/* Offline Status */}
          <div className={`${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-4 border`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className={`font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Offline Ready</p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>App works without internet connection</p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className={`text-center text-sm py-4 ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>Washing Machine Timer v1.0</p>
            <p className="mt-1">Progressive Web App</p>
          </div>
        </div>

        {/* Reset confirmation dialog */}
        {showResetConfirm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <div 
              className={`${settings.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 max-w-sm w-full shadow-2xl border`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={`text-lg font-semibold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                {showResetConfirm === 'all' ? 'Clear all data?' : 'Reset settings?'}
              </h3>
              <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {showResetConfirm === 'all' 
                  ? 'This will permanently delete all settings, history, and timer data.'
                  : 'This will reset all settings to default values.'
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={`flex-1 px-4 py-3 rounded-xl ${settings.darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={showResetConfirm === 'all' ? handleClearAllData : handleResetSettings}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                >
                  {showResetConfirm === 'all' ? 'Clear All' : 'Reset'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}