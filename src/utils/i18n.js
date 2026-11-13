const translations = {
  en: {
    title: 'Health & Wellness Tracker',
    dashboard: 'Dashboard',
    trackers: 'Trackers',
    analytics: 'Analytics',
    history: 'History',
    data: 'Data Management',
    settings: 'Settings',
    welcome: 'Welcome to Health & Wellness Tracker!',
    getStarted: 'Get Started',
    mood: 'Mood',
    sleep: 'Sleep',
    water: 'Water',
    exercise: 'Exercise',
    nutrition: 'Nutrition',
    journal: 'Journal',
    goals: 'Daily Goals',
    save: 'Save',
    delete: 'Delete',
  },

  es: {
    title: 'Seguimiento de Salud y Bienestar',
    dashboard: 'Panel',
    trackers: 'Registros',
    analytics: 'Análisis',
    history: 'Historial',
    data: 'Gestión de Datos',
    settings: 'Configuración',
    welcome: '¡Bienvenido a Salud y Bienestar!',
    getStarted: 'Comenzar',
    mood: 'Estado de ánimo',
    sleep: 'Sueño',
    water: 'Agua',
    exercise: 'Ejercicio',
    nutrition: 'Nutrición',
    journal: 'Diario',
    goals: 'Objetivos diarios',
    save: 'Guardar',
    delete: 'Eliminar',
  },
}

export function t(key, language = 'en') {
  return translations[language]?.[key] ||
    translations.en[key] ||
    key
}
