import { BookOpen, Brain, FileText, Lightbulb, Play } from 'lucide-react';
import React from 'react'

const SearchResult = ({ result }) => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all backdrop-blur-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          result.type === 'function' ? 'bg-blue-500/20 text-blue-400' :
          result.type === 'class' ? 'bg-purple-500/20 text-purple-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {result.type === 'function' ? <Play className="w-4 h-4" /> :
           result.type === 'class' ? <BookOpen className="w-4 h-4" /> :
           <FileText className="w-4 h-4" />}
        </div>
        <div>
          <h4 className="font-medium text-white">{result.name}</h4>
          <p className="text-slate-400 text-sm">{result.file}:{result.line}</p>
        </div>
      </div>
      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Brain className="w-5 h-5 text-purple-400" />
      </button>
    </div>
    
    <p className="text-slate-300 mb-4">{result.description}</p>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-slate-400">AI Insight:</span>
        <span className="text-sm text-slate-300">{result.aiExplanation}</span>
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        result.complexity === 'High' ? 'bg-red-500/20 text-red-400' :
        result.complexity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-green-500/20 text-green-400'
      }`}>
        {result.complexity}
      </span>
    </div>
  </div>
);

export default SearchResult