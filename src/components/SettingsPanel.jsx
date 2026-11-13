import { useState } from 'react'
import { useHealthData } from '../context/HealthDataContext'

function SettingsPanel() {
  const { settings, updateSettings } = useHealthData()

  const [reminderTime, setReminderTime] = useState('20:00')

  const colors = [
    { id: 'indigo', label: 'Indigo' },
    { id: 'blue', label: 'Blue' },
    { id: 'green', label: 'Green' },
    { id: 'purple', label: 'Purple' },
    { id: 'rose', label: 'Rose' },
  ]

  function addReminder() {
    if (!reminderTime) return
    const reminders = settings.moodReminders || []
    if (reminders.includes(reminderTime)) return
    updateSettings({
      moodReminders: [...reminders, reminderTime].sort(),
    })
  }

  function removeReminder(time) {
    updateSettings({
      moodReminders: (settings.moodReminders || [])
        .filter(t => t !== time),
    })
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') alert('Notification permission was not granted.')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Settings
      </h2>
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          Appearance
        </h3>
        <label className="flex items-center justify-between gap-3">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={settings.theme === 'dark'}
            onChange={e => updateSettings({
              theme: e.target.checked ? 'dark' : 'light',
            })}
            aria-label="Toggle dark mode"
            className="w-5 h-5"
          />
        </label>
        <div>
          <p className="mb-3 text-sm font-medium">
            Accent Color
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map(color => (
              <button
                key={color.id}
                onClick={() => updateSettings({
                  accent: color.id,
                })}
                aria-pressed={settings.accent === color.id}
                className={`px-4 py-2 rounded-lg border ${
                  settings.accent === color.id
                    ? 'border-indigo-600 ring-2 ring-indigo-300'
                    : 'border-gray-300'
                }`}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          Mood Reminders
        </h3>
        <p className="text-sm text-gray-500">
          Choose times when you would like a reminder to log your mood.
        </p>
        <button onClick={enableNotifications} className="tracker-button">Enable Browser Notifications</button>
        <div className="flex gap-2">
          <input
            type="time"
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
            className="flex-1 border rounded-lg p-2"
          />
          <button onClick={addReminder} className="bg-indigo-600 text-white px-4 rounded-lg">Add</button>
        </div>
        <div className="space-y-2">
          {(settings.moodReminders || []).map(time => (
            <div key={time} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>{time}</span>
              <button onClick={() => removeReminder(time)} className="text-red-500 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white rounded-lg shadow p-6 space-y-3">
        <h3 className="text-lg font-semibold">
          Onboarding
        </h3>
        <p className="text-sm text-gray-500">
          Show the introduction again.
        </p>
        <button
          onClick={() => updateSettings({
            onboardingComplete: false,
          })}
          className="tracker-button"
        >
          Restart Onboarding
        </button>
      </section>
    </div>
  )
}

export default SettingsPanel
