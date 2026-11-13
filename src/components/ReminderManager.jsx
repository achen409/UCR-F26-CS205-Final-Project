import { useEffect, useRef } from 'react'
import { useHealthData } from '../context/HealthDataContext'

function ReminderManager() {
  const {
    settings,
    medications,
  } = useHealthData()

  const moodReminders = settings.moodReminders || []

  const notified = useRef(new Set())

  useEffect(() => {
    function checkReminders() {
      if (!('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const date = now.toLocaleDateString('en-US')
      const time = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
      ].join(':')

      function notify(key, title, body) {
        if (notified.current.has(key)) return
        notified.current.add(key)
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        })
      }

      moodReminders.forEach(reminder => {
        if (reminder === time) {
          notify(
            `mood-${date}-${time}`,
            'Mood Reminder',
            'Take a moment to record how you are feeling.'
          )
        }
      })

      medications
        .filter(m => m.active)
        .forEach(med => {
          if (med.time === time) {
            notify(
              `med-${date}-${med.id}-${time}`,
              'Medication Reminder',
              `Time to take ${med.name} (${med.dosage}).`
            )
          }
        })
    }
    checkReminders()
    const interval = setInterval(checkReminders, 30000)
    return () => clearInterval(interval)
  }, [moodReminders, medications])

  return null
}

export default ReminderManager
