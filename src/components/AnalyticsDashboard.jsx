import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useHealthData } from '../context/HealthDataContext'

function AnalyticsDashboard() {
  const {
    moodEntries,
    sleepEntries,
    waterEntries,
    exerciseEntries,
    goals,
  } = useHealthData()

  const [range, setRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const dailyData = useMemo(() => {
    const today = new Date()
    let start = new Date(today)

    if (startDate) {
      start = new Date(`${startDate}T00:00:00`)
    } else if (range === 'year') {
      start = new Date(today.getFullYear(), 0, 1)
    } else if (range === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1)
    } else {
      start.setDate(today.getDate() - 29)
    }

    let end = endDate ? new Date(`${endDate}T23:59:59`) : today

    if (end < start) end = new Date(start)

    const result = []

    const cursor = new Date(start)
    let count = 0

    while (cursor <= end && count < 400) {
      const date = cursor.toLocaleDateString('en-US')

      const moods = moodEntries.filter(e => e.date === date)
      const sleeps = sleepEntries.filter(e => e.date === date)

      const average = entries =>
        entries.length
          ? entries.reduce((sum, e) => sum + e.value, 0) / entries.length
          : null

      const moodAverage = average(moods.map(e => ({ value: e.mood })))
      const sleepAverage = average(sleeps.map(e => ({ value: e.hours })))
      const water = waterEntries
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.amount, 0)
      const exercise = exerciseEntries
        .filter(e => e.date === date)
        .reduce((sum, e) => sum + e.duration, 0)

      result.push({
        date,
        label: cursor.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        mood: moodAverage === null ? null : Number(moodAverage.toFixed(2)),
        sleep: sleepAverage === null ? null : Number(sleepAverage.toFixed(2)),
        water,
        exercise,
      })

      cursor.setDate(cursor.getDate() + 1)
      count++
    }

    return result
  }, [
    moodEntries,
    sleepEntries,
    waterEntries,
    exerciseEntries,
    range,
    startDate,
    endDate,
  ])

  const stats = useMemo(() => {
    const moodDays = dailyData.filter(d => d.mood !== null)
    const averageMood = moodDays.length
      ? moodDays.reduce((sum, d) => sum + d.mood, 0) / moodDays.length
      : 0
    const best = [...moodDays].sort((a, b) => b.mood - a.mood)[0]
    const worst = [...moodDays].sort((a, b) => a.mood - b.mood)[0]

    return {
      averageMood: averageMood.toFixed(2),
      best: best?.date || 'N/A',
      worst: worst?.date || 'N/A',
      loggedDays: moodDays.length,
    }
  }, [dailyData])

  const correlation = useMemo(() => {
    const paired = dailyData.filter(
      d => d.mood !== null && d.sleep !== null
    )

    if (paired.length < 2) return null

    const meanMood = paired.reduce((s, d) => s + d.mood, 0) / paired.length
    const meanSleep = paired.reduce((s, d) => s + d.sleep, 0) / paired.length
    const numerator = paired.reduce((s, d) => s + (d.mood - meanMood) * (d.sleep - meanSleep), 0)
    const moodVariance = paired.reduce((s, d) => s + (d.mood - meanMood) ** 2, 0)
    const sleepVariance = paired.reduce((s, d) => s + (d.sleep - meanSleep) ** 2, 0)
    const denominator = Math.sqrt(moodVariance * sleepVariance)

    if (denominator === 0) return null
    return {
      value: numerator / denominator,
      count: paired.length,
    }
  }, [dailyData])

  const streak = useMemo(() => {
    const loggedDates = new Set(moodEntries.map(e => {
      const [month, day, year] = e.date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }))

    let count = 0
    const date = new Date()

    const today = date.toLocaleDateString('en-US')
    const [m, d, y] = today.split('/')
    const todayKey = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`

    if (!loggedDates.has(todayKey)) {
      date.setDate(date.getDate() - 1)
    }

    while (true) {
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
      if (!loggedDates.has(key)) break
      count++
      date.setDate(date.getDate() - 1)
    }

    return count
  }, [moodEntries])

  const goalStats = useMemo(() => {
    const completed = dailyData.filter(d =>
      (d.sleep ?? 0) >= goals.sleep ||
      d.water >= goals.water ||
      d.exercise >= goals.exercise
    ).length

    return {
      completed,
      total: dailyData.length,
    }
  }, [dailyData, goals])

  const heatmap = useMemo(() => {
    const result = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US')
      const entries = moodEntries.filter(e => e.date === dateStr)
      const avg = entries.length
        ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length
        : 0

      result.push({
        date: dateStr,
        mood: avg,
      })
    }

    return result
  }, [moodEntries])

  function moodColor(value) {
    if (!value) return 'bg-gray-200'
    if (value < 2) return 'bg-red-300'
    if (value < 3) return 'bg-orange-300'
    if (value < 4) return 'bg-yellow-300'
    if (value < 4.5) return 'bg-green-300'
    return 'bg-green-600'
  }

  const card = (title, value, description) => (
    <div className="bg-white p-5 rounded-lg shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-indigo-600 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Explore your health and wellness trends.
        </p>
      </div>
      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-3">
          Date Range
        </h3>
        <div className="flex flex-wrap gap-3">
          <select
            value={range}
            onChange={e => {
              setRange(e.target.value)
              setStartDate('')
              setEndDate('')
            }}
            className="border rounded-lg p-2"
            aria-label="Analytics date range"
          >
            <option value="week">Last 30 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <label className="text-sm">
            Start
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="block border rounded p-2"
            />
          </label>

          <label className="text-sm">
            End
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="block border rounded p-2"
            />
          </label>

          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="text-indigo-600 text-sm"
          >
            Reset
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card('Average Mood', stats.averageMood, 'Out of 5')}
        {card('Mood Streak', `${streak} days`, 'Consecutive days logged')}
        {card('Best Day', stats.best, 'Highest average mood')}
        {card('Worst Day', stats.worst, 'Lowest average mood')}
      </div>

      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-4">
          Mood & Sleep Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis yAxisId="mood" domain={[1, 5]} />
            <YAxis yAxisId="sleep" orientation="right" domain={[0, 12]} />
            <Tooltip />
            <Line
              yAxisId="mood"
              dataKey="mood"
              stroke="#6366f1"
              connectNulls
              name="Average Mood"
            />
            <Line
              yAxisId="sleep"
              dataKey="sleep"
              stroke="#10b981"
              connectNulls
              name="Sleep Hours"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-4">
          Daily Water & Exercise
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="water" fill="#0ea5e9" name="Water (ml)" />
            <Bar dataKey="exercise" fill="#10b981" name="Exercise (min)" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-3">
          Sleep and Mood Correlation
        </h3>
        {correlation ? (
          <>
            <p className="text-3xl font-bold text-indigo-600">
              {correlation.value.toFixed(3)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Pearson correlation coefficient based on {correlation.count} days
              with both sleep and mood records.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Positive values indicate that higher sleep duration tends to
              accompany higher mood scores. Correlation does not establish causation.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            At least two days with both mood and sleep records are needed.
          </p>
        )}
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-3">
          Goal Consistency
        </h3>
        <p className="text-2xl font-bold text-indigo-600">
          {goalStats.completed} / {goalStats.total}
        </p>
        <p className="text-sm text-gray-500">
          Days where at least one goal was achieved.
        </p>
      </section>

      <section className="bg-white rounded-lg shadow p-5">
        <h3 className="font-semibold text-lg mb-4">
          Mood Calendar
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          Last 365 days. Hover over a day to see its average mood.
        </p>
        <div className="grid grid-cols-7 sm:grid-cols-[repeat(26,minmax(0,1fr))] gap-1">
          {heatmap.map((day, i) => (
            <div
              key={i}
              title={`${day.date}: ${
                day.mood ? day.mood.toFixed(1) : 'No mood logged'
              }`}
              aria-label={`${day.date}, mood ${
                day.mood || 'not logged'
              }`}
              className={`aspect-square rounded-sm ${moodColor(day.mood)}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-4">
          <span>No entry</span>
          <span className="text-red-500">Very low</span>
          <span className="text-orange-500">Low</span>
          <span className="text-yellow-600">Neutral</span>
          <span className="text-green-600">Good</span>
          <span className="text-green-800">Excellent</span>
        </div>
      </section>
    </div>
  )
}

export default AnalyticsDashboard
