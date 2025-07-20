import { Filter, Search, Zap, Download } from 'lucide-react';
import React from 'react'
import { isGitHubUrl } from '../utils/githubUtils';

const SearchBar = ({ searchQuery, onSearchChange, onSearch, isSearching, showFilters, onToggleFilters }) => {
  const isGitHubURL = isGitHubUrl(searchQuery);

  return (
  <div className="max-w-2xl mx-auto">
    <div className="relative">
      <input
        type="text"
        placeholder="Paste GitHub URL to clone..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-20 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-sm md:text-base overflow-hidden"
        style={{ textOverflow: 'ellipsis' }}
      />
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-200" aria-hidden="true" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={onToggleFilters}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-1"
          title="Toggle Filters"
        >
          <Filter className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={onSearch}
          disabled={isSearching}
          className={`px-4 md:px-6 py-2 text-white rounded-lg transition-all disabled:opacity-50 text-sm ${
            isGitHubURL 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          }`}
          title={isGitHubURL ? "Clone Repository" : "Search"}
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isGitHubURL ? (
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Clone</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </div>
          )}
        </button>
      </div>
    </div>
    
    {isGitHubURL && (
      <div className="mt-3 text-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400 border border-green-500/30">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          GitHub repository detected - Click to clone and analyze
        </span>
      </div>
    )}

    {showFilters && (
      <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option>All Languages</option>
              <option>Python</option>
              <option>JavaScript</option>
              <option>TypeScript</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Complexity</label>
            <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option>All Levels</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white">
              <option>All Types</option>
              <option>Functions</option>
              <option>Classes</option>
              <option>Variables</option>
            </select>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default SearchBar;