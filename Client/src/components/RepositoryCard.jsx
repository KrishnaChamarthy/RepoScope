import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Star, Folder, Brain } from 'lucide-react';

const RepositoryCard = ({ repo, onSelect }) => {
  const navigate = useNavigate();

  const handleViewFiles = (e) => {
    e.stopPropagation(); // Prevent triggering onSelect when clicking "View Files"
    
    // Extract owner and name from repo.name (assuming format "owner/repo")
    const [owner, name] = repo.name.split('/');
    navigate(`/repo/${owner}/${name}/files`);
  };

  return (
    <div
      onClick={() => onSelect(repo)}
      className="h-full flex flex-col p-6 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer hover:bg-white/10 backdrop-blur-sm"
    >
      {/* Header with title and stars - Fixed height */}
      <div className="flex items-start justify-between mb-4 min-h-[2rem]">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Github className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-white truncate" title={repo.name}>
            {repo.name}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400 flex-shrink-0 ml-2">
          <Star className="w-4 h-4" />
          <span className="text-sm">{repo.stars?.toLocaleString() ?? 0}</span>
        </div>
      </div>
      
      {/* Description - Fixed height with clamp */}
      <div className="mb-4 h-10">
        <p className="text-slate-300 text-sm line-clamp-2 leading-5">
          {repo.description || 'No description available'}
        </p>
      </div>
      
      
      
      {/* Language, updated, complexity - Fixed spacing */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-purple-400 truncate">{repo.language || 'Unknown'}</span>
          <span className="text-slate-400 text-xs truncate">{repo.lastUpdated || 'Unknown'}</span>
        </div>
        <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ml-2 ${
          repo.complexity === 'High' ? 'bg-red-500/20 text-red-400' :
          repo.complexity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {repo.complexity || 'Unknown'}
        </span>
      </div>

      {/* Stats - Fixed height */}
      <div className="flex items-center space-x-4 text-slate-400 text-xs mb-4 h-4">
        <span>Forks: {repo.forks ?? 0}</span>
        <span>Issues: {repo.issues ?? 0}</span>
      </div>

      {/* View Files Button - Always at bottom */}
      <div className="mt-auto">
        <button
          onClick={handleViewFiles}
          className="w-full px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center space-x-2"
        >
          <Folder className="w-4 h-4" />
          <span>View Files</span>
        </button>
      </div>
    </div>
  );
};

export default RepositoryCard;