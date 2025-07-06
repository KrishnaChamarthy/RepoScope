import { Filter, Search, Zap } from 'lucide-react';
import React from 'react'

const SearchBar = ({ searchQuery, onSearchChange, onSearch, isSearching, showFilters, onToggleFilters }) => (
  <div className="max-w-2xl mx-auto">
    <div className="relative">
      <input
        type="text"
        placeholder="Search functions, classes, or enter repository URL..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-20 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
      />
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-200" aria-hidden="true" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={onToggleFilters}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-2"
        >
          <Filter className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Zap className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>

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

export default SearchBar;