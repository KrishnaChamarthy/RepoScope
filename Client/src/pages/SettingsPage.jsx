import React, { useState } from 'react';
import { Settings, Bell, Lock, Database, Info } from 'lucide-react';

const SettingsPage = () => {
  // Basic settings state
  const [settings, setSettings] = useState({
    notifications: {
      analysis: true,
      updates: false,
      security: true,
    },
    privacy: {
      shareAnalytics: false,
      publicProfile: true,
    },
    analysis: {
      depth: 'medium',
      cacheResults: true,
      autoAnalyze: false,
    },
  });

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [key]: value }
        : value
    }));

    // Save to localStorage
    const updatedSettings = {
      ...settings,
      [section]: typeof settings[section] === 'object' 
        ? { ...settings[section], [key]: value }
        : value
    };
    localStorage.setItem('repoScope-settings', JSON.stringify(updatedSettings));
  };

  const SettingCard = ({ title, description, children, icon: Icon }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-slate-300 font-medium">{label}</span>
        {description && (
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput = ({ value, onChange, options, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-slate-300 font-medium">{label}</span>
        {description && (
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-purple-500 focus:outline-none min-w-[120px]"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
          <Settings className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Customize your RepoScope experience</p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Notification Settings */}
        <SettingCard 
          title="Notifications"
          description="Control when and how you receive notifications"
          icon={Bell}
        >
          <div className="space-y-1">
            <ToggleSwitch
              label="Analysis Complete"
              description="Get notified when repository analysis finishes"
              enabled={settings.notifications.analysis}
              onChange={(value) => handleSettingChange('notifications', 'analysis', value)}
            />
            <ToggleSwitch
              label="App Updates"
              description="Receive notifications about new features and updates"
              enabled={settings.notifications.updates}
              onChange={(value) => handleSettingChange('notifications', 'updates', value)}
            />
            <ToggleSwitch
              label="Security Alerts"
              description="Important security and privacy notifications"
              enabled={settings.notifications.security}
              onChange={(value) => handleSettingChange('notifications', 'security', value)}
            />
          </div>
        </SettingCard>

        {/* Privacy Settings */}
        <SettingCard 
          title="Privacy & Security"
          description="Manage your privacy and data sharing preferences"
          icon={Lock}
        >
          <div className="space-y-1">
            <ToggleSwitch
              label="Share Anonymous Analytics"
              description="Help improve RepoScope by sharing anonymous usage data"
              enabled={settings.privacy.shareAnalytics}
              onChange={(value) => handleSettingChange('privacy', 'shareAnalytics', value)}
            />
            <ToggleSwitch
              label="Public Profile"
              description="Make your profile and activity visible to other users"
              enabled={settings.privacy.publicProfile}
              onChange={(value) => handleSettingChange('privacy', 'publicProfile', value)}
            />
          </div>
        </SettingCard>

        {/* Analysis Settings */}
        <SettingCard 
          title="Analysis & Performance"
          description="Configure how repositories are analyzed"
          icon={Database}
        >
          <div className="space-y-1">
            <SelectInput
              label="Analysis Depth"
              description="Higher depth provides more detailed insights but takes longer to complete"
              value={settings.analysis.depth}
              onChange={(value) => handleSettingChange('analysis', 'depth', value)}
              options={[
                { value: 'shallow', label: 'Shallow (Fast)' },
                { value: 'medium', label: 'Medium (Balanced)' },
                { value: 'deep', label: 'Deep (Thorough)' },
              ]}
            />
            <ToggleSwitch
              label="Cache Results"
              description="Store analysis results locally for faster access"
              enabled={settings.analysis.cacheResults}
              onChange={(value) => handleSettingChange('analysis', 'cacheResults', value)}
            />
            <ToggleSwitch
              label="Auto-analyze on Clone"
              description="Automatically start analysis when you clone a new repository"
              enabled={settings.analysis.autoAnalyze}
              onChange={(value) => handleSettingChange('analysis', 'autoAnalyze', value)}
            />
          </div>
        </SettingCard>
      </div>

      {/* Information Card */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">About Settings</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Settings are automatically saved locally in your browser and will persist between sessions.
              Your privacy settings control how your data is used and shared within the RepoScope platform.
            </p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <button 
          onClick={() => {
            setSettings({
              notifications: { analysis: true, updates: false, security: true },
              privacy: { shareAnalytics: false, publicProfile: true },
              analysis: { depth: 'medium', cacheResults: true, autoAnalyze: false },
            });
            localStorage.removeItem('repoScope-settings');
          }}
          className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200 border border-slate-600"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;