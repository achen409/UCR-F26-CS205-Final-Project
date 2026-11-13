import { useState, useEffect } from 'react'
import { HealthDataProvider, useHealthData } from './context/HealthDataContext'

import MoodTracker from './modules/MoodTracker'
import DailyGraph from './components/DailyGraph'
import WeeklyGraph from './components/WeeklyGraph'
import HistoryView from './components/HistoryView'
import FileManager from './components/FileManager'

import WellnessTrackers from './components/WellnessTrackers'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import SettingsPanel from './components/SettingsPanel'
import Onboarding from './components/Onboarding'
import ReminderManager from './components/ReminderManager'

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { settings, updateSettings } = useHealthData()
  const tabs = [
  ['dashboard', 'Dashboard'],
  ['trackers', 'Trackers'],
  ['analytics', 'Analytics'],
  ['history', 'History'],
  ['data', 'Data'],
  ['settings', 'Settings'],
]

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = settings.theme || 'light'
    root.dataset.accent = settings.accent || 'indigo'
  }, [settings.theme, settings.accent])

  return (
    <div className="min-h-screen app-background">
      <ReminderManager />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold app-heading mb-2">
            Health & Wellness Tracker
          </h1>
          <p className="app-muted">
            Track your mood, sleep, nutrition, activity, and overall wellness.
          </p>
        </header>
        <nav className="mb-6 border-b app-border overflow-x-auto" aria-label="Main navigation">
          <div className="flex gap-2 min-w-max">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`py-3 px-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent app-muted hover:text-indigo-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodTracker />
              <DailyGraph />
              <WeeklyGraph />
            </div>
            <WellnessTrackers compact />
          </div>
        )}
        {activeTab === 'trackers' && (
          <WellnessTrackers />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
        {activeTab === 'history' && (
          <HistoryView />
        )}
        {activeTab === 'data' && (
          <FileManager />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel />
        )}

      </div>

      {!settings.onboardingComplete && (
        <Onboarding
          onComplete={() => updateSettings({
            onboardingComplete: true,
          })}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <HealthDataProvider>
      <AppContent />
    </HealthDataProvider>
  )
}

export default App
