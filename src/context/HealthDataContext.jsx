import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { loadData, saveData, normalizeData, saveFileHandleInfo, getFileHandleInfo } from '../utils/storage'
import { createFile, openFile, writeFile, readFile } from '../utils/fileOperations'

const HealthDataContext = createContext()

export function HealthDataProvider({ children }) {
  const [healthData, setHealthData] = useState(loadData)
  const [isLoaded, setIsLoaded] = useState(false)
  const [fileHandle, setFileHandle] = useState(null)
  const [fileStatus, setFileStatus] = useState('none')
  const fileHandleRef = useRef(null)

  useEffect(() => {
    async function initialize() {
      const loaded = loadData()
      setHealthData(loaded)
      setIsLoaded(true)

      const handleInfo = getFileHandleInfo()

      if (handleInfo && 'showOpenFilePicker' in window) {
        const handle = await openFile()

        if (handle) {
          fileHandleRef.current = handle
          setFileHandle(handle)
          const fileData = await readFile(handle)

          if (fileData) {
            const normalized = normalizeData(fileData)

            const fileDate = fileData.lastSaved ? new Date(fileData.lastSaved) : null

            const storageDate = loaded.moodEntries.length > 0 ? new Date(Math.max(loaded.moodEntries.map(e => e.id))) : null

            if (!storageDate || (fileDate && fileDate > storageDate)) {
              setHealthData(normalized)
              saveData(normalized)
            }
          }
        }
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    saveData(healthData)
    saveToFile()
  }, [healthData, isLoaded])

  async function saveToFile() {
    const handle = fileHandleRef.current
    if (!handle) return

    setFileStatus('saving')

    const success = await writeFile(handle, {
      ...healthData,
      lastSaved: new Date().toISOString(),
    })

    if (success) {
      setFileStatus('saved')
      setTimeout(() => setFileStatus('none'), 2000)
    } else {
      setFileStatus('error')
      setTimeout(() => setFileStatus('none'), 3000)
    }
  }

  async function setupFileHandle() {
    const handle = await createFile()

    if (handle) {
      fileHandleRef.current = handle
      setFileHandle(handle)

      saveFileHandleInfo(handle)

      await writeFile(handle, {
        ...healthData,
        lastSaved: new Date().toISOString(),
      })

      return true
    }

    return false
  }

  async function loadFromFile() {
    const handle = await openFile()

    if (handle) {
      fileHandleRef.current = handle
      setFileHandle(handle)

      saveFileHandleInfo(handle)

      const data = await readFile(handle)

      if (data) {
        setHealthData(normalizeData(data))
        return true
      }
    }

    return false
  }

  function addEntry(collection, entry) {
    setHealthData(prev => ({
      ...prev,
      [collection]: [...prev[collection], entry],
    }))
  }

  function deleteEntry(collection, id) {
    setHealthData(prev => ({
      ...prev,
      [collection]: prev[collection].filter(
        entry => entry.id !== id
      ),
    }))
  }

  const addMoodEntry = entry => addEntry('moodEntries', entry)

  const deleteMoodEntry = id => deleteEntry('moodEntries', id)

  function updateSettings(updates) {
    setHealthData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }))
  }

  function updateGoals(updates) {
    setHealthData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        ...updates,
      },
    }))
  }

  function setAllData(data) {
    const normalized = Array.isArray(data)
      ? normalizeData({ moodEntries: data })
      : normalizeData(data)

    setHealthData(normalized)
  }

  function exportData() {
    return JSON.stringify({
      ...healthData,
      exportedAt: new Date().toISOString(),
    }, null, 2)
  }

  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)

      if (
        data &&
        typeof data === 'object' &&
        !Array.isArray(data) &&
        (
          Array.isArray(data.moodEntries) ||
          Array.isArray(data.sleepEntries) ||
          Array.isArray(data.waterEntries)
        )
      ) {
        setAllData(data)
        return true
      }

      return false
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  return (
    <HealthDataContext.Provider
      value={{
        ...healthData,

        healthData,

        addEntry,
        deleteEntry,

        addMoodEntry,
        deleteMoodEntry,

        updateSettings,
        updateGoals,

        exportData,
        importData,
        setAllData,

        setupFileHandle,
        loadFromFile,

        fileHandle,
        fileStatus,
      }}
    >
      {children}
    </HealthDataContext.Provider>
  )
}

export function useHealthData() {
  const context = useContext(HealthDataContext)

  if (!context) {
    throw new Error(
      'useHealthData must be used within HealthDataProvider'
    )
  }

  return context
}
