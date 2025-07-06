import React from 'react'

const LanguageDistribution = () => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
    <h3 className="text-xl font-bold text-white mb-4">Languages</h3>
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">Python</span>
          <span className="text-slate-400">67%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '67%' }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">C++</span>
          <span className="text-slate-400">23%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">JavaScript</span>
          <span className="text-slate-400">10%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '10%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

export default LanguageDistribution