import { Github, Star } from 'lucide-react';
import React from 'react'

const RepositoryCard = ({ repo, onSelect }) => (
  <div
    onClick={() => onSelect(repo)}
    className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer hover:bg-white/10 backdrop-blur-sm"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Github className="w-5 h-5 text-slate-400" />
        <span className="font-medium text-white">{repo.name}</span>
      </div>
      <div className="flex items-center space-x-1 text-slate-400">
        <Star className="w-4 h-4" />
        <span className="text-sm">{repo.stars.toLocaleString()}</span>
      </div>
    </div>
    
    <p className="text-slate-300 text-sm mb-4 line-clamp-2">
      {repo.description}
    </p>
    
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-4">
        <span className="text-purple-400">{repo.language}</span>
        <span className="text-slate-400">{repo.lastUpdated}</span>
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        repo.complexity === 'High' ? 'bg-red-500/20 text-red-400' :
        repo.complexity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-green-500/20 text-green-400'
      }`}>
        {repo.complexity}
      </span>
    </div>

    {/* Add these where you want to display them */}
    <div className="flex items-center space-x-3 text-slate-400 text-xs">
      <span>Forks: {repo.forks}</span>
      <span>Issues: {repo.issues}</span>
    </div>
  </div>
);


export default RepositoryCard