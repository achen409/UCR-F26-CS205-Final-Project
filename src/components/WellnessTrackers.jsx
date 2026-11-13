import { useState } from 'react'
import { useHealthData } from '../context/HealthDataContext'
import { getTodayFormatted } from '../utils/helpers'

function WellnessTrackers({ compact = false }) {
  const {
    sleepEntries,
    waterEntries,
    exerciseEntries,
    mealEntries,
    medications,
    medicationLogs,
    journalEntries,
    goals,
    addEntry,
    deleteEntry,
    updateGoals,
  } = useHealthData()

  const [sleep, setSleep] = useState({
    hours: '',
    quality: '3',
    bedtime: '',
    wakeTime: '',
  })
  const [water, setWater] = useState('')
  const [exercise, setExercise] = useState({
    type: '',
    duration: '',
    calories: '',
  })
  const [meal, setMeal] = useState({
    name: '',
    calories: '',
    type: 'Breakfast',
  })
  const [medication, setMedication] = useState({
    name: '',
    dosage: '',
    time: '',
  })

  const [journal, setJournal] = useState('')
  const [waterGoal, setWaterGoal] = useState(goals.water)
  const [sleepGoal, setSleepGoal] = useState(goals.sleep)
  const [exerciseGoal, setExerciseGoal] = useState(goals.exercise)

  const today = getTodayFormatted()

  const waterToday = waterEntries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0)

  const exerciseToday = exerciseEntries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.duration, 0)

  const caloriesToday = mealEntries
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.calories, 0)

  const sleepToday = sleepEntries
    .filter(e => e.date === today)

  const sleepHoursToday = sleepToday.reduce(
    (sum, e) => sum + e.hours, 0
  )

  function createEntry(collection, values) {
    const now = new Date()

    addEntry(collection, {
      id: Date.now(),
      timestamp: now.toISOString(),
      date: getTodayFormatted(),
      time: now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
      ...values,
    })
  }

  function handleSleep(e) {
    e.preventDefault()

    if (!sleep.hours || Number(sleep.hours) <= 0) return

    createEntry('sleepEntries', {
      hours: Number(sleep.hours),
      quality: Number(sleep.quality),
      bedtime: sleep.bedtime,
      wakeTime: sleep.wakeTime,
    })

    setSleep({
      hours: '',
      quality: '3',
      bedtime: '',
      wakeTime: '',
    })
  }

  function handleWater(e) {
    e.preventDefault()
    if (!water || Number(water) <= 0) return
    createEntry('waterEntries', {
      amount: Number(water),
    })
    setWater('')
  }

  function handleExercise(e) {
    e.preventDefault()
    if (!exercise.type || !exercise.duration) return
    createEntry('exerciseEntries', {
      type: exercise.type,
      duration: Number(exercise.duration),
      calories: Number(exercise.calories || 0),
    })
    setExercise({type: '', duration: '', calories: ''})
  }

  function handleMeal(e) {
    e.preventDefault()
    if (!meal.name || meal.calories === '') return
    createEntry('mealEntries', {
      name: meal.name,
      type: meal.type,
      calories: Number(meal.calories)})
    setMeal({name: '', calories: '', type: 'Breakfast'})
  }

  function handleMedication(e) {
    e.preventDefault()
    if (!medication.name || !medication.dosage || !medication.time) return
    createEntry('medications', {medication, active: true})
    setMedication({name: '', dosage: '', time: '',})
  }

  function handleJournal(e) {
    e.preventDefault()
    if (!journal.trim()) return
    createEntry('journalEntries', {
      content: journal.trim(),
    })
    setJournal('')
  }

  function markMedicationTaken(med) {
    const alreadyTaken = medicationLogs.some(log => log.medicationId === med.id && log.date === today)
    if (alreadyTaken) return
    createEntry('medicationLogs', {
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
    })
  }

  function saveGoals(e) {
    e.preventDefault()
    updateGoals({
      water: Number(waterGoal),
      sleep: Number(sleepGoal),
      exercise: Number(exerciseGoal),
    })
  }

  function section(title, children) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-5 sm:p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {title}
        </h2>
        {children}
      </section>
    )
  }

  function field(label, props) {
    return (
      <label className="block text-sm text-gray-700">
        <span className="block mb-1">{label}</span>
        <input
          {...props}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </label>
    )
  }

  function recentEntries(collection, entries, render) {
    return (
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {entries.slice(-5).reverse().map(entry => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded"
          >
            <div className="min-w-0 text-sm text-gray-700">
              {render(entry)}
              <span className="block text-xs text-gray-500">
                {entry.date} · {entry.time}
              </span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Delete this entry?')) {
                  deleteEntry(collection, entry.id)
                }
              }}
              aria-label="Delete entry"
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {!compact && (
        <h2 className="text-2xl font-bold text-gray-800">
          Wellness Trackers
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {section('🌙 Sleep Tracker',
          <>
            <form onSubmit={handleSleep} className="space-y-3">
              {field('Hours slept', {
                type: 'number',
                min: '0.1',
                max: '24',
                step: '0.1',
                value: sleep.hours,
                onChange: e => setSleep({
                  ...sleep,
                  hours: e.target.value,
                }),
                required: true,
              })}

              <label className="block text-sm text-gray-700">
                Sleep quality
                <select
                  value={sleep.quality}
                  onChange={e => setSleep({
                    ...sleep,
                    quality: e.target.value,
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {field('Bedtime', {
                  type: 'time',
                  value: sleep.bedtime,
                  onChange: e => setSleep({
                    ...sleep,
                    bedtime: e.target.value,
                  }),
                })}

                {field('Wake time', {
                  type: 'time',
                  value: sleep.wakeTime,
                  onChange: e => setSleep({
                    ...sleep,
                    wakeTime: e.target.value,
                  }),
                })}
              </div>

              <button className="tracker-button">
                Save Sleep
              </button>
            </form>

            <p className="text-sm text-gray-600">
              Today: {sleepHoursToday} / {goals.sleep} hours
            </p>

            {recentEntries('sleepEntries', sleepEntries, e =>
              `${e.hours} hours · Quality ${e.quality}/5`
            )}
          </>
        )}

        {section('💧 Water Intake',
          <>
            <p className="text-2xl font-bold text-indigo-600">
              {waterToday} / {goals.water} ml
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full"
                style={{
                  width: `${Math.min(100, waterToday / goals.water * 100)}%`,
                }}
              />
            </div>

            <form onSubmit={handleWater} className="space-y-3">
              {field('Amount (ml)', {
                type: 'number',
                min: '1',
                value: water,
                onChange: e => setWater(e.target.value),
                required: true,
              })}

              <button className="tracker-button">
                Add Water
              </button>
            </form>

            {recentEntries('waterEntries', waterEntries, e =>
              `${e.amount} ml`
            )}
          </>
        )}

        {section('🏃 Exercise Log',
          <>
            <p className="text-sm text-gray-600">
              Today: {exerciseToday} / {goals.exercise} minutes
            </p>

            <form onSubmit={handleExercise} className="space-y-3">
              {field('Workout type', {
                type: 'text',
                placeholder: 'Running, walking, gym...',
                value: exercise.type,
                onChange: e => setExercise({
                  ...exercise,
                  type: e.target.value,
                }),
                required: true,
              })}

              {field('Duration (minutes)', {
                type: 'number',
                min: '1',
                value: exercise.duration,
                onChange: e => setExercise({
                  ...exercise,
                  duration: e.target.value,
                }),
                required: true,
              })}

              {field('Calories burned (optional)', {
                type: 'number',
                min: '0',
                value: exercise.calories,
                onChange: e => setExercise({
                  ...exercise,
                  calories: e.target.value,
                }),
              })}

              <button className="tracker-button">
                Save Workout
              </button>
            </form>

            {recentEntries('exerciseEntries', exerciseEntries, e =>
              `${e.type} · ${e.duration} min · ${e.calories} kcal`
            )}
          </>
        )}

        {section('🍎 Meal & Nutrition',
          <>
            <p className="text-sm text-gray-600">
              Today's calories: {caloriesToday} kcal
            </p>

            <form onSubmit={handleMeal} className="space-y-3">
              {field('Meal name', {
                type: 'text',
                value: meal.name,
                onChange: e => setMeal({
                  ...meal,
                  name: e.target.value,
                }),
                required: true,
              })}

              <label className="block text-sm">
                Meal type
                <select
                  value={meal.type}
                  onChange={e => setMeal({
                    ...meal,
                    type: e.target.value,
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </label>

              {field('Calories (kcal)', {
                type: 'number',
                min: '0',
                value: meal.calories,
                onChange: e => setMeal({
                  ...meal,
                  calories: e.target.value,
                }),
                required: true,
              })}

              <button className="tracker-button">
                Save Meal
              </button>
            </form>

            {recentEntries('mealEntries', mealEntries, e =>
              `${e.type}: ${e.name} · ${e.calories} kcal`
            )}
          </>
        )}

        {section('💊 Medication Reminders',
          <>
            <form onSubmit={handleMedication} className="space-y-3">
              {field('Medication name', {
                type: 'text',
                value: medication.name,
                onChange: e => setMedication({
                  ...medication,
                  name: e.target.value,
                }),
                required: true,
              })}

              {field('Dosage', {
                type: 'text',
                placeholder: 'e.g. 10 mg',
                value: medication.dosage,
                onChange: e => setMedication({
                  ...medication,
                  dosage: e.target.value,
                }),
                required: true,
              })}

              {field('Scheduled time', {
                type: 'time',
                value: medication.time,
                onChange: e => setMedication({
                  ...medication,
                  time: e.target.value,
                }),
                required: true,
              })}

              <button className="tracker-button">
                Add Medication
              </button>
            </form>

            <div className="space-y-2">
              {medications.filter(m => m.active).map(med => {
                const taken = medicationLogs.some(log =>
                  log.medicationId === med.id &&
                  log.date === today
                )

                return (
                  <div key={med.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{med.name}</p>
                    <p className="text-sm text-gray-500">
                      {med.dosage} · {med.time}
                    </p>

                    <div className="flex gap-3 mt-2">
                      <button
                        disabled={taken}
                        onClick={() => markMedicationTaken(med)}
                        className="text-sm text-green-600 disabled:text-gray-400"
                      >
                        {taken ? 'Taken today' : 'Mark as taken'}
                      </button>

                      <button
                        onClick={() => deleteEntry('medications', med.id)}
                        className="text-sm text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {section('📝 Journal',
          <>
            <form onSubmit={handleJournal} className="space-y-3">
              <textarea
                value={journal}
                onChange={e => setJournal(e.target.value)}
                placeholder="Write about your day..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3"
                required
              />

              <button className="tracker-button">
                Save Journal Entry
              </button>
            </form>

            {recentEntries('journalEntries', journalEntries, e =>
              e.content
            )}
          </>
        )}

      </div>

      {!compact && section('🎯 Daily Goals',
        <form onSubmit={saveGoals} className="space-y-3">

          {field('Sleep goal (hours)', {
            type: 'number',
            min: '0.1',
            value: sleepGoal,
            onChange: e => setSleepGoal(e.target.value),
          })}

          {field('Water goal (ml)', {
            type: 'number',
            min: '1',
            value: waterGoal,
            onChange: e => setWaterGoal(e.target.value),
          })}

          {field('Exercise goal (minutes)', {
            type: 'number',
            min: '1',
            value: exerciseGoal,
            onChange: e => setExerciseGoal(e.target.value),
          })}

          <button className="tracker-button">
            Update Goals
          </button>
        </form>
      )}

    </div>
  )
}

export default WellnessTrackers
