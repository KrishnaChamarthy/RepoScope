import React from 'react'

const LanguageDistribution = ({ languages }) => {
  // Use provided language data or fallback to placeholder
  const data = languages && languages.length > 0 ? languages : [
    { name: 'Loading...', percentage: 100, color: 'bg-gray-500' }
  ];

  // Color mapping for different languages
  const getLanguageColor = (language) => {
    const colorMap = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'C++': 'bg-red-500',
      'C': 'bg-gray-600',
      'HTML': 'bg-orange-400',
      'CSS': 'bg-blue-400',
      'PHP': 'bg-purple-500',
      'Ruby': 'bg-red-400',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-500',
      'Kotlin': 'bg-purple-600',
      'C#': 'bg-purple-700',
      'Shell': 'bg-green-600'
    };
    return colorMap[language] || 'bg-slate-500';
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4">Languages</h3>
      <div className="space-y-3">
        {data.slice(0, 5).map((lang, index) => (
          <div key={lang.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">{lang.name}</span>
              <span className="text-slate-400">{lang.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`${getLanguageColor(lang.name)} h-2 rounded-full transition-all duration-300`} 
                style={{ width: `${lang.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {(!languages || languages.length === 0) && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <p className="text-yellow-400 text-xs">⚠️ Loading language distribution...</p>
        </div>
      )}
      
      {languages && languages.length > 5 && (
        <div className="mt-3 text-xs text-slate-500">
          +{languages.length - 5} more languages
        </div>
      )}
    </div>
  );
};

export default LanguageDistribution