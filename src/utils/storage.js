const STORAGE_KEY = 'healthTrackingData'
const FILE_HANDLE_KEY = 'healthTrackingFileHandle'

export const DEFAULT_DATA = {
  moodEntries: [],
  sleepEntries: [],
  waterEntries: [],
  exerciseEntries: [],
  mealEntries: [],
  medications: [],
  medicationLogs: [],
  journalEntries: [],
  goals: {
    sleep: 8,
    water: 2000,
    exercise: 30,
  },
  settings: {
    theme: 'light',
    accent: 'indigo',
    language: 'en',
    onboardingComplete: false,
    moodReminders: [],
  },
}

export function normalizeData(data = {}) {
  return {
    ...DEFAULT_DATA,
    ...data,
    moodEntries: Array.isArray(data.moodEntries)
      ? data.moodEntries : [],
    sleepEntries: Array.isArray(data.sleepEntries)
      ? data.sleepEntries : [],
    waterEntries: Array.isArray(data.waterEntries)
      ? data.waterEntries : [],
    exerciseEntries: Array.isArray(data.exerciseEntries)
      ? data.exerciseEntries : [],
    mealEntries: Array.isArray(data.mealEntries)
      ? data.mealEntries : [],
    medications: Array.isArray(data.medications)
      ? data.medications : [],
    medicationLogs: Array.isArray(data.medicationLogs)
      ? data.medicationLogs : [],
    journalEntries: Array.isArray(data.journalEntries)
      ? data.journalEntries : [],
    goals: {
      ...DEFAULT_DATA.goals,
      ...(data.goals || {}),
    },
    settings: {
      ...DEFAULT_DATA.settings,
      ...(data.settings || {}),
    },
  }
}

export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) { return normalizeData(JSON.parse(stored)) }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return normalizeData()
}

export function saveData(data) {
  try {
    const normalized = Array.isArray(data) ? normalizeData({ moodEntries: data }) : normalizeData(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function saveFileHandleInfo(fileHandle) {
  const info = { name: fileHandle.name, kind: fileHandle.kind }
  localStorage.setItem(FILE_HANDLE_KEY, JSON.stringify(info))
}

export function getFileHandleInfo() {
  try {
    const stored = localStorage.getItem(FILE_HANDLE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}
