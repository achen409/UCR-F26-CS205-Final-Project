function Onboarding({ onComplete }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 max-w-lg w-full">
        <h2
          id="onboarding-title"
          className="text-2xl font-bold text-gray-800 mb-3"
        >
          Welcome to Health & Wellness Tracker!
        </h2>
        <p className="text-gray-600 mb-6">
          Take control of your well-being by tracking daily habits
          and understanding your health patterns.
        </p>
        <div className="space-y-4 mb-8">
          {[
            ['😊 Mood', 'Record your mood and personal notes.'],
            ['🌙 Sleep', 'Track your sleep duration and quality.'],
            ['💧 Water', 'Monitor your daily hydration.'],
            ['🏃 Exercise', 'Record physical activity.'],
            ['🍎 Nutrition', 'Keep track of meals and calories.'],
            ['📊 Analytics', 'Understand trends and patterns.'],
          ].map(([title, description]) => (
            <div key={title}>
              <h3 className="font-semibold text-gray-800">
                {title}
              </h3>

              <p className="text-sm text-gray-500">
                {description}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default Onboarding
